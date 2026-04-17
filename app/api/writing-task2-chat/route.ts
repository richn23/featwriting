import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK2, Topic } from "../../writing-task2-descriptors";
import { buildLanguageAnalysisPrompt } from "../../language-rubric";
import { calculateDiagnosedLevel, buildJudgeBPrompt, reconcileVerdicts } from "../../diagnosis-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "assistant" | "user";
  content: string;
};


// ─────────────────────────────────────────────────────────────────────────────
// TOPIC SELECTION
// ─────────────────────────────────────────────────────────────────────────────

function pickRandomTopic(): Topic {
  const idx = Math.floor(Math.random() * WRITING_TASK2.topics.length);
  return WRITING_TASK2.topics[idx];
}


// ─────────────────────────────────────────────────────────────────────────────
// SCAFFOLD COMPLETION (route-controlled — not model-controlled)
//
// scaffoldingExchanges is the total number of scaffold turns.
// Scaffold is done after the candidate has responded (exchangeCount >= threshold).
// exchangeCount here = number of candidate responses so far.
// ─────────────────────────────────────────────────────────────────────────────

function isScaffoldComplete(exchangeCount: number): boolean {
  const threshold = WRITING_TASK2.meta.scaffoldingExchanges ?? 3;
  return exchangeCount >= threshold;
}


// ─────────────────────────────────────────────────────────────────────────────
// PERSONALISED WRITING PROMPT
//
// Derives the prompt from the candidate's scaffold responses.
// Falls back to a generic prompt if no scaffold content is available.
// ─────────────────────────────────────────────────────────────────────────────

