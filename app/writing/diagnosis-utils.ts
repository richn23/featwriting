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
 * Probe target identification.
 *
 * After initial diagnosis, identifies MEDIUM-confidence CONFIRMED macros
 * at the boundary level (the diagnosed level or one above). These are
 * candidates for follow-up probing to firm up confidence.
 *
 * Returns an array of probe targets — empty if no probing needed.
 */
export type ProbeTarget = {
  azeId: string;
  claim: string;
  level: string;
  fn: string;
  confidence: string;
};

export function identifyProbeTargets(
  results: MacroVerdict[],
  levelClusters: LevelCluster[],
  diagnosedLevel: string
): ProbeTarget[] {
  // Find the diagnosed level cluster and one above it
  const clusterLabels = levelClusters.map(lc => lc.label);
  const diagIdx = clusterLabels.indexOf(diagnosedLevel);

  // Gather macroIds at the diagnosed level and one above
  const targetLevels = new Set<string>();
  if (diagIdx >= 0) targetLevels.add(clusterLabels[diagIdx]);
  if (diagIdx >= 0 && diagIdx + 1 < clusterLabels.length) targetLevels.add(clusterLabels[diagIdx + 1]);

  // If diagnosed level is "Below Pre-A1", target the first cluster
  if (diagnosedLevel === "Below Pre-A1" && clusterLabels.length > 0) {
    targetLevels.add(clusterLabels[0]);
  }

  return results
    .filter(r =>
      r.result === "CONFIRMED" &&
      r.confidence === "MEDIUM" &&
      targetLevels.has(r.level)
    )
    .map(r => ({
      azeId: r.azeId,
      claim: r.claim,
      level: r.level,
      fn: r.fn,
      confidence: r.confidence!,
    }));
}

/**
 * Builds a probe prompt for the conversation AI.
 *
 * Given macro targets, generates a system prompt that asks 2-3 targeted
 * follow-up questions designed to elicit evidence for those specific
 * communicative functions.
 */
export function buildProbePrompt(
  probeTargets: ProbeTarget[],
  taskContext: string,
  signalsMap?: Map<string, string[]>
): string {
  const targetList = probeTargets
    .map(t => {
      const signals = signalsMap?.get(t.azeId);
      const signalBlock = signals && signals.length > 0
        ? `\n      Look for: ${signals.join("; ")}`
        : "";
      return `  - ${t.fn} (${t.level}): "${t.claim}"${signalBlock}`;
    })
    .join("\n");

  return `You are an AI examiner conducting FOLLOW-UP PROBES for a FEAT writing assessment.

${taskContext}

The initial assessment identified some functions where evidence was unclear. You need to ask 2-3 SHORT follow-up questions to gather better evidence for these specific functions:

${targetList}

PROBE RULES:
1. Ask ONE question per turn — short, direct, natural.
2. Each question must specifically target one of the functions above.
3. Use the "Look for" hints to craft a question that would naturally elicit that evidence.
4. Do NOT explain why you are asking. Do NOT reference assessment or levels.
5. Keep the conversation natural — as if you just thought of something else to ask.
6. After 2-3 questions, say "Thank you, that's everything." and add <probe_done>true</probe_done>.
7. Do NOT add warm affirmations. Just ask the question.

Start with your first follow-up question now.`;
}

// Maximum probe exchanges before forcing completion
export const MAX_PROBE_EXCHANGES = 3;


/**
 * Elicitation target identification.
 *
 * After diagnosis (and after any probe round), identifies NOT_DEMONSTRATED
 * macros at the boundary where confirming them could push the candidate
 * up a level. These need NEW conversational conditions — different from
 * probing, which re-examines existing evidence.
 *
 * Returns empty if:
 *  - The next level up is already confirmed
 *  - No NOT_DEMONSTRATED macros exist at the boundary
 *  - Confirming those macros still wouldn't reach the threshold
 */
export type ElicitationTarget = {
  azeId: string;
  claim: string;
  level: string;
  fn: string;
  probeGuidance: string[];
};

