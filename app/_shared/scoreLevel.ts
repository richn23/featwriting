/* ═══════════════════════════════════════════════════════════════════════════
   FEAT Score Level — shared four-tier scale + Academic gate logic
   ───────────────────────────────────────────────────────────────────────────
   All three FEAT product lines (Academic, Professional, ESL) use this scale.
   "Not Yet Competent" is the required floor — never omit it.

   CEFR / GSE alignment stays binary (can / cannot). When both views are
   needed for the same attempt, derive the binary CEFR result from the
   four-tier FEAT score via `toCefrBinary` — Competent or above = "can".

   Academic adds:
   - InsufficientEvidence as an off-scale outcome (not a level)
   - Gate logic: Task Achievement validity gate, Critical Thinking upper gate
   - Divergence flag for reviewer attention when the dimension profile is
     too spread out to average honestly.
   ═══════════════════════════════════════════════════════════════════════════ */

export type ScoreLevel =
  | "NotYetCompetent"
  | "Competent"
  | "Merit"
  | "Distinction";

export const SCORE_LEVELS_ORDER: ReadonlyArray<ScoreLevel> = [
  "NotYetCompetent",
  "Competent",
  "Merit",
  "Distinction",
];

/** Human-readable labels for UI display. */
export const SCORE_LEVEL_LABELS: Readonly<Record<ScoreLevel, string>> = {
  NotYetCompetent: "Not Yet Competent",
  Competent: "Competent",
  Merit: "Merit",
  Distinction: "Distinction",
};

/** An Outcome extends ScoreLevel with an off-scale flag for responses that
 *  don't contain enough evidence to judge. Use this wherever the overall
 *  decision is reported — individual dimensions still use ScoreLevel. */
export type Outcome = ScoreLevel | "InsufficientEvidence";

export const OUTCOME_LABELS: Readonly<Record<Outcome, string>> = {
  ...SCORE_LEVEL_LABELS,
  InsufficientEvidence: "Insufficient Evidence",
};

/** Thresholds applied to a 0–1 normalised score. Ordered high → low so the
 *  first match wins. */
const NUMERIC_THRESHOLDS: ReadonlyArray<readonly [ScoreLevel, number]> = [
  ["Distinction", 0.85],
  ["Merit", 0.65],
  ["Competent", 0.45],
];

/** Map a 0–1 score to a FEAT score level.
 *  NotYetCompetent is the floor for anything under the Competent threshold. */
export function scoreLevelFromNumeric(score: number): ScoreLevel {
  const clamped = Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : 0;
  for (const [level, threshold] of NUMERIC_THRESHOLDS) {
    if (clamped >= threshold) return level;
  }
  return "NotYetCompetent";
}

/** Binary CEFR / GSE view derived from the four-tier FEAT score.
 *  Competent or above → "can"; NotYetCompetent or InsufficientEvidence → "cannot". */
export function toCefrBinary(level: Outcome): "can" | "cannot" {
  return level === "Competent" || level === "Merit" || level === "Distinction" ? "can" : "cannot";
}

/** True if `a` is the same tier or higher than `b`. */
export function scoreLevelAtLeast(a: ScoreLevel, b: ScoreLevel): boolean {
  return SCORE_LEVELS_ORDER.indexOf(a) >= SCORE_LEVELS_ORDER.indexOf(b);
}

// ─────────────────────────────────────────────────────────────────────────
// Academic construct — the four standard dimensions and gate logic
// ─────────────────────────────────────────────────────────────────────────

/** The four Academic construct dimensions. Every academic task is scored
 *  against all four. Critical Thinking emphasis varies per task type (see
 *  the construct document Section 8). */
export const ACADEMIC_DIMENSIONS = [
  "Task Achievement",
  "Content Quality",
  "Argumentation",
  "Critical Thinking",
] as const;

export type AcademicDimension = typeof ACADEMIC_DIMENSIONS[number];

/** A per-dimension ScoreLevel result, used as input to the gate logic. */
export type DimensionScore = { name: string; level: ScoreLevel };

/** Outcome of a full Academic scoring pass, including gate diagnostics. */
export type AcademicOutcome = {
  outcome: Outcome;
  /** True when the dimension spread is wide enough to warrant reviewer
   *  attention rather than a single overall number. */
  reviewerFlag: boolean;
  /** Human-readable reason when reviewerFlag is true, else null. */
  flagReason: string | null;
};

