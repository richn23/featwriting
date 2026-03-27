import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK1, Topic } from "../../writing/writing-descriptors";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "assistant" | "user";
  content: string;
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
// Analyses the candidate's last message for length and communicative substance.
// Used to gate stage advancement and trigger probe enforcement.
// ─────────────────────────────────────────────────────────────────────────────

function analyseResponse(text: string) {
  const length = text.trim().split(/\s+/).length;
  const hasReason = /(because|so|since|as|that's why|therefore|which is why)/i.test(text);
  const hasDetail = length > 10;
  const hasClause = /(and|but|although|however|when|if|while|though)/i.test(text);

  return {
    length,
    hasReason,
    hasDetail,
    hasClause,
    isVeryShort: length < 5,
    isWeak: length < 6 || (!hasReason && length < 12),
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

function computeNextStage(
  currentStage: Stage,
  exchangeCount: number,
  analysis: ReturnType<typeof analyseResponse>,
  struggleCount: number
): Stage {

  // Stay in stage if weak but not yet at ceiling threshold
  if (analysis.isWeak && struggleCount < 2) {
    return currentStage;
  }

  // Two consecutive weak responses → jump to ceiling probe
  if (struggleCount >= 2) {
    return STAGES.MISINTERPRET;
  }

  // Normal progression
  if (currentStage === STAGES.IDENTITY) {
    return exchangeCount >= 2 ? STAGES.DESCRIPTION : STAGES.IDENTITY;
  }
  if (currentStage === STAGES.DESCRIPTION)     return STAGES.EXPERIENCE;
  if (currentStage === STAGES.EXPERIENCE)      return STAGES.OPINION_REASON;
  if (currentStage === STAGES.OPINION_REASON)  return STAGES.THREAD_FOLLOWUP;
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
      if (exchangeCount === 1) {
        return (
          "\n\nSTAGE: IDENTITY — Exchange 1.\n" +
          "Ask ONE question only: where they are from or where they live.\n" +
          "Vary the wording naturally. Keep it under 8 words.\n" +
          "Add <ceiling>false</ceiling>."
        );
      }
      return (
        "\n\nSTAGE: IDENTITY — Exchange 2 (final identity question).\n" +
        "Ask ONE question only: what do they do — work or study.\n" +
        "Vary the wording naturally. Keep it under 10 words.\n" +
        "Add <ceiling>false</ceiling>."
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

    case STAGES.EXPERIENCE:
      return (
        "\n\nSTAGE: EXPERIENCE — Exchange " + exchangeCount + ".\n" +
        adaptivityRule +
        "Now introduce the session topic: " + topic.label + ".\n" +
        "Ask about a past event OR a future plan connected to this topic.\n" +
        "The question must require past or future tense — not just present description.\n" +
        "Examples: 'Tell me about a time you...' / 'What did you do last...?' / 'What would you like to do next...?'\n" +
        (analysis.isWeak && struggleCount < 2
          ? "The candidate's last response was weak. Ask them to give more detail about their experience — do not change topic.\n"
          : "") +
        "Add <ceiling>false</ceiling>."
      );

    case STAGES.OPINION_REASON:
      return (
        "\n\nSTAGE: OPINION_REASON — Exchange " + exchangeCount + ".\n" +
        adaptivityRule +
        "Ask a position question about " + topic.label + " that requires justification.\n" +
        "The question must demand an opinion AND a reason — not just a preference.\n" +
        "Examples: 'Do you think [X] is better than [Y]? Why?' / 'Is [X] important? Why or why not?'\n" +
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
// BUILD CONVERSATION PROMPT
// ─────────────────────────────────────────────────────────────────────────────

function buildConversationPrompt(topic: Topic): string {
  return `You are an AI examiner for the FEAT Writing Test — Task 1: ${WRITING_TASK1.meta.title}.

THIS IS A WRITTEN TEST. The candidate is TYPING responses in a WhatsApp-style chat. There is NO audio.

YOUR GOAL: Elicit CEFR writing evidence across six structured stages. Each stage targets specific macros. You still sound natural — but you follow the stage instruction precisely.

═══ SESSION TOPIC ═══

Today's topic: ${topic.label}
${topic.seedPrompt}

Do NOT name the topic explicitly until the EXPERIENCE stage. Let it emerge naturally.

═══ SIX STAGES ═══

IDENTITY        → Pre-A1/A1  — name, location, job
DESCRIPTION     → A1/A2      — describe a familiar entity with detail
EXPERIENCE      → A2+        — past event or future plan (introduces topic)
OPINION_REASON  → B1         — position + justification
THREAD_FOLLOWUP → B1+        — reference earlier content, connect ideas
MISINTERPRET    → B2+        — deliberately misread candidate, prompt repair

The route controls which stage you are in. Stay in the current stage until the next exchange.

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

The conversation progressed through structured stages:
IDENTITY → DESCRIPTION → EXPERIENCE → OPINION_REASON → THREAD_FOLLOWUP → MISINTERPRET

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
// LANGUAGE ANALYSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const languageAnalysisPrompt = `You are a CEFR-trained language analyst. You have observed a candidate's written responses in a diagnostic text chat.

Your task: Analyse the candidate's messages for language quality across five dimensions. Ignore the AI examiner's messages entirely.

═══ CONTEXT ═══

WhatsApp-style written chat. Candidate typed naturally. Assess language produced — not what they were asked.

═══ DIMENSIONS ═══

For each dimension:
- Estimated CEFR band (Pre-A1, A1, A2, A2+, B1, B1+, B2, B2+, C1, C2)
- Short descriptor (1 sentence)
- 1-2 specific examples from the transcript

1. GRAMMAR (Range & Accuracy)
2. VOCABULARY (Range & Precision)
3. COHERENCE & COHESION
4. SPELLING & MECHANICS
5. COMMUNICATIVE EFFECTIVENESS

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON, no other text:
{
  "overallFormLevel": "A2",
  "overallFormSummary": "Brief 2-sentence summary",
  "dimensions": [
    {
      "dimension": "Grammar",
      "level": "A2",
      "descriptor": "One sentence description",
      "examples": ["example 1", "example 2"]
    }
  ]
}`;


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
    } = await req.json();

    const topic: Topic = topicFromClient ?? pickRandomTopic();
    const currentStage: Stage = (stageFromClient ?? STAGES.IDENTITY) as Stage;

    // Struggle count is tracked by the frontend and sent each turn
    const currentStruggleCount: number = struggleFromClient ?? 0;


    // ── Diagnosis ──────────────────────────────────────────────────────────
    if (action === "diagnose") {
      const transcript = messages
        .map((m: Message) => `${m.role === "assistant" ? "AI" : "Candidate"}: ${m.content}`)
        .join("\n");

      const candidateOnly = messages
        .filter((m: Message) => m.role === "user")
        .map((m: Message) => m.content)
        .join("\n");

      const [functionRes, formRes] = await Promise.all([
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: buildDiagnosisPrompt() },
            { role: "user", content: `Here is the full transcript:\n\n${transcript}` },
          ],
          max_tokens: 4000,
          temperature: 0.1,
        }),
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: languageAnalysisPrompt },
            { role: "user", content: `Candidate messages only:\n\n${candidateOnly}` },
          ],
          max_tokens: 2000,
          temperature: 0.1,
        }),
      ]);

      const funcRaw = functionRes.choices[0].message.content || "";
      const funcCleaned = funcRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      const formRaw = formRes.choices[0].message.content || "";
      const formCleaned = formRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const diagnosis = JSON.parse(funcCleaned);

        const resultsMap = new Map(
          (diagnosis.results || []).map((r: { azeId: string; result: string }) => [r.azeId, r])
        );

        let calculatedLevel = "Below Pre-A1";
        const levelResults: {
          level: string;
          confirmed: boolean;
          canCount: number;
          threshold: string;
        }[] = [];

        for (const lc of WRITING_TASK1.levelClusters) {
          const canCount = lc.macroIds.filter((id) => {
            const r = resultsMap.get(id);
            return r && (r as { result: string }).result === "CONFIRMED";
          }).length;
          const confirmed = canCount >= lc.confirmThreshold;
          levelResults.push({
            level: lc.level,
            confirmed,
            canCount,
            threshold: `${lc.confirmThreshold}/${lc.totalMacros}`,
          });
          if (confirmed) calculatedLevel = lc.label;
        }

        diagnosis.diagnosedLevel = calculatedLevel;
        diagnosis.levelResults = levelResults;
        diagnosis.score = levelToScore(calculatedLevel);
        diagnosis.topic = topic;

        let formAnalysis = null;
        try {
          formAnalysis = JSON.parse(formCleaned);
        } catch {
          console.error("Failed to parse form analysis:", formCleaned);
        }

        return NextResponse.json({ diagnosis, formAnalysis });
      } catch {
        return NextResponse.json(
          { error: "Failed to parse diagnosis", raw: funcRaw },
          { status: 500 }
        );
      }
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
    const conversationPrompt = buildConversationPrompt(topic);

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
      : computeNextStage(currentStage, exchangeCount, analysis, updatedStruggleCount);

    // Clean message
    const aiMessage = rawMessage
      .replace(/<ceiling>(true|false)<\/ceiling>/g, "")
      .trim();

    return NextResponse.json({
      message: aiMessage,
      ceilingReached,
      stage: nextStage,
      struggleCount: updatedStruggleCount,
      targetFunction,
      topic,
    });

  } catch (error) {
    console.error("Writing Chat API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}