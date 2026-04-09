import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK1, Topic } from "../../writing/writing-descriptors";
import { getSupabase } from "../../lib/supabase";
import { calculateDiagnosedLevel, buildJudgeBPrompt, reconcileVerdicts, identifyProbeTargets, buildProbePrompt, MAX_PROBE_EXCHANGES, identifyElicitationTargets, buildElicitationPrompt, MAX_ELICITATION_EXCHANGES, ElicitationTarget } from "../../writing/diagnosis-utils";
import { buildLanguageAnalysisPrompt } from "../../writing/language-rubric";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "assistant" | "user";
  content: string;
  stage?: number;
};


// ─────────────────────────────────────────────────────────────────────────────
// STAGE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const STAGES = {
  IDENTITY:        0,
  DESCRIPTION:     1,
  EXPERIENCE:      2,
  OPINION_REASON:  3,
  THREAD_FOLLOWUP: 4,
  MISINTERPRET:    5,
} as const;

type Stage = typeof STAGES[keyof typeof STAGES];


// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE ANALYSIS
//
// Analyses the candidate's last message for communicative substance.
// Used to gate stage advancement and trigger ceiling detection.
//
// "Weak" means: not enough communicative content to count as evidence
// for the current stage. This gates whether the stage advances or holds.
//
// Key principle: a response is substantive if it COMMUNICATES something —
// not just whether it contains a reasoning word like "because."
// "I went to Paris last summer and the food was incredible" is strong
// evidence even without explicit reasoning.
// ─────────────────────────────────────────────────────────────────────────────

