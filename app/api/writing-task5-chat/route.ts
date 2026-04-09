import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK5, StimulusSet } from "../../writing/writing-task5-descriptors";
import { buildLanguageAnalysisPrompt } from "../../writing/language-rubric";
import { calculateDiagnosedLevel, buildJudgeBPrompt, reconcileVerdicts, identifyProbeTargets, buildProbePrompt, MAX_PROBE_EXCHANGES } from "../../writing/diagnosis-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "assistant" | "user";
  content: string;
};

/** Minimum candidate turns before <ceiling>true</ceiling> may end the task (route-controlled). */
const MIN_T5_EXCHANGES_BEFORE_WRAP = 6;

/** Route-controlled stage from exchangeCount (user messages completed before this AI reply). */
function getT5Stage(exchangeCount: number): 1 | 2 | 3 | 4 | 5 {
  if (exchangeCount <= 1) return 1;
  if (exchangeCount <= 3) return 2;
  if (exchangeCount <= 5) return 3;
  if (exchangeCount <= 7) return 4;
  return 5;
}

const T5_STAGE_LABEL: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Stage 1 — COMPARE",
  2: "Stage 2 — RECOMMEND",
  3: "Stage 3 — JUSTIFY",
  4: "Stage 4 — TRADE-OFFS",
  5: "Stage 5 — ADAPTATION",
};

// ─────────────────────────────────────────────────────────────────────────────
// STIMULUS SELECTION
// ─────────────────────────────────────────────────────────────────────────────

type Tier = StimulusSet["tier"];

function getTier(level: string): Tier {
  const map: Record<string, Tier> = {
    "Pre-A1": "simple",
    "A1":     "simple",
    "A2":     "simple",
    "A2+":    "everyday",
    "B1":     "everyday",
    "B1+":    "detailed",
    "B2":     "detailed",
    "B2+":    "complex",
    "C1":     "complex",
  };
  return map[level] ?? "everyday";
}

function pickRandomSet(level: string): StimulusSet {
  const tier = getTier(level);
  const pool = WRITING_TASK5.stimulusSets.filter(s => s.tier === tier);
  const candidates = pool.length > 0 ? pool : WRITING_TASK5.stimulusSets;
  return candidates[Math.floor(Math.random() * candidates.length)];
}


// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSIS MACRO BLOCK
// ─────────────────────────────────────────────────────────────────────────────

const diagnosisMacroBlock = WRITING_TASK5.levelClusters
  .map((cluster) => {
    const macros = cluster.macroIds
      .map((id) => {
        const m = WRITING_TASK5.azeMacro.find((macro) => macro.azeId === id);
        if (!m) return "";
        const sigList = m.signals.map((s) => `      - ${s}`).join("\n");
        return `  ${m.azeId} (${cluster.label}, ${m.fn}): ${m.claim}\n    Signals:\n${sigList}`;
      })
      .filter(Boolean)
      .join("\n\n");
    return `── ${cluster.label} — Threshold: ${cluster.confirmThreshold}/${cluster.totalMacros} CAN to confirm ──\n${macros}`;
  })
  .join("\n\n");


// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildConversationPrompt(
  stimSet: StimulusSet | null,
  stage: 1 | 2 | 3 | 4 | 5,
  prevLevel: string,
  candidateName: string,
  task1Context: string
): string {
  const cardDesc = (card: StimulusSet["cardA"]) =>
    `${card.name} (${card.rating}★, ${card.price} ${card.priceNote ?? ""}): ` +
    card.features.map(f => `${f.label}: ${f.value}`).join(" | ");

  const cardBlock = stimSet
    ? `═══ THE CANDIDATE CAN SEE THESE TWO CARDS ═══\n\n` +
      `Option A: ${cardDesc(stimSet.cardA)}\n` +
      `Option B: ${cardDesc(stimSet.cardB)}\n\n` +
      `Suggested situations (draw phrasing from these — stay on-topic):\n` +
      stimSet.situations.map((s, i) => `${i + 1}. ${s}`).join("\n")
    : "No card data available.";

  const stageDirectives: Record<1 | 2 | 3 | 4 | 5, string> = {
    1:
      "Focus ONLY on comparison. Ask for key differences between the two options (features, price, fit for needs visible on the cards). Do NOT ask which option they recommend yet. Do NOT mix recommendation into this stage.",
    2:
      "Ask which option is better for a specific need (use or adapt a situation from the list). One clear question. They should recommend one option for that scenario.",
    3:
      "Push for reasons grounded in the cards. Ask why that option — insist they point to concrete details (price, time, location, features, ratings, etc.). If their answer is too generic, ask which specific detail from Option A or B supports their view.",
    4:
      "Introduce a complication so neither option is perfect: e.g. tighter budget, less time, a conflicting preference, or a new constraint. Ask them to choose anyway and explain the trade-off. Make the tension explicit.",
    5:
      "Change the situation clearly (e.g. \"Now imagine the person has a different need…\" or a new priority). Ask for a NEW recommendation and a short explanation of how and why their advice changed compared to before.",
  };

  // Language adaptation
  const highLevels = ["B2", "B2+", "C1"];
  const midLevels = ["A2+", "B1", "B1+"];
  const languageBlock = highLevels.some(l => prevLevel.includes(l))
    ? `YOUR LANGUAGE LEVEL: This candidate is UPPER-INTERMEDIATE or above. You can use natural, everyday vocabulary. Keep questions focused but don't over-simplify.`
    : midLevels.some(l => prevLevel.includes(l))
    ? `YOUR LANGUAGE LEVEL: This candidate is INTERMEDIATE. Use simple, clear words. Keep sentences under 12 words. No idioms or abstract vocabulary.`
    : `YOUR LANGUAGE LEVEL: This candidate is a BEGINNER. Use only very common, short words. Keep sentences under 8 words. One simple question — no compound questions.`;

  const nameInstruction = candidateName
    ? `The candidate's name is ${candidateName}. Use it naturally — maximum once per turn.`
    : `No name is available. Just speak naturally without a name.`;

  const contextBlock = task1Context
    ? `\nFROM EARLIER TASKS:\n${task1Context}\nYou may reference this briefly in your opening to make the transition natural.`
    : "";

  return `You are an AI examiner for the AZE Writing Test — Task 5: Compare & Advise.

YOUR ROLE: The candidate sees two option cards. You elicit written mediation — relaying information from the cards to match needs. This tests pragmatic control of advice, not general knowledge.

${nameInstruction}
${languageBlock}

${cardBlock}
${contextBlock}

═══ CURRENT STAGE (STRICT — FOLLOW THIS; DO NOT SKIP AHEAD) ═══

You are currently in: ${T5_STAGE_LABEL[stage]} (${stage}/5)

${stageDirectives[stage]}

Progression is controlled by the system. Even if the candidate answers well, stay within this stage’s goal until the next turn advances the stage.

═══ SOURCE-BASED MEDIATION (CRITICAL) ═══

The candidate must base answers on the information shown in the options. If a reply is too general or could apply without reading the cards, ask which detail from Option A or B supports their answer. Prompt them to name specific features (price, time, location, ratings, etc.).

═══ TOPIC ANCHORING ═══

Stay focused on the two options provided. Do not introduce unrelated topics or hypothetical products not on the cards. All questions must refer to information shown in the options or to situations that clearly map to those options.

═══ RULES ═══

1. ONE question (or one short prompt) at a time. Maximum 2 sentences per turn.
2. Be warm and conversational.
3. Do not decide stage yourself — use the CURRENT STAGE above only.
4. Match your language to the candidate's level (see YOUR LANGUAGE LEVEL above).

═══ CEILING SIGNAL (ADVISORY ONLY) ═══

At the end of EVERY response, add exactly one line:
<ceiling>true</ceiling> — if you believe you have seen this candidate’s ceiling for mediation in this chat, OR
<ceiling>false</ceiling> — to continue probing.

Note: The system may keep the conversation open until enough exchanges have occurred — your signal is not the only rule.`;
}


// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const diagnosisPrompt = `You are a CEFR assessment specialist analysing Writing Task 5: Compare & Advise.

═══ CONTEXT ═══

The candidate could see two option cards and had a written chat where the AI asked situational questions. The candidate had to relay information from the cards, recommend options, and adapt advice as situations changed.

Mediation means helping someone understand or decide using information from a source. In this task, the cards are the source and the AI scenarios represent the person needing advice. The candidate's job is to bridge the two — not to give personal opinions.

This tests MEDIATION: the ability to bridge between a source (the cards) and a person with specific needs.
The topic (hotels, phones, jobs, etc.) is irrelevant to scoring — assess FUNCTION, not content.
Do not reward interesting opinions or personal knowledge. Score communicative mediation function only.

═══ CRITICAL SCORING PRINCIPLE ═══

Score what the candidate DEMONSTRATED. If they showed they could weigh trade-offs, mark that CAN even if the topic was simple. Function is topic-agnostic.

If the candidate adjusts their recommendation when the situation changes (e.g. different needs or priorities), this is strong evidence of higher mediation ability and should support higher-level CAN decisions.

═══ MACROS TO ASSESS ═══

${diagnosisMacroBlock}

═══ SCORING RULES ═══

