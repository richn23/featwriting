import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK5, StimulusSet } from "../../writing/writing-task5-descriptors";
import { buildLanguageAnalysisPrompt } from "../../writing/language-rubric";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "assistant" | "user";
  content: string;
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

function buildConversationPrompt(stimSet: StimulusSet | null): string {
  const cardDesc = (card: StimulusSet["cardA"]) =>
    `${card.name} (${card.rating}★, ${card.price} ${card.priceNote ?? ""}): ` +
    card.features.map(f => `${f.label}: ${f.value}`).join(" | ");

  const cardBlock = stimSet
    ? `═══ THE CANDIDATE CAN SEE THESE TWO CARDS ═══\n\n` +
      `Option A: ${cardDesc(stimSet.cardA)}\n` +
      `Option B: ${cardDesc(stimSet.cardB)}\n\n` +
      `Suggested situations (use as inspiration — vary wording each time):\n` +
      stimSet.situations.map((s, i) => `${i + 1}. ${s}`).join("\n")
    : "No card data available.";

  return `You are an AI examiner for the AZE Writing Test — Task 5: Compare & Advise.

YOUR ROLE: The candidate can see two option cards on their screen. You ask situational questions that require them to mediate — relay information from the cards to match specific needs.

${cardBlock}

═══ RULES ═══

1. ONE question at a time. Never ask two things.
2. Maximum 2 sentences per turn.
3. Be warm and conversational — like a friend asking for advice.
4. Start by asking them to describe the main differences between the two options.
5. Then introduce situations: "My friend needs X. Which would you recommend?"
6. After they answer, CHANGE the situation: "But what if they also need Y?"
7. Push for reasons: "Why that one?" / "The other has X — doesn't that matter?"
8. Reward scenario adaptation: if they adjust their recommendation when the situation changes, that is strong evidence of mediation ability — probe this actively.
9. If they struggle on TWO consecutive questions, you have found their ceiling.

═══ PROBING STRATEGY ═══

- Exchange 1–2: "What are the main differences?" (basic comparison → W5-F1, W5-F2)
- Exchange 3–4: "Which for [person with need A]?" (simple recommendation → W5-F3, W5-F4)
- Exchange 5–6: "But what about [complication]?" (trade-off weighing → W5-F5, W5-F6)
- Exchange 7–8: "Now imagine [different person]" (scenario switch → W5-F7)
- Exchange 9+: "They also need [conflicting requirement]" (synthesis → W5-F8)

═══ DONE SIGNAL ═══

At the end of EVERY response, add:
<ceiling>true</ceiling> — you believe you've found the candidate's ceiling
<ceiling>false</ceiling> — you want to keep probing`;
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

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON:
{
  "results": [
    {
      "azeId": "W5-F1",
      "claim": "Can identify and state basic facts from a visual source",
      "level": "A1",
      "fn": "Informing",
      "result": "CAN|NOT_YET|NOT_TESTED",
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
    const { action, messages, exchangeCount, wrapUp, stimulusSetId, prevLevel } = body;


    // ── Select stimulus set ────────────────────────────────────────────
    if (action === "get-stimulus") {
      const stimulusSet = pickRandomSet(prevLevel || "B1");
      return NextResponse.json({ stimulusSet });
    }


    // ── Conversation turn ──────────────────────────────────────────────
    if (action === "chat") {
      const stimSet = WRITING_TASK5.stimulusSets.find(s => s.id === stimulusSetId) ?? null;
      const conversationPrompt = buildConversationPrompt(stimSet);
      let prompt = conversationPrompt;

      if (exchangeCount === 0) {
        prompt +=
          `\n\nThis is the START. Greet warmly and ask: ` +
          `"Take a look at these two options. What are the main differences you can see?"`;
      } else if (wrapUp) {
        prompt +=
          "\n\nThis is the final exchange. Thank the candidate briefly in 1 sentence. " +
          "Add <ceiling>true</ceiling>.";
      } else {
        prompt +=
          `\n\nThis is exchange ${exchangeCount} of up to ${WRITING_TASK5.meta.maxExchanges}. ` +
          `Ask the next situational question or probe their last answer. ` +
          `If they gave a recommendation, change the situation to test whether they adapt.`;
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
      const aiMessage = rawMessage
        .replace(/<ceiling>(true|false)<\/ceiling>/g, "")
        .trim();

      return NextResponse.json({ message: aiMessage, ceilingReached });
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

        for (const lc of WRITING_TASK5.levelClusters) {
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
        try { formAnalysis = JSON.parse(formCleaned); } catch { /* skip */ }

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
    console.error("Writing Task 5 API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}