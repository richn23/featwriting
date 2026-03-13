import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK3, TopicOption } from "../../writing/writing-task3-descriptors";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "assistant" | "user";
  content: string;
};


// ─────────────────────────────────────────────────────────────────────────────
// TOPIC HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function pickRandomTopics(tier: TopicOption["tier"], n: number): TopicOption[] {
  const pool = WRITING_TASK3.topicOptions.filter((t) => t.tier === tier);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function pickSwitchTopic(tier: TopicOption["tier"], excludeId?: string): TopicOption {
  const pool = WRITING_TASK3.topicOptions.filter(
    (t) => t.tier === tier && t.id !== excludeId
  );
  return pool[Math.floor(Math.random() * pool.length)];
}


// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildLevelBlock(): string {
  return WRITING_TASK3.levelClusters
    .map((cluster) => {
      const macros = cluster.macroIds
        .map((id) => {
          const m = WRITING_TASK3.azeMacro.find((macro) => macro.azeId === id);
          if (!m) return "";
          const sigList = m.signals.map((s) => `      - ${s}`).join("\n");
          return `  ${m.azeId} (${cluster.label}, ${m.fn}): ${m.claim}\n    Signals:\n${sigList}`;
        })
        .filter(Boolean)
        .join("\n\n");
      return `── ${cluster.label} — Threshold: ${cluster.confirmThreshold}/${cluster.totalMacros} ──\n${cluster.levelDescription}\n\n${macros}`;
    })
    .join("\n\n");
}

function buildConversationPrompt(
  chosenTopic: TopicOption,
  switchTopic: TopicOption | null,
  prevLevel: string
): string {
  const levelBlock = buildLevelBlock();
  const activeTopic = switchTopic ?? chosenTopic;

  return `You are an AI examiner for the AZE Writing Test — Task 3: Express & Argue.

YOUR ROLE: You are a debate partner. Your job is to get the candidate to express opinions and argue/justify them in writing. You challenge, push for reasons, introduce counter-perspectives, and ask them to defend their position.

This is NOT a friendly chat. This is a structured debate. Warm but persistent.

═══ CANDIDATE CONTEXT ═══

Estimated level from previous tasks: ${prevLevel}
${switchTopic
  ? `CURRENT TOPIC (switched): ${activeTopic.label}\nQuestion: ${activeTopic.prompt}`
  : `CHOSEN TOPIC: ${chosenTopic.label}\nQuestion: ${chosenTopic.prompt}`
}

═══ RULES ═══

1. ONE question or challenge per turn. Never ask two things.
2. Maximum 2 sentences per turn.
3. Be warm but persistent — like a good teacher who pushes.
4. When they give an opinion, challenge it using one of the challenge types below.
5. If they defend well, push harder with a deeper challenge.
6. If they struggle, simplify your challenge or rephrase.
7. Do not end the discussion with easy agreement while there is still useful argumentative evidence to elicit. Prefer follow-up challenges, requests for reasons, examples, or counter-perspectives.
8. Count as STRUGGLE only when the candidate cannot clearly state, support, or respond to an opinion in writing. Short answers alone are not struggle if they clearly perform the function.
9. If the candidate struggles on TWO consecutive challenges at the same functional level, you have found their ceiling. Stop pushing up.

═══ CHALLENGE TYPES — USE VARIETY ═══

Do not repeat the same challenge type. Rotate through these:
• Ask for a reason — "Why do you think that?"
• Ask for an example — "Can you give an example?"
• Introduce a counter-view — "But some people would say..."
• Question a limitation — "But does that always apply?"
• Ask them to compare perspectives — "How would someone on the other side see this?"
• Ask them to respond to criticism — "What would you say to someone who disagrees because...?"

Match challenge complexity to the candidate's level:
- A1–A2: "Do you like X or Y?" / "Why?" / "But some people think..."
- A2+–B1: "What do you think about X?" / "But what about the other side?" / "Can you give an example?"
- B1+: "But doesn't that ignore..." / "What would you say to someone who thinks..."
- B2+: "That assumes..." / "But from another perspective..."
- C1: "Could you be more precise about..." / "How would you respond to the criticism that..."

═══ TOPIC SWITCH RULE ═══

Switch topic only when the candidate has:
• stated a clear opinion
• given at least one reason
• responded meaningfully to at least one challenge
• maintained their position across more than one turn

${switchTopic
  ? `The topic has ALREADY been switched to: ${switchTopic.label}. Continue probing on this topic.`
  : `When all four conditions above are met: say "OK, let me ask you about something different." Then introduce the switch topic. Signal readiness with <switch_ready>true</switch_ready>.`
}

═══ LEVEL GUIDE ═══

${levelBlock}

═══ DONE SIGNAL ═══

At the end of EVERY response, add:
<ceiling>true</ceiling> — you believe you've found the candidate's ceiling
<ceiling>false</ceiling> — you want to keep probing

If you think the candidate is ready for a topic switch (conditions met, not yet switched), add:
<switch_ready>true</switch_ready>
Otherwise omit this tag.`;
}


// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const diagnosisMacroBlock = WRITING_TASK3.levelClusters
  .map((cluster) => {
    const macros = cluster.macroIds
      .map((id) => {
        const m = WRITING_TASK3.azeMacro.find((macro) => macro.azeId === id);
        if (!m) return "";
        const sigList = m.signals.map((s) => `      - ${s}`).join("\n");
        return `  ${m.azeId} (${cluster.label}, ${m.fn}): ${m.claim}\n    Signals:\n${sigList}`;
      })
      .filter(Boolean)
      .join("\n\n");
    return `── ${cluster.label} — Threshold: ${cluster.confirmThreshold}/${cluster.totalMacros} CAN to confirm ──\n${macros}`;
  })
  .join("\n\n");

const diagnosisPrompt = `You are a CEFR assessment specialist. You are analysing a candidate's written chat from Writing Task 3: Express & Argue.

═══ CONTEXT ═══

The candidate had a written debate with an AI examiner. The AI challenged their opinions and pushed them to justify their views. You are assessing the candidate's messages only.

Task 3 tests two functions:
- EXPRESSING: Can the candidate state and develop opinions in writing?
- ARGUING: Can the candidate justify, defend, and reason in writing?

The conversation may have covered multiple topics (familiar → broader → abstract).
The topic is irrelevant to scoring — assess FUNCTION, not content.
Do not reward interesting opinions, creativity, or topic knowledge. Score communicative function only.

═══ CRITICAL SCORING PRINCIPLE ═══

Score what the candidate DEMONSTRATED — not what the topic was about.
Clear higher-level competence may support lower-level CAN judgements when those lower functions are logically implied by what was demonstrated.

═══ NOT_TESTED RULE ═══

NOT_TESTED should only be used when the conversation clearly had no opportunity to demonstrate the function.
If the conversation created the opportunity but the candidate did not demonstrate the function, score NOT_YET — not NOT_TESTED.

═══ MACROS TO ASSESS ═══

${diagnosisMacroBlock}

═══ SCORING RULES ═══

1. CAN = clear evidence in the writing that the candidate achieved this function.
2. NOT_YET = the writing attempted this function but did not achieve it clearly, or no evidence exists.
3. NOT_TESTED = use only when no opportunity to demonstrate the function existed (use sparingly).
4. Be conservative: mixed evidence = NOT_YET.
5. A single clear instance under appropriate communicative demand may be sufficient for CAN. Treat minimal evidence cautiously.
6. Multiple weak instances do NOT combine into CAN.
7. Clear higher-level competence may support lower-level CAN judgements when those lower functions are logically implied.

IMPORTANT: Score EVERY macro. The system calculates the level from your scores.

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON:
{
  "results": [
    {
      "azeId": "W3-F1",
      "claim": "Can state a like, dislike, or simple preference",
      "level": "A1",
      "fn": "Expressing",
      "result": "CAN|NOT_YET|NOT_TESTED",
      "rationale": "Short explanation (1 sentence)",
      "evidence": "Direct quote from the transcript"
    }
  ]
}`;


// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE ANALYSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const languageAnalysisPrompt = `You are a CEFR-trained language analyst. Analyse the candidate's written messages from a debate/argument task.

═══ CONTEXT ═══

The candidate had a written debate with an AI. Assess the language quality of the candidate's messages only. Ignore the AI examiner's messages entirely.

═══ DIMENSIONS ═══

For each dimension, provide a CEFR band, descriptor, and 1-2 examples:

