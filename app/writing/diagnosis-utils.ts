/**
 * Shared diagnosis utilities — dual-judge reconciliation, confidence
 * gating, and level calculation.
 *
 * Used by all 5 task chat routes to ensure consistent handling of
 * macro verdicts and confidence thresholds.
 *
 * Reliability model:
 *   1. Two independent GPT calls score the same transcript ("Judge A" and "Judge B")
 *   2. reconcileVerdicts() merges them — both must agree on CONFIRMED
 *   3. Confidence gating filters LOW-confidence verdicts from thresholds
 *   4. calculateDiagnosedLevel() computes the final CEFR level
 */

export type MacroVerdict = {
  azeId: string;
  claim: string;
  level: string;
  fn: string;
  result: "CONFIRMED" | "NOT_DEMONSTRATED" | "NOT_TESTED";
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  rationale: string;
  evidence: string;
};

export type LevelCluster = {
  level: string;
  label: string;
  macroIds: string[];
  confirmThreshold: number;
  totalMacros: number;
};

export type LevelResult = {
  level: string;
  confirmed: boolean;
  canCount: number;
  threshold: string;
};

/**
 * Determines whether a macro verdict counts as confirmed for level thresholds.
 *
 * Rules:
 * - CONFIRMED with HIGH or MEDIUM confidence → counts
 * - CONFIRMED with LOW confidence → does NOT count toward threshold
 * - CONFIRMED with no confidence field → counts (backwards compatibility)
 * - NOT_DEMONSTRATED / NOT_TESTED → does not count
 *
 * The original verdict is preserved in the results — this only affects
 * whether the macro contributes to level confirmation.
 */
export function isConfirmedForThreshold(verdict: MacroVerdict): boolean {
  if (verdict.result !== "CONFIRMED") return false;
  if (!verdict.confidence) return true; // no confidence field → count it
  return verdict.confidence === "HIGH" || verdict.confidence === "MEDIUM";
}

/**
 * Calculate diagnosed level from macro verdicts and level clusters.
 * Applies confidence gating — LOW confidence CONFIRMED verdicts
 * do not count toward level thresholds.
 *
 * Returns the level results array and the diagnosed level string.
 */
export function calculateDiagnosedLevel(
  results: MacroVerdict[],
  levelClusters: LevelCluster[]
): { levelResults: LevelResult[]; diagnosedLevel: string } {
  const resultsMap = new Map(results.map(r => [r.azeId, r]));

  let diagnosedLevel = "Below Pre-A1";
  const levelResults: LevelResult[] = [];

  for (const lc of levelClusters) {
    const canCount = lc.macroIds.filter(id => {
      const r = resultsMap.get(id);
      return r ? isConfirmedForThreshold(r) : false;
    }).length;

    const confirmed = canCount >= lc.confirmThreshold;
    levelResults.push({
      level: lc.level,
      confirmed,
      canCount,
      threshold: `${lc.confirmThreshold}/${lc.totalMacros}`,
    });

    if (confirmed) diagnosedLevel = lc.label;
  }

  return { levelResults, diagnosedLevel };
}


/**
 * Dual-judge reconciliation.
 *
 * Two independent diagnosis calls score the same transcript. This function
 * merges them into a single agreed result set:
 *
 *   Both CONFIRMED         → CONFIRMED (keep higher confidence)
 *   One CONFIRMED, one not → NOT_DEMONSTRATED (disagreement → conservative)
 *   Both NOT_DEMONSTRATED  → NOT_DEMONSTRATED
 *   Either NOT_TESTED      → use the other judge's verdict
 *   Both NOT_TESTED        → NOT_TESTED
 *
 * Rationale and evidence are taken from the judge with the higher confidence,
 * or from Judge A if equal. A "judgeAgreement" field is added so the UI
 * can flag disagreements.
 */
/**
 * Wraps a Judge A diagnosis prompt to create a Judge B version.
 *
 * Same rubric, same macros, same output format — but different cognitive
 * framing so the model approaches the evidence independently:
 *   - Judge A: "determine whether each function was CONFIRMED"
 *   - Judge B: "look for reasons NOT to confirm — only confirm if evidence survives scrutiny"
 *
 * This produces genuinely different judgment patterns without changing
 * the scoring criteria.
 */
export function buildJudgeBPrompt(judgeAPrompt: string): string {
  return `SECOND-PASS VERIFICATION REVIEW

You are a CEFR verification reviewer. Another assessor has already scored this transcript. Your job is to conduct an INDEPENDENT second review from scratch.

IMPORTANT: Do NOT assume the first assessor was correct. Review ALL evidence yourself.

Your approach:
- For each macro, actively look for reasons the candidate may NOT have demonstrated the function.
- Only score CONFIRMED if the evidence clearly survives scrutiny — a genuine, unambiguous demonstration.
- If evidence is partial, indirect, or could be explained by copying/repetition rather than real ability, score NOT_DEMONSTRATED.
- Be especially critical at boundary levels where performance is marginal.

Use the same rubric, macros, and output format as below.

---

${judgeAPrompt}`;
}


export function reconcileVerdicts(
  judgeA: MacroVerdict[],
  judgeB: MacroVerdict[]
): MacroVerdict[] {
  const bMap = new Map(judgeB.map(r => [r.azeId, r]));
  const confRank: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  return judgeA.map(a => {
    const b = bMap.get(a.azeId);

    // If Judge B didn't score this macro, use Judge A's verdict as-is
    if (!b) return { ...a, judgeAgreement: "single" } as MacroVerdict & { judgeAgreement: string };

    const aIsConfirmed = a.result === "CONFIRMED";
    const bIsConfirmed = b.result === "CONFIRMED";
    const aNotTested = a.result === "NOT_TESTED";
    const bNotTested = b.result === "NOT_TESTED";

    // If either judge marked NOT_TESTED, defer to the other
    if (aNotTested && bNotTested) return { ...a, judgeAgreement: "agree" };
    if (aNotTested) return { ...b, judgeAgreement: "single" };
    if (bNotTested) return { ...a, judgeAgreement: "single" };

    // Both judges scored — check agreement
    const aConf = confRank[a.confidence ?? "LOW"] ?? 1;
    const bConf = confRank[b.confidence ?? "LOW"] ?? 1;
    const stronger = aConf >= bConf ? a : b;

    if (aIsConfirmed && bIsConfirmed) {
      // Agreement on CONFIRMED — take the stronger judge's detail
      return {
        ...stronger,
        judgeAgreement: "agree",
      };
    }

    if (!aIsConfirmed && !bIsConfirmed) {
      // Agreement on NOT_DEMONSTRATED
      return {
        ...stronger,
        result: "NOT_DEMONSTRATED" as const,
        judgeAgreement: "agree",
      };
    }

    // Disagreement — one says CONFIRMED, the other doesn't → conservative
    return {
      ...stronger,
      result: "NOT_DEMONSTRATED" as const,
      confidence: "LOW" as const,
      rationale: `Split verdict — one judge confirmed, one did not. ${stronger.rationale}`,
      judgeAgreement: "disagree",
    };
  });
}
