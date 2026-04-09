import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK3, TopicOption } from "../../writing/writing-task3-descriptors";
import { calculateDiagnosedLevel, buildJudgeBPrompt, reconcileVerdicts } from "../../writing/diagnosis-utils";

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

This is a natural conversation where you challenge the candidate's ideas.
Be warm, but do not simply agree — push them to explain and justify their opinions.

═══ TOPIC CONTROL ═══

Stay on the current topic at all times.
Do not introduce unrelated topics.

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
4. Do not escalate difficulty too quickly. Increase challenge gradually based on the candidate's responses.
5. When possible, refer to what the candidate just said when forming your challenge (e.g. tie counter-views to their wording — "You said it's better — but what about people who think the opposite?" rather than a generic "But some people would say...").
6. Avoid repeating the same idea or argument. Each challenge should move the discussion forward.
7. When they give an opinion, challenge it using one of the challenge types below.
8. If they defend well, increase the challenge slightly by asking for deeper reasoning, examples, or alternative perspectives.
9. If they struggle, simplify your challenge or rephrase.
10. Do not end the discussion with easy agreement while there is still useful argumentative evidence to elicit. Prefer follow-up challenges, requests for reasons, examples, or counter-perspectives.
11. Count as STRUGGLE only when the candidate cannot clearly state, support, or respond to an opinion in writing. Short answers alone are not struggle if they clearly perform the function.
12. If the candidate struggles repeatedly, reduce the complexity of your questions rather than stopping the conversation.

═══ CHALLENGE TYPES — USE VARIETY ═══

Do not repeat the same challenge type. Rotate through these:
• Ask for clarification — "What do you mean?" / "Can you explain that more clearly?"
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
  ? `The topic has ALREADY been switched to: ${switchTopic.label}. Continue probing on this topic only.`
  : `When all four conditions above are met: say "OK, let's look at something different." Then introduce the new topic clearly and explicitly. Signal readiness with <switch_ready>true</switch_ready>.`
}

═══ FIRST TURN (opening message only — exchange 0) ═══

Apply only when generating the very first assistant message in the conversation.
Structure it as:
"Let's talk about this: ${chosenTopic.label}."
"${chosenTopic.prompt} What do you think?"
Keep both parts. Maximum 2 sentences in total (the second line may combine the topic question with the opinion prompt).

═══ LEVEL GUIDE ═══

${levelBlock}

═══ DONE SIGNAL ═══

At the end of EVERY response, add:
<ceiling>true</ceiling> — you believe you've gathered sufficient evidence of the candidate's ability to express and argue for this phase (not merely because they struggled once — simplify questions first if they struggle repeatedly)
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

Use NOT_TESTED only when no opportunity existed for that function to be demonstrated.
If any opportunity existed — even briefly — and the candidate did not demonstrate the function, score NOT_YET, not NOT_TESTED.

═══ MACROS TO ASSESS ═══

${diagnosisMacroBlock}

═══ SCORING RULES ═══

1. CONFIRMED = clear evidence in the writing that the candidate achieved this function.
2. NOT_DEMONSTRATED = the writing attempted this function but did not achieve it clearly, or no evidence exists.
3. NOT_TESTED = use only when no opportunity to demonstrate the function existed. Otherwise NOT_DEMONSTRATED.
4. Be conservative: mixed evidence = NOT_DEMONSTRATED.
5. A single clear instance under appropriate communicative demand may be sufficient for CONFIRMED. Treat minimal evidence cautiously.
6. Multiple weak instances do NOT combine into CONFIRMED.
7. Clear higher-level competence may support lower-level CONFIRMED judgements when those lower functions are logically implied.

IMPORTANT: Score EVERY macro. The system calculates the level from your scores.

═══ CONFIDENCE LEVEL ═══

For each macro judgement assign a confidence level:

HIGH — clear, direct evidence of the function under appropriate communicative demand.
MEDIUM — some evidence is present but limited in length, complexity, or clarity.
LOW — evidence is weak, indirect, or borderline.

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON:
{
  "results": [
    {
      "azeId": "W3-F1",
      "claim": "Can state a like, dislike, or simple preference",
      "level": "A1",
      "fn": "Expressing",
      "result": "CONFIRMED|NOT_DEMONSTRATED|NOT_TESTED",
      "confidence": "HIGH|MEDIUM|LOW",
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
      chosenTopicId: chosenTopicIdRaw,
      switchTopicId: switchTopicIdRaw,
      task1Level,
      task2Level,
    } = body;
    const chosenTopicId = chosenTopicIdRaw ?? body.chosenTopic;
    const switchTopicId = switchTopicIdRaw ?? body.switchTopic;

    // ── Get topic choices ──────────────────────────────────────────────
    if (action === "get-topics") {
      const prevLevel = task2Level || task1Level || "unknown";
      let initialTier: TopicOption["tier"];

      if (prevLevel.includes("B2") || prevLevel.includes("C1")) {
        initialTier = "broader";
      } else {
        initialTier = "familiar";
      }

      const choices = pickRandomTopics(
        initialTier,
        WRITING_TASK3.principles.familiarTopicsShownToCandidate
      );
      return NextResponse.json({ choices });
    }


    // ── Conversation turn ──────────────────────────────────────────────
    if (action === "chat") {
      const MIN_EXCHANGES_BEFORE_WRAP = 4;
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
          "\n\nThis is exchange 0 — you are sending the FIRST message only. Follow the FIRST TURN format in the system prompt above.";
      } else if (wrapUp && exchangeCount < MIN_EXCHANGES_BEFORE_WRAP) {
        prompt +=
          "\n\nNot enough exchanges have occurred for a final wrap-up. Continue with one short, simpler challenge (do not thank or close the task). Add <ceiling>false</ceiling>.";
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
      const ceilingReachedRaw = ceilingMatch ? ceilingMatch[1] === "true" : false;
      const ceilingReached =
        ceilingReachedRaw &&
        exchangeCount >= MIN_EXCHANGES_BEFORE_WRAP &&
        !(wrapUp && exchangeCount < MIN_EXCHANGES_BEFORE_WRAP);

      const switchReadyMatch = rawMessage.match(/<switch_ready>true<\/switch_ready>/);
      const switchReady = !!switchReadyMatch;

      const aiMessage = rawMessage
        .replace(/<ceiling>(true|false)<\/ceiling>/g, "")
        .replace(/<switch_ready>true<\/switch_ready>/g, "")
        .trim();

      let nextSwitchTopic: TopicOption | null = null;
      if (switchReady && !switchTopicId) {
        let switchTier: TopicOption["tier"];
        if (prevLevel.includes("B2") || prevLevel.includes("C1")) {
          switchTier = "abstract";
        } else {
          switchTier = "broader";
        }
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

      const candidateWordCount = candidateOnly.trim().split(/\s+/).filter(Boolean).length;
      const hasEnoughText = candidateWordCount >= 10;

      const judgeBPrompt = buildJudgeBPrompt(diagnosisPrompt);
      const transcriptContent = `Here is the full transcript:\n\n${transcript}`;

      const judgeAPromise = openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: diagnosisPrompt }, { role: "user", content: transcriptContent }],
        max_tokens: 4000, temperature: 0.1,
      });
      const judgeBPromise = openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: judgeBPrompt }, { role: "user", content: transcriptContent }],
        max_tokens: 4000, temperature: 0.1,
      });

      const formResPromise = hasEnoughText
        ? openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: languageAnalysisPrompt },
              { role: "user", content: `Candidate messages only:\n\n${candidateOnly}` },
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
          WRITING_TASK3.levelClusters
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
    console.error("Writing Task 3 API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}