function buildPersonalisedPrompt(
  topic: Topic,
  scaffoldMessages: Message[],
  task1Level: string
): { promptTitle: string; promptText: string; suggestedWords: [number, number]; topicSummary: string } {

  const userMessages = scaffoldMessages
    .filter(m => m.role === "user")
    .map(m => m.content);

  // Guard: need at least 2 user messages with any content (1+ non-empty word)
  const messagesWithContent = userMessages.filter(
    msg => msg.trim().split(/\s+/).filter(Boolean).length >= 1
  );

  // Pick the level-appropriate writing prompt from the topic
  const highLevels = ["B2", "B2+", "C1"];
  const midLevels  = ["A2+", "B1", "B1+"];
  const band: "low" | "mid" | "high" = highLevels.includes(task1Level)
    ? "high"
    : midLevels.includes(task1Level)
    ? "mid"
    : "low";

  const levelPrompt = topic.writingPrompts[band];

  // Word range by level
  const suggestedWords: [number, number] = band === "high"
    ? [150, 250]
    : band === "mid"
    ? [100, 180]
    : [60, 120];

  const hasContent = messagesWithContent.length >= 2;

  if (hasContent) {
    // Build bullet points from each scaffold answer separately
    const bulletPoints = messagesWithContent
      .map(msg => `• ${msg.trim()}`)
      .join("\n");

    return {
      promptTitle: `Write about ${topic.label.toLowerCase()}`,
      promptText:
        `In the warm-up, you said:\n\n${bulletPoints}\n\n` +
        `Now use your ideas to write.\n\n` +
        `${levelPrompt}\n\n` +
        `Write naturally — as if you are telling a friend.`,
      suggestedWords,
      topicSummary: messagesWithContent.map(m => m.trim()).join("; ").slice(0, 120),
    };
  }

  return {
    promptTitle: `Write about ${topic.label.toLowerCase()}`,
    promptText:
      `${levelPrompt}\n\n` +
      `Write naturally — as if you are telling a friend.`,
    suggestedWords,
    topicSummary: topic.label,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// SCAFFOLD CONVERSATION PROMPT
//
// Three-stage internal progression:
//   1. Specific experience
//   2. What happened
//   3. Why it mattered / was enjoyable / difficult
//
// Scaffold is warm-up only — no assessment, no challenge, no ceiling.
// ─────────────────────────────────────────────────────────────────────────────

function buildScaffoldPrompt(
  topic: Topic,
  candidateName: string,
  task1Level: string,
  exchangeCount: number,
  isFinal: boolean,
  task1Context: string
): string {

  const nameInstruction = candidateName
    ? `The candidate's name is ${candidateName}. Use it naturally — maximum once per turn. Do not overuse it.`
    : `No name is available. Do not say "the candidate" — just speak naturally without a name.`;

  // Language level adaptation based on Task 1 diagnosis
  const high = ["B2", "B2+", "C1"];
  const mid = ["A2+", "B1", "B1+"];
  const languageBlock = high.includes(task1Level)
    ? `YOUR LANGUAGE LEVEL: This candidate is UPPER-INTERMEDIATE or above. You can use natural, everyday vocabulary. Keep questions focused but don't over-simplify.`
    : mid.includes(task1Level)
    ? `YOUR LANGUAGE LEVEL: This candidate is INTERMEDIATE. Use simple, clear words. Keep sentences under 12 words. No idioms or abstract vocabulary.`
    : `YOUR LANGUAGE LEVEL: This candidate is a BEGINNER. Use only very common, short words. Keep sentences under 8 words. One simple question — no compound questions. Example: "What did you do?" not "Could you tell me about what happened and how it made you feel?"`;

  // Task 1 context — what we already know about the candidate
  const contextBlock = task1Context
    ? `\nFROM TASK 1 (what the candidate already told you):\n${task1Context}\nUse this naturally — you can reference something they said in Task 1 to make the transition feel connected. For example: "In the chat earlier you mentioned X — now I'd like to ask about something different."`
    : "";

  const base = `You are an AI examiner for the FEAT Writing Test — Task 2: ${WRITING_TASK2.meta.title}.

THIS IS THE SCAFFOLDING PHASE. It is NOT assessed. Your only job is to warm the candidate up on the topic before they write.

${nameInstruction}
${languageBlock}
Topic: ${topic.label}
${contextBlock}

SCAFFOLD SEED (use this to guide your questions — your questions must be specific to this seed, not generic):
${topic.scaffoldSeed}

SCAFFOLD RULES:
1. ONE short sentence per turn — the question itself, nothing else.
2. Do NOT add warm affirmations before the question. No "That sounds wonderful!", "Great!", "That's interesting!", "How lovely!" etc. Just ask the next question directly.
3. Match your language to the candidate's level (see YOUR LANGUAGE LEVEL above).
4. Do NOT assess, challenge, correct, or probe for ceiling.
5. Stay on topic: ${topic.label}. Do not drift.
6. Do NOT ask yes/no questions. Ask for a short story, memory, or description.

GOOD EXAMPLE: "What did you enjoy most about it?"
BAD EXAMPLE: "That sounds wonderful! What happened during your birthday celebration that made it special for you?"

QUESTION PROGRESSION — follow this order strictly:
  Exchange 0: Ask about a SPECIFIC experience related to ${topic.label}. Not general — specific.
  Exchange 1: Ask WHAT HAPPENED during that experience. Reference what they said.
  Exchange 2+: Ask WHY it mattered / was enjoyable / was difficult.

Do NOT skip this progression. Do NOT ask about general opinions.`;

  if (exchangeCount === 0) {
    const greeting = candidateName
      ? `Greet ${candidateName} by name briefly.`
      : `Greet the candidate briefly.`;
    const t1Reference = task1Context
      ? ` You can briefly reference something from Task 1 to make the transition natural (e.g. "Earlier you told me about X — now let's talk about something different.").`
      : "";
    return base + `\n\nThis is exchange 0 — the START. ${greeting}${t1Reference} Then ask about a specific experience with ${topic.label}. Keep it to one short sentence.`;
  }

  if (isFinal) {
    return base + `\n\nThis is the FINAL scaffold turn. One short sentence: tell ${candidateName || "them"} they are ready to write. No affirmation. No question.`;
  }

  const stageInstruction = exchangeCount === 1
    ? `Ask what happened during the experience they mentioned. One sentence. No affirmation.`
    : `Ask why it mattered, was enjoyable, or was difficult. One sentence. No affirmation.`;

  return base + `\n\nThis is scaffold exchange ${exchangeCount}. ${stageInstruction}`;
}


// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

function buildDiagnosisPrompt(): string {
  const macroBlock = WRITING_TASK2.levelClusters
    .map((cluster) => {
      const macros = cluster.macroIds
        .map((id) => {
          const m = WRITING_TASK2.azeMacro.find((macro) => macro.azeId === id);
          if (!m) return "";
          const signalList = m.signals.map((s) => `      - ${s}`).join("\n");
          return (
            `  ${m.azeId} (${cluster.label}, ${m.fn}): ${m.claim}\n` +
            `    Signals:\n${signalList}` +
            (m.notes ? `\n    Note: ${m.notes}` : "")
          );
        })
        .filter(Boolean)
        .join("\n\n");

      return (
        `── ${cluster.label} — Threshold: ${cluster.confirmThreshold}/${cluster.totalMacros} CAN to confirm ──\n` +
        `${cluster.levelDescription}\n\n${macros}`
      );
    })
    .join("\n\n");

  return `You are a CEFR assessment specialist scoring a candidate's extended written response from Writing Task 2: Inform & Narrate.

═══ CONTEXT ═══

The candidate completed a short warm-up conversation (scaffold) before writing. The scaffold context is provided for reference only — it helps you understand the topic and what the candidate intended to write about. The scaffold itself is NOT assessed.

The main scored evidence is the EXTENDED WRITING RESPONSE ONLY.

Task goal: Inform & Narrate.

INFORMING: providing factual information, describing situations, explaining what something is or how it works.
NARRATING: recounting past events, describing sequences of actions, telling what happened first, next, and after.

These functions can blur — keep their definitions distinct when scoring.

The topic is irrelevant to scoring — assess FUNCTION, not content.
Do not reward creativity, interesting opinions, or topic knowledge. Only score communicative function in writing.

═══ RELEVANCE CHECK ═══

Before scoring, check: is the response clearly related to the prompt?
If entirely unrelated (copy-paste, nonsense, random text) — score ALL macros as NOT_DEMONSTRATED. Do not trigger this for weak or partial responses.

═══ LENGTH CHECK ═══

If the response is extremely short (fewer than ~3 meaningful sentences), assume insufficient evidence for mid- and higher-level macros.

═══ MACROS TO ASSESS ═══

${macroBlock}

═══ SCORING RULES ═══

1. CONFIRMED = clear evidence the candidate achieved this communicative function.
2. NOT_DEMONSTRATED = attempted but not achieved, or no evidence present.
3. NOT_TESTED = ONLY when the prompt clearly did not allow this function. If allowed but not demonstrated, score NOT_DEMONSTRATED.
4. Be conservative: mixed or ambiguous evidence = NOT_DEMONSTRATED.
5. A single clear instance may be sufficient for CONFIRMED. Treat minimal evidence cautiously.
6. Multiple weak instances do NOT combine into CONFIRMED.
7. Score EVERY macro. Do not skip any.

═══ CONFIDENCE LEVEL ═══

HIGH — clear, direct evidence under appropriate demand.
MEDIUM — some evidence, limited in length, complexity, or clarity.
LOW — weak, indirect, or borderline evidence.

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON, no other text:
{
  "results": [
    {
      "azeId": "W2-F1",
      "claim": "Can produce simple factual statements in writing",
      "level": "A1",
      "fn": "Informing",
      "result": "CONFIRMED|NOT_DEMONSTRATED|NOT_TESTED",
      "confidence": "HIGH|MEDIUM|LOW",
      "rationale": "Short explanation (1 sentence)",
      "evidence": "Direct quote from the writing"
    }
  ]
}`;
}


// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE ANALYSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const languageAnalysisPrompt = buildLanguageAnalysisPrompt("extended");


// ─────────────────────────────────────────────────────────────────────────────
// SCORE MAPPING
// Task 2 ceiling is B2+ → mapped to 10
// ─────────────────────────────────────────────────────────────────────────────

// Task 2 ceiling is B2+ — mapped to 10. C1 not expected but handled gracefully.
const SCORE_MAP: Record<string, number> = {
  "A1":  2,
  "A2":  4,
  "A2+": 5,
  "B1":  6,
  "B1+": 7,
  "B2":  8,
  "B2+": 10,
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
      action,
      messages,
      exchangeCount,
      topic: topicFromClient,
      candidateName,
      task1Level,
      task1Context,
      writingResponse,
      writtenText,
      scaffoldMessages: scaffoldMessagesFromClient,
      writingPrompt: writingPromptFromClient,
    } = await req.json();

    const topic: Topic = topicFromClient ?? pickRandomTopic();
    const scaffoldMessages: Message[] = scaffoldMessagesFromClient ?? messages ?? [];


    // ── Scaffold chat turn ─────────────────────────────────────────────────
    if (action === "scaffold") {

      // Route-controlled scaffold completion — deterministic
      const scaffoldDone = isScaffoldComplete(exchangeCount);
      const isFinalTurn = isScaffoldComplete(exchangeCount + 1) && !scaffoldDone;

      const prompt = buildScaffoldPrompt(
        topic,
        candidateName || "",
        task1Level || "",
        exchangeCount,
        isFinalTurn,
        task1Context || ""
      );

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: prompt },
          ...(messages || []),
        ],
        max_tokens: 150,
      });

      const rawMessage = response.choices[0].message.content || "";

      // Strip any model-generated done tags (model should not control this)
      const aiMessage = rawMessage
        .replace(/<done>(true|false)<\/done>/g, "")
        .trim();

      // Build personalised writing prompt from candidate scaffold responses only
      const writingPrompt = buildPersonalisedPrompt(topic, messages || [], task1Level || "A1");

      const phase = scaffoldDone ? "write" : "scaffold";

      return NextResponse.json({
        message: aiMessage,
        scaffoldDone,
        phase,
        topic,
        writingPrompt,
      });
    }

    // ── Generate writing prompt (after scaffold) ───────────────────────────
    if (action === "generate-prompt") {
      const prompt = buildPersonalisedPrompt(topic, scaffoldMessages, task1Level || "A1");
      return NextResponse.json({ prompt, topic });
    }

    // ── Diagnose extended writing ──────────────────────────────────────────
    if (action === "diagnose") {
      const writingText = writingResponse ?? writtenText;
      if (!writingText) {
        return NextResponse.json({ error: "No writing response provided" }, { status: 400 });
      }

      // Extract candidate scaffold responses for context
      const scaffoldContext = scaffoldMessages
        .filter(m => m.role === "user")
        .map(m => m.content)
        .join("\n");

      const promptUsed = writingPromptFromClient
        ? (typeof writingPromptFromClient === "string"
          ? writingPromptFromClient
          : writingPromptFromClient.promptText ?? "")
        : buildPersonalisedPrompt(topic, scaffoldMessages, task1Level || "A1").promptText;

      // Determine which prompt tier was given
      const highLevels = ["B2", "B2+", "C1"];
      const midLevels  = ["A2+", "B1", "B1+"];
      const effectiveLevel = task1Level || "A1";
      const promptTier = highLevels.includes(effectiveLevel) ? "high" : midLevels.includes(effectiveLevel) ? "mid" : "low";

      // Guard: skip language analysis if candidate wrote almost nothing
      const candidateWordCount = writingText.trim().split(/\s+/).filter(Boolean).length;
      const hasEnoughText = candidateWordCount >= 10;

      const judgeAPrompt = buildDiagnosisPrompt();
      const judgeBPrompt = buildJudgeBPrompt(judgeAPrompt);
      const diagnosisUserContent =
        `Topic: ${topic.label}\n\n` +
        `Writing prompt given to candidate:\n${promptUsed}\n\n` +
        `Prompt tier: ${promptTier.toUpperCase()} (based on Task 1 level: ${effectiveLevel})\n` +
        `IMPORTANT: The prompt tier does NOT cap the score. A candidate given a LOW prompt who writes at B2 level scores B2. ` +
        `The tier only matters for NOT_DEMONSTRATED verdicts — if a simpler prompt didn't demand a function (e.g. "present multiple perspectives"), ` +
        `use NOT_TESTED rather than NOT_DEMONSTRATED.\n\n` +
        (scaffoldContext
          ? `Scaffold context (candidate's warm-up responses — for reference only, not scored):\n${scaffoldContext}\n\n`
          : "") +
        `Candidate's extended writing response (main scored evidence):\n\n${writingText}`;

      const judgeAPromise = openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: judgeAPrompt }, { role: "user", content: diagnosisUserContent }],
        max_tokens: 4000, temperature: 0.1,
      });
      const judgeBPromise = openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: judgeBPrompt }, { role: "user", content: diagnosisUserContent }],
        max_tokens: 4000, temperature: 0.1,
      });

      const formResPromise = hasEnoughText
        ? openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: languageAnalysisPrompt },
              { role: "user", content: `Candidate's writing:\n\n${writingText}` },
            ],
            max_tokens: 2000, temperature: 0.1,
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
        try { judgeBDiagnosis = JSON.parse(judgeBCleaned); } catch { judgeBDiagnosis = null; }

        const reconciledResults = judgeBDiagnosis
          ? reconcileVerdicts(judgeADiagnosis.results || [], judgeBDiagnosis.results || [])
          : judgeADiagnosis.results || [];

        const diagnosis = { ...judgeADiagnosis, results: reconciledResults };

        const { levelResults, diagnosedLevel: calculatedLevel } = calculateDiagnosedLevel(
          diagnosis.results,
          WRITING_TASK2.levelClusters
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

        return NextResponse.json({ diagnosis, formAnalysis });
      } catch {
        return NextResponse.json(
          { error: "Failed to parse diagnosis", raw: judgeARaw },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (error) {
    console.error("Writing Task 2 API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}