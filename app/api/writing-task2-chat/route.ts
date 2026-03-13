import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK2, Topic } from "../../writing/writing-task2-descriptors";
import { buildLanguageAnalysisPrompt } from "../../writing/language-rubric";

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
// WRITING PROMPT SELECTION
// Picks the right level-banded prompt based on Task 1 diagnosed level.
// ─────────────────────────────────────────────────────────────────────────────

function pickWritingPrompt(topic: Topic, task1Level: string): string {
  const high = ["B2", "B2+", "C1"];
  const mid  = ["A2+", "B1", "B1+"];
  if (high.includes(task1Level)) return topic.writingPrompts.high;
  if (mid.includes(task1Level))  return topic.writingPrompts.mid;
  return topic.writingPrompts.low;
}


// ─────────────────────────────────────────────────────────────────────────────
// SCAFFOLD CONVERSATION PROMPT
// Task 2 Phase 1: warm-up chat on the topic. NOT assessed.
// Candidate name and Task 1 level are injected so the AI can personalise.
// ─────────────────────────────────────────────────────────────────────────────

function buildScaffoldPrompt(topic: Topic, candidateName: string, task1Level: string): string {
  return `You are an AI examiner for the AZE Writing Test — Task 2: ${WRITING_TASK2.meta.title}.

THIS IS THE SCAFFOLDING PHASE. It is NOT assessed. Your job is to warm the candidate up on the topic before they write.

The candidate's name is: ${candidateName || "the candidate"}
Their estimated level from Task 1: ${task1Level || "unknown"}

TODAY'S TOPIC: ${topic.label}
${topic.scaffoldSeed}

YOUR RULES:
1. Use the candidate's name naturally — you already know it, don't ask for it again.
2. ONE question per turn. Short and chat-like.
3. Maximum 2 sentences per turn.
4. Be warm and encouraging — this is preparation, not testing.
5. Keep questions simple and directly about the topic.
6. Do NOT assess or judge their writing. This is just a warm-up conversation.
7. Stay on the topic: ${topic.label}. Do not drift.
8. After ${WRITING_TASK2.meta.scaffoldingExchanges} exchanges, naturally wrap up and signal they are ready to write.

QUESTION QUALITY:
- SHORT and DIRECT. No implied context.
- At lower levels (A1–A2): maximum 8 words.
- At higher levels: maximum 15 words. Still one clear question.
- If they mention something specific, ask directly about that thing.

At the end of EVERY response, add:
<done>true</done> — if scaffolding is complete and they should move to writing
<done>false</done> — if scaffolding should continue`;
}


// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSIS PROMPT
// Scores the extended writing response against Task 2 macros.
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

  return `You are a CEFR assessment specialist. You are scoring a candidate's extended written response from Writing Task 2: Inform & Narrate.

═══ CONTEXT ═══

The candidate wrote an extended response to a prompt. This is a WRITING test.

Task 2 tests two functions:
- INFORMING: Can the candidate convey information clearly in writing?
- NARRATING: Can the candidate recount events, experiences, or sequences in writing?

The topic is irrelevant to scoring — assess FUNCTION, not content.
Macros are topic-agnostic: the same macro applies whether writing about a holiday, a job, or a friend.

═══ MACROS TO ASSESS ═══

${macroBlock}

═══ SCORING RULES ═══

1. CAN = clear evidence in the writing that the candidate achieved this communicative function.
2. NOT_YET = the writing attempted this function but did not achieve it clearly.
3. NOT_TESTED = the writing had no opportunity to demonstrate this function.
4. Be conservative: mixed evidence = NOT_YET.
5. A single clear instance IS sufficient for CAN.
6. Multiple weak instances do NOT combine into CAN.
7. Higher-level demonstration overrides lower-level gaps.
8. Score EVERY macro. Do not skip any.

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON, no other text:
{
  "results": [
    {
      "azeId": "W2-F1",
      "claim": "Can produce simple factual statements in writing",
      "level": "A1",
      "fn": "Informing",
      "result": "CAN|NOT_YET|NOT_TESTED",
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
// ─────────────────────────────────────────────────────────────────────────────

const SCORE_MAP: Record<string, number> = {
  "A1":  2,
  "A2":  4,
  "A2+": 5,
  "B1":  6,
  "B1+": 7,
  "B2":  8,
  "B2+": 9,
  "C1":  10,
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
      writingResponse,
    } = await req.json();

    const topic: Topic = topicFromClient ?? pickRandomTopic();


    // ── Scaffold chat turn ─────────────────────────────────────────────────
    if (action === "scaffold") {
      const scaffoldPrompt = buildScaffoldPrompt(topic, candidateName || "", task1Level || "");
      let prompt = scaffoldPrompt;

      if (exchangeCount === 0) {
        prompt +=
          `\n\nThis is the START. Greet ${candidateName || "the candidate"} by name and ask the first ` +
          `warm-up question about the topic. Keep it short and friendly. Add <done>false</done>.`;
      } else if (exchangeCount >= WRITING_TASK2.meta.scaffoldingExchanges - 1) {
        prompt +=
          `\n\nThis is the final scaffolding exchange. Wrap up warmly in 1 sentence and ` +
          `tell them they are ready to write. Add <done>true</done>.`;
      } else {
        prompt +=
          `\n\nThis is scaffolding exchange ${exchangeCount}. Ask ONE short, direct follow-up ` +
          `question about ${topic.label}. Stay on topic. Add <done>false</done>.`;
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

      const doneMatch = rawMessage.match(/<done>(true|false)<\/done>/);
      const scaffoldDone = doneMatch ? doneMatch[1] === "true" : false;

      const aiMessage = rawMessage
        .replace(/<done>(true|false)<\/done>/g, "")
        .trim();

      // Pick the level-appropriate writing prompt
      const writingPrompt = pickWritingPrompt(topic, task1Level || "A1");

      return NextResponse.json({ message: aiMessage, scaffoldDone, topic, writingPrompt });
    }


    // ── Diagnose extended writing ──────────────────────────────────────────
    if (action === "diagnose") {
      if (!writingResponse) {
        return NextResponse.json({ error: "No writing response provided" }, { status: 400 });
      }

      const [functionRes, formRes] = await Promise.all([
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: buildDiagnosisPrompt() },
            {
              role: "user",
              content:
                `Topic: ${topic.label}\n\n` +
                `Writing prompt given: ${pickWritingPrompt(topic, task1Level || "A1")}\n\n` +
                `Candidate's response:\n\n${writingResponse}`,
            },
          ],
          max_tokens: 4000,
          temperature: 0.1,
        }),
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: languageAnalysisPrompt },
            {
              role: "user",
              content: `Candidate's writing:\n\n${writingResponse}`,
            },
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

        let calculatedLevel = "Below A1";
        const levelResults: {
          level: string;
          confirmed: boolean;
          canCount: number;
          threshold: string;
        }[] = [];

        for (const lc of WRITING_TASK2.levelClusters) {
          const canCount = lc.macroIds.filter((id) => {
            const r = resultsMap.get(id);
            return r && (r as { result: string }).result === "CAN";
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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (error) {
    console.error("Writing Task 2 API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}