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

Stimulus texts are designed to be easily understood. If the candidate appears to misunderstand the stimulus and therefore changes the meaning in a way that breaks the communicative goal, weigh that in your judgement — but see the meaning-preservation rules below (do not apply B2+ strictness to A2–B1). The task tests transformation, not reading comprehension in isolation.

═══ CORE SCORING PRINCIPLE (VERY IMPORTANT) ═══

The difficulty, length, or formality of the original stimulus text does NOT determine the score. Do not reward or penalise the candidate because the source text was “easy” or “hard”. Score only the candidate’s demonstrated ability to transform language effectively for each challenge’s instruction.

═══ TYPES OF TRANSFORMATION ═══

Transformations may include:
• simplifying language
• formalising language
• making language more informal
• adapting for a specific audience (child, customer, colleague)
• restructuring a sentence while preserving meaning

At higher levels, transformations typically involve structural changes rather than simple word substitution.
At lower levels (A2–B1), word-level replacements may be sufficient evidence.

═══ MEANING PRESERVATION & PARTIAL SUCCESS ═══

Meaning should be broadly preserved. Minor distortions, loss of secondary detail, or small slips may still be acceptable at lower levels (A2–B1) as long as the core message remains recognisable and the transformation goal is still met. At higher levels (B2+ and above), meaning must be preserved more precisely; substantive meaning shifts or misleading rewrites score NOT_YET.

Partial transformation may still be valid evidence at lower levels — for example: simplifying some parts but not all, shifting tone inconsistently, or incomplete restructuring. These may support CAN at A2–B1 when the core transformation is visible. At B2+, expect fuller, more consistent transformation; patchy or incomplete work that might pass at lower levels should often be NOT_YET.

═══ AUDIENCE ADAPTATION ═══

If a challenge specifies an audience (e.g. child, customer, colleague), the rewrite must clearly reflect that audience in language and tone. If the output does not adapt appropriately and the macro relates to audience/register adaptation for that challenge, score NOT_YET for that macro. Do not award CAN for “correct” wording that ignores the stated audience.

═══ WHAT TO LOOK FOR ═══

- Word-level swaps (basic) vs structural changes (advanced)
- Surface rewording vs genuine pragmatic transformation
- Does the output actually achieve the stated goal (simpler? more formal? for a child?)
- Is the meaning broadly preserved (see level-sensitive rules above)?
- Does the result read naturally in the target register?
- Partial transformation at lower levels vs full, consistent transformation at higher levels

═══ MACROS TO ASSESS ═══

${diagnosisMacroBlock}

═══ SCORING RULES ═══

1. CAN = clear evidence the candidate achieved this pragmatic function in the relevant evidence.
2. NOT_YET = attempted but did not clearly achieve it at the expected standard for the level, or clear failure on meaning/audience/pragmatic goal where the macro applies.
3. NOT_TESTED = the challenges did not create a realistic opportunity to demonstrate this macro. If the task set did not fairly allow observation (e.g. no relevant challenge type for that macro), use NOT_TESTED. Do NOT force NOT_YET when there was no clear opportunity to demonstrate the function.
4. Include every macro in your JSON output. Score each macro based on available evidence across all responses; do not skip macros. Use NOT_TESTED where appropriate instead of artificial NOT_YET when no opportunity existed.
5. At lower levels (A2–B1), mixed or partial evidence may still support CAN if the core transformation is visible. At B2+, be stricter: inconsistent evidence often = NOT_YET.
6. A single clear transformation may be sufficient for CAN. Treat minimal or borderline evidence cautiously, with level-appropriate expectations.
7. Copying the stimulus with minimal change = NOT_YET.
8. Replacing only one or two words without changing sentence structure is not sufficient evidence of higher-level transformation.
9. If the candidate response is extremely short or incomplete and does not clearly perform the transformation, score NOT_YET due to insufficient evidence.
10. Clear higher-level transformation may support lower-level CAN judgements when the lower-level skill is logically required by the transformation demonstrated.
11. Evidence must quote the candidate's rewritten sentence, not the original stimulus.
12. Score what the candidate DEMONSTRATED across ALL their responses.

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
      "azeId": "W4-F1",
      "claim": "Can replace words with simpler alternatives",
      "level": "A2",
      "fn": "Mediating",
      "result": "CONFIRMED|NOT_DEMONSTRATED|NOT_TESTED",
      "confidence": "HIGH|MEDIUM|LOW",
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

Do not evaluate the complexity or difficulty of the original stimulus texts. Judge only the candidate’s ability to control grammar, vocabulary, coherence, and pragmatic effectiveness in their own rewrite — not how demanding the source material was.

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

      // B2+ candidates: ensure at least one high-level stimulus (B2+ on stimulus scale) for ceiling evidence
      if (score >= 6) {
        const hasHighLevel = selected.some(s => (stimLevelScore[s.level] ?? 4) >= 6);
        if (!hasHighLevel) {
          const highLevelItems = sorted.filter(s => (stimLevelScore[s.level] ?? 4) >= 6);
          for (const s of highLevelItems) {
            if (!selected.find(x => x.id === s.id)) {
              if (selected.length > 0) selected[selected.length - 1] = s;
              break;
            }
          }
        }
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