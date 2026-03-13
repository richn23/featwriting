import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { WRITING_TASK4 } from "../../writing/writing-task4-descriptors";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// Build macro block for diagnosis
// ─────────────────────────────────────────────────────────────────────────────

const diagnosisMacroBlock = WRITING_TASK4.levelClusters
  .map((cluster) => {
    const macros = cluster.macroIds
      .map((id) => {
        const m = WRITING_TASK4.azeMacro.find((macro) => macro.azeId === id);
        if (!m) return "";
        const sigList = m.signals.map((s) => `      - ${s}`).join("\n");
        return `  ${m.azeId} (${cluster.label}, ${m.fn}): ${m.claim}\n    Signals:\n${sigList}`;
      })
      .filter(Boolean)
      .join("\n\n");
    return `-- ${cluster.label} -- Threshold: ${cluster.confirmThreshold}/${cluster.totalMacros} CAN to confirm --\n${macros}`;
  })
  .join("\n\n");

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────

const diagnosisPrompt = `You are a CEFR assessment specialist. You are analysing a candidate's responses from Writing Task 4: Rephrase & Adjust.

═══ CONTEXT ═══

The candidate was given short texts and asked to rewrite them — simplifying, changing tone, adjusting for a different audience, or formalising. Each challenge tests pragmatic competence: can they TRANSFORM language for a purpose?

This is NOT about producing new content. It is about CONTROLLING language — adjusting register, simplifying complexity, shifting audience.

Stimulus texts are designed to be easily understood. If the candidate appears to misunderstand the stimulus and therefore changes the meaning incorrectly, this should normally be scored NOT_YET. The task tests transformation, not reading comprehension.

═══ TYPES OF TRANSFORMATION ═══

Transformations may include:
• simplifying language
• formalising language
• making language more informal
• adapting for a specific audience (child, customer, colleague)
• restructuring a sentence while preserving meaning

At higher levels, transformations typically involve structural changes rather than simple word substitution.
At lower levels (A2–B1), word-level replacements may be sufficient evidence.

═══ WHAT TO LOOK FOR ═══

- Word-level swaps (basic) vs structural changes (advanced)
- Surface rewording vs genuine pragmatic transformation
- Does the output actually achieve the stated goal (simpler? more formal? for a child?)
- Is essential meaning preserved?
- Does the result read naturally in the target register?

═══ MACROS TO ASSESS ═══

${diagnosisMacroBlock}

═══ SCORING RULES ═══

1. CAN = clear evidence the candidate achieved this pragmatic function.
2. NOT_YET = attempted but did not clearly achieve it (e.g. changed a few words but result is still complex, or meaning was changed).
3. NOT_TESTED = the challenges did not create conditions for this macro. Use sparingly — if the task created the opportunity and the candidate did not demonstrate the function, score NOT_YET.
4. Be conservative: mixed evidence = NOT_YET.
5. A single clear transformation may be sufficient for CAN. Treat minimal or borderline evidence cautiously.
6. Copying the stimulus with minimal change = NOT_YET.
7. Replacing only one or two words without changing sentence structure is not sufficient evidence of higher-level transformation.
8. Meaning must be preserved. If the rewrite changes the core meaning of the original sentence, the transformation cannot be scored CAN even if the register change appears correct.
9. If the candidate response is extremely short or incomplete and does not clearly perform the transformation, score NOT_YET due to insufficient evidence.
10. Clear higher-level transformation may support lower-level CAN judgements when the lower-level skill is logically required by the transformation demonstrated.
11. Evidence must quote the candidate's rewritten sentence, not the original stimulus.
12. Score what the candidate DEMONSTRATED across ALL their responses.

IMPORTANT: Score EVERY macro. The system calculates the level from your scores.

═══ OUTPUT FORMAT ═══

Respond ONLY with valid JSON:
{
  "results": [
    {
      "azeId": "W4-F1",
      "claim": "Can replace words with simpler alternatives",
      "level": "A2",
      "fn": "Mediating",
      "result": "CAN|NOT_YET|NOT_TESTED",
      "rationale": "Short explanation (1 sentence)",
      "evidence": "Direct quote showing the candidate's rewritten sentence"
    }
  ]
}`;

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE ANALYSIS PROMPT (FORM)
// ─────────────────────────────────────────────────────────────────────────────