1. CAN = clear evidence the candidate achieved this mediating function.
2. NOT_YET = attempted but did not clearly achieve it.
3. NOT_TESTED = the conversation did not create conditions for this function. Use sparingly — if the conversation created the opportunity and the candidate did not demonstrate the function, score NOT_YET.
4. Be conservative: mixed evidence = NOT_YET.
5. A single clear instance may be sufficient for CAN. Treat minimal or borderline evidence cautiously.
6. Very short responses that do not clearly justify a recommendation should normally be scored NOT_YET due to insufficient evidence.
7. The candidate must use information from the cards when giving advice. If the candidate gives generic advice without referring to features from the cards, score NOT_YET for higher mediation macros.
8. If the candidate misreads a feature from the card but still demonstrates the intended mediation function (e.g. comparing options or recommending based on needs), this may still count as CAN for the function — but note the misunderstanding in the rationale.
9. Higher-level mediation normally requires comparing both options. If the candidate discusses only one option without weighing it against the other, higher comparison macros should normally be scored NOT_YET.
10. Vague recommendations without a clear reason or connection to the scenario should not be scored CAN for recommendation macros.
11. Higher-level mediation often involves weighing trade-offs between options (e.g. price vs quality, convenience vs features). Evidence of recognising advantages and disadvantages strengthens higher-level CAN decisions.
12. Clear higher-level mediation may support lower-level CAN judgements when the lower-level skill is logically required by what was demonstrated.
13. Evidence must quote the candidate's message where the comparison or recommendation is made.
14. Look for evidence across the ENTIRE conversation, not just one exchange.

IMPORTANT: Score EVERY macro. The system calculates the level from your scores.


═══ CONFIDENCE LEVEL ═══

For each macro judgement assign a confidence level:

HIGH — clear, direct evidence of the function under appropriate communicative demand.
MEDIUM — some evidence is present but limited in length, complexity, or clarity.
LOW — evidence is weak, indirect, or borderline.