// Common filler responses that look like answers but carry no real content
const FILLER_PATTERNS = /^\s*(yes|no|ok|okay|yeah|sure|i think so|i don't know|i dont know|maybe|i agree|i disagree|that's right|it's good|it's nice|i like it|not really|i'm not sure|thank you|thanks)\s*[.!?]?\s*$/i;

function analyseResponse(text: string) {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const length = words.length;

  // Any clause connector — shows the candidate is building structure,
  // not just giving a one-clause answer
  const hasConnector = /(and|but|because|so|since|although|however|when|if|while|though|after|before|then|also|or)/i.test(trimmed);

  // Reasoning specifically (subset of connectors)
  const hasReason = /(because|so|since|that's why|therefore|which is why|the reason)/i.test(trimmed);

  // Detail: enough words to contain real content
  const hasDetail = length > 7;

  // Filler: matches a stock phrase with no real information
  const isFiller = FILLER_PATTERNS.test(trimmed);

  // ── isWeak logic ──
  // Under 4 words: almost always too short (but fine for IDENTITY stage —
  //   stage logic handles that separately)
  // 4-7 words without any connector: bare minimum, probably not enough
  // 8+ words: enough content to constitute evidence
  // Filler: weak regardless of length
  // Any connector present: shows clause-building, not weak
  const isWeak = isFiller || length < 4 || (length < 8 && !hasConnector);

  return {
    length,
    hasReason,
    hasDetail,
    hasConnector,
    isVeryShort: length < 4,
    isWeak,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION TAGGING
//
// Returns the communicative function being targeted at each stage.
// Used for debug logging and potential function coverage tracking.
// ─────────────────────────────────────────────────────────────────────────────

function getTargetFunction(stage: Stage): string {
  switch (stage) {
    case STAGES.IDENTITY:
    case STAGES.DESCRIPTION:
    case STAGES.EXPERIENCE:
      return "informing";
    case STAGES.OPINION_REASON:
      return "informing + reasoning";
    case STAGES.THREAD_FOLLOWUP:
    case STAGES.MISINTERPRET:
      return "interaction";
    default:
      return "unknown";
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// STAGE ADVANCEMENT LOGIC (route-controlled, performance-gated)
//
// Stage does NOT advance automatically.
// A weak response holds the stage. Two consecutive weak responses
// jump to MISINTERPRET (ceiling probe).
// ─────────────────────────────────────────────────────────────────────────────

// Maximum exchanges allowed in OPINION_REASON before moving on.
// If the candidate can't produce reasoning after 2 attempts,
// that IS the diagnostic signal — they can't do B1 reasoning.
const MAX_OPINION_EXCHANGES = 2;

function computeNextStage(
  currentStage: Stage,
  exchangeCount: number,
  analysis: ReturnType<typeof analyseResponse>,
  struggleCount: number,
  stageExchangeCount: number
): Stage {

  // Stay in stage if weak but not yet at ceiling threshold
  if (analysis.isWeak && struggleCount < 2) {
    return currentStage;
  }

  // Two consecutive weak responses → jump to ceiling probe
  if (struggleCount >= 2) {
    return STAGES.MISINTERPRET;
  }

  // Normal progression — IDENTITY exits after exchange 1 (name + location/work)
  if (currentStage === STAGES.IDENTITY) {
    return exchangeCount >= 1 ? STAGES.DESCRIPTION : STAGES.IDENTITY;
  }
  if (currentStage === STAGES.DESCRIPTION)     return STAGES.EXPERIENCE;
  if (currentStage === STAGES.EXPERIENCE)      return STAGES.OPINION_REASON;

  // OPINION_REASON: move on after MAX_OPINION_EXCHANGES even if no reasoning produced.
  // A candidate who gives opinions without reasons after 2 attempts can't do B1.
  if (currentStage === STAGES.OPINION_REASON) {
    return (analysis.hasReason || stageExchangeCount >= MAX_OPINION_EXCHANGES)
      ? STAGES.THREAD_FOLLOWUP
      : STAGES.OPINION_REASON;
  }

  if (currentStage === STAGES.THREAD_FOLLOWUP) return STAGES.MISINTERPRET;

  return STAGES.MISINTERPRET;
}


// ─────────────────────────────────────────────────────────────────────────────
// TOPIC SELECTION
// ─────────────────────────────────────────────────────────────────────────────

function pickRandomTopic(): Topic {
  const idx = Math.floor(Math.random() * WRITING_TASK1.topics.length);
  return WRITING_TASK1.topics[idx];
}


// ─────────────────────────────────────────────────────────────────────────────
// STAGE INSTRUCTION BUILDER
//
// Every stage now includes an ADAPTIVITY RULE block that instructs the model
// to probe rather than advance when a weak response is detected.
// The opinion stage enforces a mandatory "why" follow-up.
// The misinterpret stage is tightly scoped to avoid absurd misreadings.
// ─────────────────────────────────────────────────────────────────────────────

function buildStageInstruction(
  stage: Stage,
  exchangeCount: number,
  topic: Topic,
  messages: Message[],
  analysis: ReturnType<typeof analyseResponse>,
  struggleCount: number
): string {

  const lastCandidateMsg = [...messages]
    .reverse()
    .find((m) => m.role === "user")?.content ?? "";

  // Shared adaptivity rule prepended to all stages
  const adaptivityRule =
    "\nADAPTIVITY RULE:\n" +
    "If the candidate's last response was short or weak (under ~10 words, no reasoning, no detail):\n" +
    "- Do NOT move to a new topic or a harder question.\n" +
    "- Ask them to expand, explain, or clarify what they just said.\n" +
    "- Use natural follow-up language:\n" +
    "  'Can you tell me a bit more about that?'\n" +
    "  'Why do you think that?'\n" +
    "  'Can you explain that in more detail?'\n" +
    "- Only move forward when the candidate has given a substantive response.\n";

  switch (stage) {

    case STAGES.IDENTITY:
      if (exchangeCount === 0) {
        return (
          "\n\nSTAGE: IDENTITY — Exchange 0.\n" +
          "Greet warmly. Ask for their name only. One sentence greeting + one question.\n" +
          "Do not ask anything else. Add <ceiling>false</ceiling>."
        );
      }
      return (
        "\n\nSTAGE: IDENTITY — Exchange 1 (final identity question).\n" +
        "Ask TWO short things in one natural sentence: where they are from, and what they do (work or study).\n" +
        "Use simple words. Example: 'Where are you from, and do you work or study?'\n" +
        "Keep it under 12 words. Add <ceiling>false</ceiling>."
      );

    case STAGES.DESCRIPTION:
      return (
        "\n\nSTAGE: DESCRIPTION — Exchange " + exchangeCount + ".\n" +
        adaptivityRule +
        "Ask the candidate to describe something familiar connected to what they told you — their job, city, or daily life.\n" +
        "Do NOT introduce the session topic yet.\n" +
        "The question must require an entity + at least one attribute or detail.\n" +
        "Examples: 'Tell me something you like about your city.' / 'Describe a place you enjoy going to.'\n" +
        "Avoid yes/no questions.\n" +
        (analysis.isWeak && struggleCount < 2
          ? "The candidate's last response was weak. Ask them to expand on what they said — do not change topic.\n"
          : "") +
        "Add <ceiling>false</ceiling>."
      );

    case STAGES.EXPERIENCE: {
      const demandGuide: Record<string, string> = {
        narrative: "Ask them to tell you a story connected to this topic — what happened, when, where.\n" +
          "The question must require past or future tense.\n" +
          "Examples: 'Tell me about a time you...' / 'What happened when...?'",
        descriptive: "Ask them to describe something connected to this topic — what it looks, feels, or sounds like.\n" +
          "Push for detail beyond one word. 'What is it like?' / 'Describe it for me.'",
        comparative: "Ask them to compare two things connected to this topic.\n" +
          "The question must need more than 'I prefer X'. 'What's the difference between...?'",
        evaluative: "Ask them to judge or assess something connected to this topic.\n" +
          "The question must require an opinion. 'Do you think that's good? Why?'",
        explanatory: "Ask them to explain how or why something works, connected to this topic.\n" +
          "The question must require a process or reason. 'How does that work?' / 'Why is that?'",
      };
      const guide = demandGuide[topic.demand] ?? demandGuide.narrative;

      return (
        "\n\nSTAGE: EXPERIENCE — Exchange " + exchangeCount + ".\n" +
        adaptivityRule +
        "Now introduce the session topic: " + topic.label + ".\n" +
        (topic.openerHint ? "Transition hint: " + topic.openerHint + "\n" : "") +
        guide + "\n" +
        (analysis.isWeak && struggleCount < 2
          ? "The candidate's last response was weak. Ask them to give more detail — do not change topic.\n"
          : "") +
        "Add <ceiling>false</ceiling>."
      );
    }

    case STAGES.OPINION_REASON: {
      const opinionGuide: Record<string, string> = {
        narrative: "Ask them to reflect on the story they told — was it good, bad, would they do it again?",
        descriptive: "Ask them to evaluate what they described — do they like it, would they change it?",
        comparative: "Push the comparison further — ask which is better and WHY.",
        evaluative: "Deepen the evaluation — ask them to justify their position with a reason or example.",
        explanatory: "Ask whether the thing they explained works well, or could be better.",
      };
      const guide = opinionGuide[topic.demand] ?? opinionGuide.evaluative;

      return (
        "\n\nSTAGE: OPINION_REASON — Exchange " + exchangeCount + ".\n" +
        adaptivityRule +
        guide + "\n" +
        "The question must demand an opinion AND a reason — not just a preference.\n" +
        "Avoid knowledge questions. Keep it experience-based.\n\n" +
        "MANDATORY FOLLOW-UP RULE:\n" +
        "If the candidate gave an opinion in their last message WITHOUT a reason or explanation:\n" +
        "→ You MUST ask a 'why' or 'what makes you say that' follow-up before moving on.\n" +
        "→ Do NOT accept a one-sentence opinion as sufficient evidence.\n" +
        "→ Example: 'That's interesting — why do you think that?' or 'What makes you feel that way?'\n" +
        (analysis.isWeak && struggleCount < 2
          ? "The candidate's last response was weak. Ask them to explain their reasoning — do not change topic.\n"
          : "") +
        "Add <ceiling>false</ceiling>."
      );
    }

    case STAGES.THREAD_FOLLOWUP:
      return (
        "\n\nSTAGE: THREAD_FOLLOWUP — Exchange " + exchangeCount + ".\n" +
        adaptivityRule +
        "Reference something specific the candidate said earlier in the conversation.\n" +
        "Connect it to a new question about " + topic.label + ".\n" +
        "You MUST name what they said — do not make a generic question.\n" +
        "Examples: 'Earlier you said [X]. Why do you think that is?' / 'You mentioned [X] — does that affect how you feel about [Y]?'\n" +
        `The candidate's last message: "${lastCandidateMsg.slice(0, 120)}"\n` +
        (analysis.isWeak && struggleCount < 2
          ? "The candidate's last response was weak. Ask them to elaborate on what they mentioned — do not introduce a new thread.\n"
          : "") +
        "Add <ceiling>false</ceiling>."
      );

    case STAGES.MISINTERPRET:
      return (
        "\n\nSTAGE: MISINTERPRET — Exchange " + exchangeCount + " (final probe).\n" +
        "Take something the candidate said and rephrase it slightly incorrectly or oversimplify it.\n" +
        "Then ask them to confirm or correct your understanding.\n\n" +
        "RULES FOR MISINTERPRETATION:\n" +
        "- The misinterpretation must be PLAUSIBLE — not absurd or confusing.\n" +
        "- Do NOT invent new information. Stay close to their actual words.\n" +
        "- Do NOT exaggerate. A mild twist is enough.\n" +
        "- Good: 'So you think simple food is always better than complex food?'\n" +
        "- Bad: 'So you hate all restaurants?'\n\n" +
        "This should create an opportunity for the candidate to:\n" +
        "- Clarify what they actually meant\n" +
        "- Correct the misreading\n" +
        "- Add nuance to their earlier statement\n\n" +
        `The candidate's last message: "${lastCandidateMsg.slice(0, 120)}"\n` +
        "Add <ceiling>true</ceiling>."
      );

    default:
      return (
        "\n\nExchange " + exchangeCount + ". Continue probing " + topic.label + ".\n" +
        "Add <ceiling>true</ceiling>."
      );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// PERCEIVED LEVEL TIER
// Based on how the candidate is performing, pick low / mid / high framing.
// ─────────────────────────────────────────────────────────────────────────────

function getPerceivedTier(stage: Stage, struggleCount: number, exchangeCount: number, messages: Message[]): "low" | "mid" | "high" {
  // Extract candidate messages only (skip the first exchange which is just greeting/name)
  const candidateMsgs = messages
    .filter((m) => m.role === "user")
    .slice(1); // skip name/identity response

  // Not enough data yet — default to low (safe starting point)
  if (candidateMsgs.length === 0) return "low";

  // ── Linguistic signals from candidate's actual writing ──

  const allText = candidateMsgs.map((m) => m.content).join(" ");
  const words = allText.split(/\s+/).filter((w) => w.length > 0);
  const totalWords = words.length;

  // Average words per message
  const avgWordsPerMsg = totalWords / candidateMsgs.length;

  // Subordinate clause markers (because, although, if, when, while, since, however, though)
  const subordinatePattern = /\b(because|although|if|when|while|since|however|though|unless|whereas|even though|so that|in order to)\b/gi;
  const subordinateCount = (allText.match(subordinatePattern) || []).length;

  // Past/future tense signals
  const pastPattern = /\b(was|were|went|had|did|got|made|came|saw|took|thought|felt|said|told|found|knew|became|left|gave|brought|bought|played|worked|lived|used to)\b/gi;
  const futurePattern = /\b(will|would|going to|plan to|hope to|want to|might|could)\b/gi;
  const pastCount = (allText.match(pastPattern) || []).length;
  const futureCount = (allText.match(futurePattern) || []).length;
  const tenseRange = (pastCount > 0 ? 1 : 0) + (futureCount > 0 ? 1 : 0);

  // Unique words / total words (lexical diversity — rough type-token ratio)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""))).size;
  const lexicalDiversity = totalWords > 0 ? uniqueWords / totalWords : 0;

  // Sentence complexity: look for commas inside messages (suggests compound/complex sentences)
  const commaCount = (allText.match(/,/g) || []).length;

  // ── Score the signals ──
  // Each signal contributes to a 0-10 score, then we bucket into tiers

  let score = 0;

  // Message length (0-2 points)
  if (avgWordsPerMsg >= 15) score += 2;
  else if (avgWordsPerMsg >= 8) score += 1;

  // Subordinate clauses (0-2 points)
  if (subordinateCount >= 3) score += 2;
  else if (subordinateCount >= 1) score += 1;

  // Tense range (0-2 points)
  score += tenseRange;

  // Lexical diversity (0-2 points) — only meaningful with enough words
  if (totalWords >= 15) {
    if (lexicalDiversity >= 0.7) score += 2;
    else if (lexicalDiversity >= 0.5) score += 1;
  }

  // Sentence complexity via commas (0-1 point)
  if (commaCount >= 2) score += 1;

  // Struggle penalty (override signal)
  if (struggleCount >= 2) score = Math.min(score, 2);

  // ── Bucket into tiers ──
  if (score <= 3) return "low";
  if (score >= 7) return "high";
  return "mid";
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD CONVERSATION PROMPT
// ─────────────────────────────────────────────────────────────────────────────

function buildConversationPrompt(topic: Topic, perceivedTier: "low" | "mid" | "high"): string {
  const tierGuidance = topic.tierPrompts
    ? topic.tierPrompts[perceivedTier]
    : topic.seedPrompt;

  const languageLevelBlock = {
    low:
      `═══ YOUR LANGUAGE LEVEL ═══

You are talking to a BEGINNER (Pre-A1 to A2). Adjust YOUR language:
- Use only common, short words (go, like, have, want, good, bad, big, small)
- Keep sentences under 10 words
- No idioms, no phrasal verbs, no abstract words
- Use present tense in your questions where possible
- One simple question per turn — never compound questions
- Examples of GOOD examiner language at this level:
  "What do you like to eat?" / "Tell me about your home." / "Do you like your job?"
- Examples of BAD examiner language at this level:
  "What aspects of your daily routine do you find most fulfilling?"
  "Could you elaborate on that?"
  "Tell me something you like about your city." (too many parts)`,

    mid:
      `═══ YOUR LANGUAGE LEVEL ═══

You are talking to an INTERMEDIATE candidate (A2+ to B1). Adjust YOUR language:
- Use everyday vocabulary — avoid academic or formal words
- Keep sentences under 15 words
- Simple phrasal verbs are OK (find out, look for, get on with)
- You can use past and future tense in questions
- "Why" and "how" questions are fine, but keep them focused
- Examples of GOOD examiner language at this level:
  "Why do you like that?" / "What happened when you got there?" / "How do you feel about that?"
- Examples of BAD examiner language at this level:
  "To what extent do you think that's influenced by socioeconomic factors?"`,

    high:
      `═══ YOUR LANGUAGE LEVEL ═══

You are talking to an UPPER-INTERMEDIATE or ADVANCED candidate (B1+ to B2+). You can:
- Use a wider range of vocabulary including some abstract words
- Ask comparative and hypothetical questions
- Use conditionals ("If you could...", "What would you...")
- Push for reasoning, evaluation, and nuance
- Still keep it natural — this is a chat, not an essay prompt`,
  }[perceivedTier];

  return `You are an AI examiner for the FEAT Writing Test — Task 1: ${WRITING_TASK1.meta.title}.

THIS IS A WRITTEN TEST. The candidate is TYPING responses in a WhatsApp-style chat. There is NO audio.

YOUR GOAL: Elicit CEFR writing evidence through structured conversation. You follow the stage instruction precisely while sounding natural.

═══ SESSION TOPIC ═══

Today's topic: ${topic.label}
${tierGuidance}

Do NOT name the topic explicitly until instructed. Let it emerge naturally.

The route controls which stage you are in and when you move. You do not decide stage transitions. Stay in the current stage until the next exchange.

${languageLevelBlock}

═══ HARD RULES ═══

1. ONE question per turn. Never two.
2. Maximum 2 sentences per turn.
3. Every question must create communicative demand (describe, explain, justify, compare, recount).
4. No yes/no questions except as a repair move.
5. No standalone praise or filler. Every turn contains a probe.
6. Follow-up questions must reference the candidate's actual content — not generic topics.
7. Misinterpretation must be mild — not confusing or absurd.
8. Avoid knowledge questions. Keep prompts experience-based.
9. Write like a natural text chat — concise and warm.
10. Match your language to the candidate's level (see YOUR LANGUAGE LEVEL above).

═══ WHAT YOU ARE ASSESSING ═══

INFORMING: Can they convey information in writing? (describe, explain, recount, give reasons)
INTERACTING: Can they manage a written exchange? (respond, follow a thread, clarify, engage)

NOT grammar accuracy. NOT vocabulary range.

═══ CEILING RULE ═══

A STRUGGLE = candidate fails to provide enough written evidence of the targeted function.
Short but successful answers do NOT count as struggle.
The route tracks struggle — you do not need to count. Follow the stage instruction.

═══ DONE SIGNAL ═══

At the end of EVERY response, add:
<ceiling>true</ceiling> — ceiling found or final stage complete
<ceiling>false</ceiling> — continue probing`;
}


// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

function buildDiagnosisPrompt(): string {
  const diagnosisMacroBlock = WRITING_TASK1.levelClusters
    .map((cluster) => {
      const macros = cluster.macroIds
        .map((id) => {
          const m = WRITING_TASK1.azeMacro.find((macro) => macro.azeId === id);
          if (!m) return "";
          return `  ${m.azeId} (${cluster.label}, ${m.fn}): ${m.claim}`;
        })
        .filter(Boolean)
        .join("\n");

      return (
        `── ${cluster.label} — Threshold: ${cluster.confirmThreshold}/${cluster.totalMacros} CAN to confirm ──\n` +
        macros
      );
    })
    .join("\n\n");

  return `You are a CEFR assessment specialist. You have observed a Writing Task 1 text chat conversation (Diagnostic Chat).

Your task: Analyse the transcript and determine whether each communicative function was CONFIRMED, NOT_DEMONSTRATED, or NOT_TESTED.

═══ CONTEXT ═══

This was a WhatsApp-style text chat. The candidate TYPED all responses. This is a WRITING test, not a speaking test.

Task 1 tests two functions:
- INTERACTIONAL: Can the candidate manage a written exchange? (respond, clarify, engage)
- INFORMING: Can the candidate convey information in writing? (describe, recount, explain)

The conversation progressed through structured stages. The transcript is annotated with stage headers (e.g. "--- EXPERIENCE ---") so you can see which stage each exchange belonged to:

- IDENTITY: greeting, name, background (low demand — mainly interactional)
- DESCRIPTION: describing familiar things (tests basic informing)
- EXPERIENCE: recounting past events or future plans (tests past/future tense informing)
- OPINION_REASON: giving and justifying opinions (tests higher-order informing + reasoning)
- THREAD_FOLLOWUP: responding to cross-references from earlier (tests coherence + interaction)
- MISINTERPRET: correcting a deliberate misreading (tests clarification + repair)

Weight evidence by stage — e.g. past tense in EXPERIENCE is more diagnostic than past tense in IDENTITY. A function demonstrated under appropriate demand (the right stage) is stronger evidence than incidental use elsewhere.

The topic is irrelevant to scoring — assess FUNCTION, not content.

═══ MACROS TO ASSESS (grouped by level) ═══

${diagnosisMacroBlock}

═══ SCORING RULES ═══

1. CONFIRMED = clear, unambiguous evidence the candidate achieved this communicative function in writing.
2. NOT_DEMONSTRATED = insufficient evidence that the candidate achieved this communicative function during the task.
3. NOT_TESTED = the conversation never created conditions to test this function. Use sparingly — if the stage ran and the candidate did not demonstrate the function, score NOT_DEMONSTRATED.
4. Be conservative: mixed or ambiguous evidence = NOT_DEMONSTRATED.
5. A single clear instance under appropriate demand IS sufficient for CONFIRMED.
6. Multiple weak instances do NOT combine into CONFIRMED.
7. One response can evidence multiple macros across levels.
8. Clear higher-level competence may support lower-level CONFIRMED judgements when those lower functions are logically implied by the performance.

IMPORTANT: Score EVERY macro. Do not skip any.

═══ CONFIDENCE LEVEL ═══

For each macro judgement assign a confidence level:

HIGH — clear, direct evidence of the function under appropriate communicative demand.
MEDIUM — some evidence is present but limited in length, complexity, or clarity.
LOW — evidence is weak, indirect, or borderline.

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON, no other text:
{
  "results": [
    {
      "azeId": "W-INT-1",
      "claim": "Can exchange basic personal info in writing",
      "level": "Pre-A1",
      "fn": "Interactional",
      "result": "CONFIRMED|NOT_DEMONSTRATED|NOT_TESTED",
      "confidence": "HIGH|MEDIUM|LOW",
      "rationale": "Short explanation (1 sentence)",
      "evidence": "Direct quote or paraphrase from transcript"
    }
  ]
}`;
}


// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE ANALYSIS PROMPT (uses shared rubric)
// ─────────────────────────────────────────────────────────────────────────────

const languageAnalysisPrompt = buildLanguageAnalysisPrompt("chat");


// ─────────────────────────────────────────────────────────────────────────────
// SCORE MAPPING
// ─────────────────────────────────────────────────────────────────────────────

const SCORE_MAP: Record<string, number> = {
  "Pre-A1": 2,
  "A1":     4,
  "A2":     5,
  "A2+":    6,
  "B1":     8,
  "B1+":    10,
  "B2+":    10,
};

function levelToScore(label: string): number {
  return SCORE_MAP[label] ?? 1;
}


// ─────────────────────────────────────────────────────────────────────────────
// API HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      exchangeCount,
      wrapUp,
      action,
      topic: topicFromClient,
      stage: stageFromClient,
      struggleCount: struggleFromClient,
      stageExchangeCount: stageExchangeFromClient,
      probeRound,
      probeTargets: probeTargetsFromClient,
      probeExchangeCount,
      elicitationRound,
      elicitationTargets: elicitationTargetsFromClient,
      elicitationExchangeCount,
    } = await req.json();

    const topic: Topic = topicFromClient ?? pickRandomTopic();
    const currentStage: Stage = (stageFromClient ?? STAGES.IDENTITY) as Stage;

    // Struggle count and stage exchange count tracked by frontend, sent each turn
    const currentStruggleCount: number = struggleFromClient ?? 0;
    const currentStageExchangeCount: number = stageExchangeFromClient ?? 0;


    // ── Diagnosis ──────────────────────────────────────────────────────────
    if (action === "diagnose") {
      const STAGE_LABELS: Record<number, string> = {
        0: "IDENTITY", 1: "DESCRIPTION", 2: "EXPERIENCE",
        3: "OPINION_REASON", 4: "THREAD_FOLLOWUP", 5: "MISINTERPRET",
      };
      let lastStageLabel = "";
      const transcript = messages
        .map((m: Message) => {
          const speaker = m.role === "assistant" ? "AI" : "Candidate";
          // Insert stage header when stage changes (stage is tagged on messages by frontend)
          const msgStage = m.stage;
          const stageLabel = msgStage !== undefined ? STAGE_LABELS[msgStage] ?? `STAGE_${msgStage}` : "";
          let prefix = "";
          if (stageLabel && stageLabel !== lastStageLabel) {
            prefix = `\n--- ${stageLabel} ---\n`;
            lastStageLabel = stageLabel;
          }
          return `${prefix}${speaker}: ${m.content}`;
        })
        .join("\n");

      const candidateOnly = messages
        .filter((m: Message) => m.role === "user")
        .map((m: Message) => m.content)
        .join("\n");

      // Guard: skip language analysis if candidate wrote almost nothing
      const candidateWordCount = candidateOnly.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
      const hasEnoughText = candidateWordCount >= 10;

      // Dual-judge diagnosis — two independent GPT calls, then reconcile
      const judgeAPrompt = buildDiagnosisPrompt();
      const judgeBPrompt = buildJudgeBPrompt(judgeAPrompt);
      const transcriptContent = `Here is the full transcript:\n\n${transcript}`;

      const judgeAPromise = openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: judgeAPrompt },
          { role: "user", content: transcriptContent },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      });

      const judgeBPromise = openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: judgeBPrompt },
          { role: "user", content: transcriptContent },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      });

      const formResPromise = hasEnoughText
        ? openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: languageAnalysisPrompt },
              { role: "user", content: `Candidate messages only:\n\n${candidateOnly}` },
            ],
            max_tokens: 2000,
            temperature: 0.1,
          })
        : null;

      const [judgeARes, judgeBRes, formRes] = await Promise.all([judgeAPromise, judgeBPromise, formResPromise]);

      const judgeARaw = judgeARes.choices[0].message.content || "";
      const judgeBRaw = judgeBRes.choices[0].message.content || "";
      const judgeACleaned = judgeARaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const judgeBCleaned = judgeBRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      const formRaw = formRes?.choices[0].message.content || "";
      const formCleaned = formRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const judgeADiagnosis = JSON.parse(judgeACleaned);
        let judgeBDiagnosis;
        try {
          judgeBDiagnosis = JSON.parse(judgeBCleaned);
        } catch {
          // If Judge B fails to parse, fall back to Judge A only
          judgeBDiagnosis = null;
        }

        // Reconcile: if both parsed, merge; otherwise use Judge A alone
        const reconciledResults = judgeBDiagnosis
          ? reconcileVerdicts(judgeADiagnosis.results || [], judgeBDiagnosis.results || [])
          : judgeADiagnosis.results || [];

        const diagnosis = { ...judgeADiagnosis, results: reconciledResults };

        const { levelResults, diagnosedLevel: calculatedLevel } = calculateDiagnosedLevel(
          diagnosis.results,
          WRITING_TASK1.levelClusters
        );

        diagnosis.diagnosedLevel = calculatedLevel;
        diagnosis.levelResults = levelResults;
        diagnosis.score = levelToScore(calculatedLevel);
        diagnosis.topic = topic;

        let formAnalysis = null;
        if (!hasEnoughText) {
          formAnalysis = {
            overallFormLevel: "Insufficient data",
            overallFormSummary: "Not enough written text to assess language quality.",
            dimensions: [],
          };
        } else {
          try {
            formAnalysis = JSON.parse(formCleaned);
          } catch {
            console.error("Failed to parse form analysis:", formCleaned);
          }
        }

        // ── Save result to Supabase (if configured) ─────────────────────
        const sb = getSupabase();
        if (sb) {
          try {
            await sb.from("test_results").insert({
              candidate_name: null,          // can be passed from frontend later
              task: "task1",
              diagnosed_level: diagnosis.diagnosedLevel,
              score_10: diagnosis.score,
              functional_report: diagnosis,
              form_report: formAnalysis,
              transcript,
            });
          } catch (saveErr) {
            console.error("Failed to save result to Supabase:", saveErr);
            // Don't block the response — diagnosis still returns even if save fails
          }
        }

        // Build macro lookup for elicitation (maps azeId → probeGuidance)
        const macroLookup = new Map(
          WRITING_TASK1.azeMacro.map(m => [m.azeId, { probeGuidance: m.probeGuidance }])
        );

        // Identify MEDIUM-confidence macros for potential probing
        const probeTargets = probeRound
          ? [] // Already probed — no further probing
          : identifyProbeTargets(diagnosis.results, WRITING_TASK1.levelClusters, calculatedLevel);

        // Identify NOT_DEMONSTRATED macros at boundary for elicitation
        // Only after probing is done (or skipped), and not if we already elicited
        const elicitationTargets = (!elicitationRound && (probeRound || probeTargets.length === 0))
          ? identifyElicitationTargets(diagnosis.results, WRITING_TASK1.levelClusters, calculatedLevel, macroLookup)
          : [];

        return NextResponse.json({ diagnosis, formAnalysis, probeTargets, elicitationTargets });
      } catch {
        return NextResponse.json(
          { error: "Failed to parse diagnosis", raw: judgeARaw },
          { status: 500 }
        );
      }
    }


    // ── Probe conversation turn ─────────────────────────────────────────
    if (action === "probe") {
      const pExCount = typeof probeExchangeCount === "number" ? probeExchangeCount : 0;
      const targets = probeTargetsFromClient || [];

      // Build signals map so probe questions are targeted (Task 1 uses probeGuidance)
      const signalsMap = new Map<string, string[]>();
      for (const macro of WRITING_TASK1.azeMacro) {
        signalsMap.set(macro.azeId, macro.probeGuidance);
      }

      const probeSystemPrompt = buildProbePrompt(
        targets,
        `Task: ${WRITING_TASK1.meta.title}. This is a conversation-based writing assessment about "${topic?.label || "a topic"}."`  ,
        signalsMap
      );

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: probeSystemPrompt },
          ...(messages || []),
        ],
        max_tokens: 150,
      });

      const rawMessage = response.choices[0].message.content || "";
      const probeDoneMatch = rawMessage.match(/<probe_done>(true|false)<\/probe_done>/);
      const probeDone = (probeDoneMatch && probeDoneMatch[1] === "true") || pExCount >= MAX_PROBE_EXCHANGES - 1;
      const aiMessage = rawMessage.replace(/<probe_done>(true|false)<\/probe_done>/g, "").trim();

      return NextResponse.json({ message: aiMessage, probeDone });
    }


    // ── Elicitation conversation turn ──────────────────────────────────────
    if (action === "elicit") {
      const eExCount = typeof elicitationExchangeCount === "number" ? elicitationExchangeCount : 0;
      const targets: ElicitationTarget[] = elicitationTargetsFromClient || [];

      const elicitSystemPrompt = buildElicitationPrompt(
        targets,
        `Task: ${WRITING_TASK1.meta.title}. This is a conversation-based writing assessment about "${topic?.label || "a topic"}."`
      );

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: elicitSystemPrompt },
          ...(messages || []),
        ],
        max_tokens: 150,
      });

      const rawMessage = response.choices[0].message.content || "";
      const doneMatch = rawMessage.match(/<probe_done>(true|false)<\/probe_done>/);
      const elicitDone = (doneMatch && doneMatch[1] === "true") || eExCount >= MAX_ELICITATION_EXCHANGES - 1;
      const aiMessage = rawMessage.replace(/<probe_done>(true|false)<\/probe_done>/g, "").trim();

      return NextResponse.json({ message: aiMessage, elicitDone });
    }


    // ── Normal conversation turn ───────────────────────────────────────────

    // Analyse the last candidate response
    const lastUserMsg = [...messages]
      .reverse()
      .find((m: Message) => m.role === "user")?.content ?? "";

    const analysis = analyseResponse(lastUserMsg);

    // Update struggle count based on analysis
    // (frontend sends current count; route returns updated count)
    const updatedStruggleCount = exchangeCount === 0
      ? 0  // reset on first turn
      : analysis.isWeak
        ? currentStruggleCount + 1
        : 0; // reset on strong response

    // Route-controlled ceiling — don't rely on model
    const routeCeilingReached =
      updatedStruggleCount >= 2 || currentStage === STAGES.MISINTERPRET;

    // Target function for this stage (for logging/tracking)
    const targetFunction = getTargetFunction(currentStage);

    // Build prompt
    const perceivedTier = getPerceivedTier(currentStage, updatedStruggleCount, exchangeCount, messages);
    const conversationPrompt = buildConversationPrompt(topic, perceivedTier);

    let stageInstruction: string;

    if (wrapUp) {
      stageInstruction =
        "\n\nFINAL EXCHANGE. Thank the candidate briefly in 1 sentence. " +
        "Add <ceiling>true</ceiling>.";
    } else {
      stageInstruction = buildStageInstruction(
        currentStage,
        exchangeCount,
        topic,
        messages,
        analysis,
        updatedStruggleCount
      );
    }

    const prompt = conversationPrompt + stageInstruction;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        ...messages,
      ],
      max_tokens: 150,
    });

    const rawMessage = response.choices[0].message.content || "";

    // Model ceiling signal (for stages where model signals ceiling naturally)
    const modelCeilingMatch = rawMessage.match(/<ceiling>(true|false)<\/ceiling>/);
    const modelCeilingReached = modelCeilingMatch ? modelCeilingMatch[1] === "true" : false;

    // Final ceiling: route-controlled OR model-signalled
    const ceilingReached = routeCeilingReached || modelCeilingReached;

    // Next stage computed entirely in route
    const nextStage: Stage = wrapUp
      ? currentStage
      : computeNextStage(currentStage, exchangeCount, analysis, updatedStruggleCount, currentStageExchangeCount);

    // Track how many exchanges we've spent in the current stage
    // Resets to 0 when stage changes, increments when staying
    const nextStageExchangeCount = nextStage !== currentStage ? 0 : currentStageExchangeCount + 1;

    // Clean message
    const aiMessage = rawMessage
      .replace(/<ceiling>(true|false)<\/ceiling>/g, "")
      .trim();

    return NextResponse.json({
      message: aiMessage,
      ceilingReached,
      stage: nextStage,
      struggleCount: updatedStruggleCount,
      stageExchangeCount: nextStageExchangeCount,
      targetFunction,
      topic,
    });

  } catch (error) {
    console.error("Writing Chat API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}