1. GRAMMAR (Range & Accuracy) — structures used, accuracy, control
2. VOCABULARY (Range & Precision) — breadth, appropriacy, precision of argumentative language
3. COHERENCE & COHESION — logical flow, linking, argument structure
4. SPELLING & MECHANICS — accuracy, impact on communication
5. COMMUNICATIVE EFFECTIVENESS — does the writing achieve its argumentative purpose?

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON:
{
  "overallFormLevel": "B1",
  "overallFormSummary": "2-sentence summary",
  "dimensions": [
    {
      "dimension": "Grammar",
      "level": "B1",
      "descriptor": "One sentence",
      "examples": ["quote 1", "quote 2"]
    }
  ]
}`;


// ─────────────────────────────────────────────────────────────────────────────
// API HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      messages,
      exchangeCount,
      wrapUp,
      chosenTopicId,
      switchTopicId,
      task1Level,
      task2Level,
    } = body;

    // ── Get topic choices ──────────────────────────────────────────────
    if (action === "get-topics") {
      const choices = pickRandomTopics(
        "familiar",
        WRITING_TASK3.principles.familiarTopicsShownToCandidate
      );
      return NextResponse.json({ choices });
    }


    // ── Conversation turn ──────────────────────────────────────────────
    if (action === "chat") {
      const prevLevel = task2Level || task1Level || "unknown";

      const chosenTopic =
        WRITING_TASK3.topicOptions.find((t) => t.id === chosenTopicId) ??
        WRITING_TASK3.topicOptions.find((t) => t.tier === "familiar")!;

      const switchTopic = switchTopicId
        ? WRITING_TASK3.topicOptions.find((t) => t.id === switchTopicId) ?? null
        : null;

      const conversationPrompt = buildConversationPrompt(chosenTopic, switchTopic, prevLevel);
      let prompt = conversationPrompt;

      if (exchangeCount === 0) {
        prompt +=
          `\n\nThis is the START. Introduce the topic warmly and ask their opinion: ` +
          `"${chosenTopic.prompt}" — keep it short and chat-like. Keep the first question concrete and easy to answer.`;
      } else if (wrapUp) {
        prompt +=
          "\n\nThis is the final exchange. Thank the candidate briefly in 1 sentence. " +
          "Add <ceiling>true</ceiling>.";
      } else {
        prompt +=
          `\n\nThis is exchange ${exchangeCount} of up to ${WRITING_TASK3.meta.maxExchanges}. ` +
          `Challenge their last response using one of the challenge types. Prefer a different challenge type from the previous turn unless repetition is necessary for repair.`;
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
      const ceilingReached = ceilingMatch ? ceilingMatch[1] === "true" : false;

      const switchReadyMatch = rawMessage.match(/<switch_ready>true<\/switch_ready>/);
      const switchReady = !!switchReadyMatch;

      const aiMessage = rawMessage
        .replace(/<ceiling>(true|false)<\/ceiling>/g, "")
        .replace(/<switch_ready>true<\/switch_ready>/g, "")
        .trim();

      let nextSwitchTopic: TopicOption | null = null;
      if (switchReady && !switchTopicId) {
        const switchTier = switchTopic?.tier === "broader" ? "abstract" : "broader";
        nextSwitchTopic = pickSwitchTopic(switchTier, chosenTopicId);
      }

      return NextResponse.json({
        message: aiMessage,
        ceilingReached,
        switchReady,
        switchTopic: nextSwitchTopic,
      });
    }


    // ── Diagnosis ──────────────────────────────────────────────────────
    if (action === "diagnose") {
      const transcript = (messages || [])
        .map((m: Message) => `${m.role === "assistant" ? "AI" : "Candidate"}: ${m.content}`)
        .join("\n");

      const candidateOnly = (messages || [])
        .filter((m: Message) => m.role === "user")
        .map((m: Message) => m.content)
        .join("\n");

      const [functionRes, formRes] = await Promise.all([
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: diagnosisPrompt },
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

        let calculatedLevel = "Below A1";
        const levelResults: {
          level: string;
          confirmed: boolean;
          canCount: number;
          threshold: string;
        }[] = [];

        for (const lc of WRITING_TASK3.levelClusters) {
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
    console.error("Writing Task 3 API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}