export function identifyElicitationTargets(
  results: MacroVerdict[],
  levelClusters: LevelCluster[],
  diagnosedLevel: string,
  macroLookup: Map<string, { probeGuidance: string[] }>
): ElicitationTarget[] {
  const clusterLabels = levelClusters.map(lc => lc.label);
  const diagIdx = clusterLabels.indexOf(diagnosedLevel);

  // Look at the next level up — that's where elicitation matters
  // (if diagnosed level itself isn't confirmed, look at that too)
  const targetClusters: LevelCluster[] = [];
  if (diagIdx >= 0 && diagIdx + 1 < levelClusters.length) {
    targetClusters.push(levelClusters[diagIdx + 1]);
  }
  // Also check the diagnosed level if it's the first cluster and barely confirmed
  if (diagnosedLevel === "Below Pre-A1" && levelClusters.length > 0) {
    targetClusters.push(levelClusters[0]);
  }

  const resultsMap = new Map(results.map(r => [r.azeId, r]));
  const targets: ElicitationTarget[] = [];

  for (const cluster of targetClusters) {
    // How many are already confirmed at this cluster?
    const confirmedCount = cluster.macroIds.filter(id => {
      const r = resultsMap.get(id);
      return r ? isConfirmedForThreshold(r) : false;
    }).length;

    // How many are NOT_DEMONSTRATED (potential for elicitation)?
    const notDemonstrated = cluster.macroIds.filter(id => {
      const r = resultsMap.get(id);
      return r && r.result === "NOT_DEMONSTRATED";
    });

    // Would confirming the NOT_DEMONSTRATED ones reach the threshold?
    const potentialCount = confirmedCount + notDemonstrated.length;
    if (potentialCount < cluster.confirmThreshold) continue; // Even with all elicited, can't reach threshold
    if (confirmedCount >= cluster.confirmThreshold) continue; // Already confirmed, no need

    // How many do we actually need?
    const needed = cluster.confirmThreshold - confirmedCount;

    // Pick the NOT_DEMONSTRATED macros (up to what's needed, max 2 to keep it short)
    const toElicit = notDemonstrated.slice(0, Math.min(needed, 2));

    for (const azeId of toElicit) {
      const verdict = resultsMap.get(azeId);
      const macro = macroLookup.get(azeId);
      if (!verdict || !macro) continue;

      targets.push({
        azeId,
        claim: verdict.claim,
        level: verdict.level,
        fn: verdict.fn,
        probeGuidance: macro.probeGuidance,
      });
    }
  }

  return targets;
}

/**
 * Builds an elicitation prompt — creates NEW conversational conditions
 * to test functions that weren't demonstrated in the main conversation.
 *
 * Unlike probe prompts (which re-examine unclear evidence), elicitation
 * prompts create opportunities from scratch using the macro's probeGuidance.
 */
export function buildElicitationPrompt(
  targets: ElicitationTarget[],
  taskContext: string
): string {
  const targetList = targets
    .map(t => {
      const guidance = t.probeGuidance.map(g => `      • ${g}`).join("\n");
      return `  ${t.fn} (${t.level}): "${t.claim}"\n    How to test:\n${guidance}`;
    })
    .join("\n\n");

  return `You are an AI examiner conducting ADDITIONAL QUESTIONS for a FEAT writing assessment.

${taskContext}

The candidate has finished the main conversation. The assessment found that some functions were NOT tested or not demonstrated. You need to ask 2-3 SHORT, natural follow-up questions to give the candidate a chance to show these abilities:

${targetList}

ELICITATION RULES:
1. Ask ONE question per turn — short, direct, natural.
2. Use the "How to test" guidance to design your question. Pick the approach most likely to get a response.
3. Do NOT explain why you are asking. Do NOT reference assessment, levels, or functions.
4. Frame it naturally: "Oh, one more thing..." or "I was also curious..." or "By the way..."
5. If the candidate gives a weak or off-topic response, try ONE rephrase, then move on.
6. After asking about each function (2-3 questions total), say "Thanks, that's all from me!" and add <probe_done>true</probe_done>.
7. Do NOT add warm affirmations. Just ask the question.

Start with your first question now.`;
}

export const MAX_ELICITATION_EXCHANGES = 3;


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