/** Find a dimension by name, case-insensitive, whitespace-tolerant. */
function findDim(dims: ReadonlyArray<DimensionScore>, name: string): DimensionScore | undefined {
  const normalised = name.toLowerCase().replace(/\s+/g, " ").trim();
  return dims.find(d => d.name.toLowerCase().replace(/\s+/g, " ").trim() === normalised);
}

/** Derive the overall Academic outcome from a set of dimension scores,
 *  applying the construct's gate logic (Section 7, v0.6).
 *
 *  Two-stage logic (Section 6 conceptual layer):
 *   - Stage 1 Validation: Task Achievement is the validity gate.
 *   - Stage 2 Quality: the other three dimensions are evaluated together.
 *
 *  Decision rules (Section 7 operational layer):
 *   - Validity gate (applied first): if Task Achievement is Not Yet Competent
 *     → overall Not Yet Competent. No further evaluation.
 *   - Competent: TA met (≥ Competent) + Competent+ in majority of remaining
 *     dimensions.
 *   - Merit: Competent+ in all dimensions + Merit in at least two.
 *   - Distinction: Merit+ in all dimensions + Distinction in at least two +
 *     Critical Thinking at Merit+ (upper-tier gate).
 *
 *  Call with `insufficientEvidence=true` when the response did not produce
 *  enough substance to judge — short-circuits to InsufficientEvidence rather
 *  than penalising as Not Yet Competent.
 */
export function deriveAcademicOutcome(
  dims: ReadonlyArray<DimensionScore>,
  insufficientEvidence = false,
): AcademicOutcome {
  if (insufficientEvidence) {
    return {
      outcome: "InsufficientEvidence",
      reviewerFlag: true,
      flagReason: "Response did not contain enough relevant content to evaluate all four dimensions.",
    };
  }

  const ta = findDim(dims, "Task Achievement");
  const ct = findDim(dims, "Critical Thinking");

  // Validity gate (Section 7): Task Achievement Not Yet → overall Not Yet
  if (ta && ta.level === "NotYetCompetent") {
    return {
      outcome: "NotYetCompetent",
      reviewerFlag: false,
      flagReason: null,
    };
  }

  const allCompetentPlus = dims.every(d => d.level !== "NotYetCompetent");
  const allMeritPlus = dims.every(d => d.level === "Merit" || d.level === "Distinction");
  const meritOrAboveCount = dims.filter(d => d.level === "Merit" || d.level === "Distinction").length;
  const distinctionCount = dims.filter(d => d.level === "Distinction").length;

  // Distinction: Merit+ in all, Distinction in ≥2, CT at Merit+
  const ctAtMeritPlus = !ct || ct.level === "Merit" || ct.level === "Distinction";
  if (allMeritPlus && distinctionCount >= 2 && ctAtMeritPlus) {
    return { outcome: "Distinction", reviewerFlag: false, flagReason: null };
  }

  // Merit: Competent+ in all, Merit+ in ≥2
  if (allCompetentPlus && meritOrAboveCount >= 2) {
    return { outcome: "Merit", reviewerFlag: false, flagReason: null };
  }

  // Divergence flag: spread of ≥ 3 tiers means we shouldn't average
  const indices = dims.map(d => SCORE_LEVELS_ORDER.indexOf(d.level));
  const spread = Math.max(...indices) - Math.min(...indices);
  const reviewerFlag = spread >= 3;
  const flagReason = reviewerFlag
    ? "Significant divergence across dimensions — reviewer judgement recommended rather than automatic averaging."
    : null;

  // Competent floor (v0.6): Task Achievement met + Competent+ in majority of
  // the remaining (non-TA) dimensions. Looser than v0.5's "all dimensions
  // Competent+" — one weak non-TA dimension is tolerated at the Competent tier.
  const remainingDims = ta ? dims.filter(d => d !== ta) : dims;
  const remainingCompetentPlus = remainingDims.filter(d => d.level !== "NotYetCompetent").length;
  const majorityThreshold = Math.floor(remainingDims.length / 2) + 1;

  const outcome: Outcome = remainingCompetentPlus >= majorityThreshold
    ? "Competent"
    : "NotYetCompetent";
  return { outcome, reviewerFlag, flagReason };
}