const languageAnalysisPrompt = `You are a CEFR-trained language analyst. Analyse the candidate's written responses from a rephrasing/register task.

═══ CONTEXT ═══

The candidate rewrote several texts to change their register, simplify, or adapt for different audiences. Assess the language quality of their rewrites only. Do not evaluate or quote from the original stimulus texts.

═══ DIMENSIONS ═══

1. GRAMMAR (Range & Accuracy) - structures used, accuracy, control across registers
2. VOCABULARY (Range & Precision) - ability to select vocabulary appropriate to target register
3. COHERENCE & COHESION - do the rewrites flow naturally?
4. SPELLING & MECHANICS - accuracy
5. PRAGMATIC EFFECTIVENESS - does the rewrite actually achieve its communicative goal?

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
// API Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, prevLevel } = body;

    // ── Select stimuli based on level ──────────────────────────────────
    if (action === "get-stimuli") {
      const level = prevLevel || "B1";

      const levelScore: Record<string, number> = {
        "Pre-A1": 0, "A1": 1, "A2": 2, "A2+": 3,
        "B1": 4, "B1+": 5, "B2": 6, "B2+": 7, "C1": 8,
      };
      const score = levelScore[level] ?? 4;

      const allStimuli = WRITING_TASK4.stimulusItems;
      const stimLevelScore: Record<string, number> = {
        "A2": 2, "A2_PLUS": 3, "B1": 4, "B1_PLUS": 5, "B2": 6, "B2_PLUS": 7, "C1": 8,
      };

      const sorted = [...allStimuli].sort(
        (a, b) => (stimLevelScore[a.level] ?? 4) - (stimLevelScore[b.level] ?? 4)
      );

      const selected: typeof allStimuli = [];

      const atOrBelow = sorted.filter(s => (stimLevelScore[s.level] ?? 4) <= score);
      if (atOrBelow.length > 0) selected.push(atOrBelow[atOrBelow.length - 1]);

      const atLevel = sorted.filter(s => (stimLevelScore[s.level] ?? 4) === score || (stimLevelScore[s.level] ?? 4) === score + 1);
      for (const s of atLevel) {
        if (!selected.find(x => x.id === s.id) && selected.length < 3) selected.push(s);
      }

      const stretch = sorted.filter(s => (stimLevelScore[s.level] ?? 4) > score);
      for (const s of stretch) {
        if (!selected.find(x => x.id === s.id) && selected.length < 4) selected.push(s);
      }

      for (const s of sorted) {
        if (!selected.find(x => x.id === s.id) && selected.length < 3) selected.push(s);
      }

      return NextResponse.json({ stimuli: selected });
    }

    // ── Diagnose all responses ─────────────────────────────────────────
    if (action === "diagnose") {
      const { responses } = body;

      // Send candidate responses only to form analysis
      const candidateResponsesOnly = (responses || [])
        .map((r: { response: string }, i: number) =>
          `Response ${i + 1}: ${r.response}`
        )
        .join("\n\n");

      // Send full context to function diagnosis
      const responseText = (responses || [])
        .map((r: { instruction: string; stimulus: string; response: string }, i: number) =>
          `Challenge ${i + 1}:\nInstruction: ${r.instruction}\nOriginal: ${r.stimulus}\nCandidate wrote: ${r.response}`
        )
        .join("\n\n---\n\n");

      const [functionRes, formRes] = await Promise.all([
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: diagnosisPrompt },
            { role: "user", content: `Here are the candidate's responses:\n\n${responseText}` },
          ],
          max_tokens: 4000,
          temperature: 0.1,
        }),
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: languageAnalysisPrompt },
            { role: "user", content: `Candidate responses only:\n\n${candidateResponsesOnly}` },
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

        let calculatedLevel = "Below A2";
        const levelResults: { level: string; confirmed: boolean; canCount: number; threshold: string }[] = [];

        for (const lc of WRITING_TASK4.levelClusters) {
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
        return NextResponse.json({ error: "Failed to parse diagnosis", raw: funcRaw }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Writing Task 4 API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}