Confidence reflects the strength of the evidence, not the CEFR level.

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON:
{
  "results": [
    {
      "azeId": "W5-F1",
      "claim": "Can identify and state basic facts from a visual source",
      "level": "A1",
      "fn": "Informing",
      "result": "CONFIRMED|NOT_DEMONSTRATED|NOT_TESTED",
      "confidence": "HIGH|MEDIUM|LOW",
      "rationale": "Short explanation (1 sentence)",
      "evidence": "Direct quote from the candidate's message"
    }
  ]
}`;


// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE ANALYSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const languageAnalysisPrompt = buildLanguageAnalysisPrompt("chat");


// ─────────────────────────────────────────────────────────────────────────────
// API HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messages, exchangeCount, wrapUp, stimulusSetId, prevLevel, candidateName: candidateNameRaw, task1Context: task1ContextRaw, probeRound, probeTargets: probeTargetsFromClient, probeExchangeCount } = body;
    const candidateName = candidateNameRaw || "";
    const task1Context = task1ContextRaw || "";
    const exCount = typeof exchangeCount === "number" ? exchangeCount : 0;

    // ── Select stimulus set ────────────────────────────────────────────
    if (action === "get-stimulus") {
      const stimulusSet = pickRandomSet(prevLevel || "B1");
      return NextResponse.json({ stimulusSet });
    }


    // ── Conversation turn ──────────────────────────────────────────────
    if (action === "chat") {
      const stimSet = WRITING_TASK5.stimulusSets.find(s => s.id === stimulusSetId) ?? null;

      if (wrapUp) {
        const prompt =
          `You are closing the Task 5 (Compare & Advise) chat. ` +
          (stimSet ? `The two options were "${stimSet.cardA.name}" and "${stimSet.cardB.name}". ` : "") +
          `Thank the candidate briefly in one sentence. Add <ceiling>true</ceiling>.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: prompt },
            ...(messages || []),
          ],
          max_tokens: 150,
        });

        const rawMessage = response.choices[0].message.content || "";
        const aiMessage = rawMessage
          .replace(/<ceiling>(true|false)<\/ceiling>/g, "")
          .trim();

        return NextResponse.json({ message: aiMessage, ceilingReached: true, forceContinue: false });
      }

      const stage = getT5Stage(exCount);
      let prompt = buildConversationPrompt(stimSet, stage, prevLevel || "", candidateName, task1Context);

      if (exCount === 0) {
        const greet = candidateName ? `Greet ${candidateName} by name briefly. ` : "";
        const t1Ref = task1Context ? `You may briefly reference something from earlier tasks. ` : "";
        prompt +=
          `\n\nThis is the START (first assistant message). ${greet}${t1Ref}Open in two short sentences only:\n` +
          `1) Say that here are two options (you may say "Here are two options.").\n` +
          `2) Ask them to describe the main differences between them — e.g. "Can you tell me the main differences between them?"\n` +
          `Do not ask for a recommendation yet. Add <ceiling>false</ceiling>.`;
      } else {
        prompt +=
          `\n\nCandidate replies completed so far in this chat: ${exCount}. ` +
          `You are in ${T5_STAGE_LABEL[stage]}. Follow ONLY that stage’s instructions. ` +
          `One question, max 2 sentences.`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: prompt },
          ...(messages || []),
        ],
        max_tokens: 150,
      });

      const rawMessage = response.choices[0].message.content || "";
      const ceilingMatch = rawMessage.match(/<ceiling>(true|false)<\/ceiling>/);
      const ceilingSignal = ceilingMatch ? ceilingMatch[1] === "true" : false;
      const ceilingReached = ceilingSignal && exCount >= MIN_T5_EXCHANGES_BEFORE_WRAP;
      const forceContinue = ceilingSignal && exCount < MIN_T5_EXCHANGES_BEFORE_WRAP;
      const aiMessage = rawMessage
        .replace(/<ceiling>(true|false)<\/ceiling>/g, "")
        .trim();

      return NextResponse.json({ message: aiMessage, ceilingReached, forceContinue });
    }


    // ── Diagnosis ──────────────────────────────────────────────────────
    if (action === "diagnose") {
      const diagStim =
        typeof stimulusSetId === "string" && stimulusSetId
          ? WRITING_TASK5.stimulusSets.find(s => s.id === stimulusSetId) ?? null
          : null;

      // Build transcript with stage markers so diagnosis knows which evidence came from which stage
      let userCount = 0;
      const transcriptLines: string[] = [];
      let currentStage = 0;
      for (const m of (messages || []) as Message[]) {
        if (m.role === "user") userCount++;
        const stage = getT5Stage(m.role === "assistant" ? userCount : userCount - 1);
        if (stage !== currentStage) {
          currentStage = stage;
          transcriptLines.push(`\n--- ${T5_STAGE_LABEL[stage]} ---`);
        }
        transcriptLines.push(`${m.role === "assistant" ? "AI" : "Candidate"}: ${m.content}`);
      }
      const transcript = transcriptLines.join("\n");

      const candidateOnly = (messages || [])
        .filter((m: Message) => m.role === "user")
        .map((m: Message) => m.content)
        .join("\n");

      const cardsBlock = diagStim
        ? `Here are the options (structured card data — use to verify facts and recommendations):\n\n` +
          `Card A: ${JSON.stringify(diagStim.cardA)}\n\n` +
          `Card B: ${JSON.stringify(diagStim.cardB)}\n\n`
        : "";

      const functionUserContent =
        cardsBlock +
        `Conversation transcript:\n\n${transcript}`;

      const candidateWordCount = candidateOnly.trim().split(/\s+/).filter(Boolean).length;
      const hasEnoughText = candidateWordCount >= 10;

      const judgeAPrompt = diagnosisPrompt;
      const judgeBPrompt = buildJudgeBPrompt(diagnosisPrompt);

      const judgeAPromise = openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: judgeAPrompt },
          { role: "user", content: functionUserContent },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      });

      const judgeBPromise = openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: judgeBPrompt },
          { role: "user", content: functionUserContent },
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
      const judgeACleaned = judgeARaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      const judgeBRaw = judgeBRes.choices[0].message.content || "";
      const judgeBCleaned = judgeBRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      const formRaw = formRes?.choices[0].message.content || "";
      const formCleaned = formRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      try {
        const judgeA = JSON.parse(judgeACleaned);
        let reconciledResults = judgeA.results || [];

        try {
          const judgeB = JSON.parse(judgeBCleaned);
          reconciledResults = reconcileVerdicts(judgeA.results || [], judgeB.results || []);
        } catch {
          console.error("Judge B parse failed, using Judge A only");
        }

        const diagnosis = { ...judgeA, results: reconciledResults };

        const { levelResults, diagnosedLevel: calculatedLevel } = calculateDiagnosedLevel(
          diagnosis.results || [],
          WRITING_TASK5.levelClusters
        );

        diagnosis.diagnosedLevel = calculatedLevel;
        diagnosis.levelResults = levelResults;

        let formAnalysis = null;
        if (!hasEnoughText) {
          formAnalysis = {
            overallFormLevel: "Insufficient data",
            overallFormSummary: "Not enough written text to assess language quality.",
            dimensions: [],
          };
        } else {
          try { formAnalysis = JSON.parse(formCleaned); } catch { /* skip */ }
        }

        const probeTargets = probeRound
          ? []
          : identifyProbeTargets(diagnosis.results, WRITING_TASK5.levelClusters, calculatedLevel);

        return NextResponse.json({ diagnosis, formAnalysis, probeTargets });
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

      // Build signals map so probe questions are targeted
      const signalsMap = new Map<string, string[]>();
      for (const macro of WRITING_TASK5.azeMacro) {
        signalsMap.set(macro.azeId, macro.signals);
      }

      const probeSystemPrompt = buildProbePrompt(
        targets,
        `Task: ${WRITING_TASK5.meta.title}. This is a compare-and-advise discussion task.`,
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


    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Writing Task 5 API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}