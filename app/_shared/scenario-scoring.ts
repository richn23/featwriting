/* ═══════════════════════════════════════════════════════════════
   Scenario Scoring — Basic prototype scoring engine
   Evaluates answers against quality markers in the task data.
   ═══════════════════════════════════════════════════════════════ */

import type { ScenarioTaskDef, Screen } from "./scenario-types";
import {
  type ScoreLevel,
  type Outcome,
  SCORE_LEVEL_LABELS,
  OUTCOME_LABELS,
  scoreLevelFromNumeric,
  deriveAcademicOutcome,
  type DimensionScore,
} from "./scoreLevel";

// ─── Types ────────────────────────────────────────────────────

/** @deprecated Alias for ScoreLevel kept only so downstream imports don't break
 *  during migration. Prefer `ScoreLevel` from `./scoreLevel`. */
export type Band = ScoreLevel;

export type ScreenFeedback = {
  screenIndex: number;
  label: string;
  score: number;          // 0–1
  band: ScoreLevel;
  feedback: string;       // one-line comment
  bestAnswer?: string;    // what ideal looked like
  scoringHints?: string[];// for short-text screens
  /** Which construct dimension this screen contributes to, if tagged. */
  dimension?: string;
};

export type DimensionResult = {
  name: string;
  description: string;
  band: ScoreLevel;
  feedback: string;
};

export type LearnerFeedback = {
  strength: string;         // what they did well
  focusAreas: string[];     // 1–3 actionable things to work on
  nextStep: string;         // one concrete suggestion
};

export type TaskReport = {
  screenFeedback: ScreenFeedback[];
  overallScore: number;
  /** Overall outcome. For Academic tasks this may be "InsufficientEvidence"
   *  (off-scale); for other product lines it is always a ScoreLevel. */
  overallBand: Outcome;
  dimensions: DimensionResult[];
  learnerFeedback: LearnerFeedback;
  /** Academic: true when the dimension profile warrants reviewer attention
   *  (e.g. significant divergence, or Insufficient Evidence). */
  reviewerFlag?: boolean;
  /** Human-readable reason for the reviewer flag, when set. */
  flagReason?: string | null;
};

type Answer = {
  screenIndex: number;
  choice?: string;
  selections?: string[];
  text?: string;
  ranking?: string[];
};

// ─── Helpers ──────────────────────────────────────────────────

function toBand(score: number): ScoreLevel {
  return scoreLevelFromNumeric(score);
}

function bandLabel(b: Outcome): string {
  return OUTCOME_LABELS[b];
}

/** Kendall-tau-like distance: proportion of pairs in correct relative order */
function rankScore(actual: string[], ideal: string[]): number {
  if (actual.length === 0 || ideal.length === 0) return 0.5;
  let concordant = 0;
  let total = 0;
  for (let i = 0; i < ideal.length; i++) {
    for (let j = i + 1; j < ideal.length; j++) {
      const ai = actual.indexOf(ideal[i]);
      const aj = actual.indexOf(ideal[j]);
      if (ai < 0 || aj < 0) continue;
      total++;
      if (ai < aj) concordant++;
    }
  }
  return total === 0 ? 0.5 : concordant / total;
}

// ─── Main scoring function ────────────────────────────────────

export function scoreTask(task: ScenarioTaskDef, answers: Answer[]): TaskReport {
  const screenFeedback: ScreenFeedback[] = [];

  for (const answer of answers) {
    const screen = task.screens[answer.screenIndex];
    if (!screen) continue;
    const label = "label" in screen ? (screen as { label: string }).label : `Screen ${answer.screenIndex + 1}`;

    switch (screen.kind) {
      case "choice": {
        const chosen = screen.options.find(o => o.id === answer.choice);
        const best = screen.options.find(o => o.quality === "best");
        const score = !chosen ? 0 : chosen.quality === "best" ? 1.0 : chosen.quality === "acceptable" ? 0.55 : 0.15;
        const feedback = !chosen
          ? "No selection made."
          : chosen.quality === "best"
          ? "Excellent choice — this was the strongest option."
          : chosen.quality === "acceptable"
          ? `Reasonable choice, but a stronger option was available.`
          : `This option had significant drawbacks.`;
        screenFeedback.push({
          screenIndex: answer.screenIndex, label, score, band: toBand(score), feedback,
          bestAnswer: best && chosen?.id !== best.id ? best.text : undefined,
          dimension: (screen as { dimension?: string }).dimension,
        });
        break;
      }

      case "evidence-select": {
        const chosen = screen.options.find(o => o.id === answer.choice);
        const best = screen.options.find(o => o.quality === "strong");
        const score = !chosen ? 0 : chosen.quality === "strong" ? 1.0 : chosen.quality === "weak" ? 0.4 : chosen.quality === "irrelevant" ? 0.1 : 0.05;
        const feedback = !chosen
          ? "No selection made."
          : chosen.quality === "strong"
          ? "Good judgment — you selected the strongest evidence."
          : chosen.quality === "weak"
          ? "This evidence is relevant but not strong enough to support the argument well."
          : chosen.quality === "irrelevant"
          ? "This evidence doesn't directly support the argument."
          : "This is misleading — it sounds persuasive but doesn't hold up to scrutiny.";
        screenFeedback.push({
          screenIndex: answer.screenIndex, label, score, band: toBand(score), feedback,
          bestAnswer: best && chosen?.id !== best.id ? best.text : undefined,
          dimension: (screen as { dimension?: string }).dimension,
        });
        break;
      }

      case "multi-select": {
        const correctIds = new Set(screen.options.filter(o => o.correct).map(o => o.id));
        const selected = new Set(answer.selections ?? []);
        let hits = 0;
        let misses = 0;
        for (const id of selected) {
          if (correctIds.has(id)) hits++;
          else misses++;
        }
        const score = correctIds.size === 0 ? 0.5 : Math.max(0, (hits / correctIds.size) - (misses * 0.2));
        const missed = [...correctIds].filter(id => !selected.has(id));
        const missedTexts = missed.map(id => screen.options.find(o => o.id === id)?.text).filter(Boolean);
        const feedback = score >= 0.8
          ? "Strong identification — you caught the key issues."
          : score >= 0.5
          ? `Good start, but you missed some important points.`
          : "Several key issues were missed.";
        screenFeedback.push({
          screenIndex: answer.screenIndex, label, score, band: toBand(score), feedback,
          bestAnswer: missedTexts.length > 0 ? `Also important: ${missedTexts.join("; ")}` : undefined,
          dimension: (screen as { dimension?: string }).dimension,
        });
        break;
      }

      case "rank": {
        const actual = answer.ranking ?? [];
        const score = rankScore(actual, screen.idealOrder);
        const topIdeal = screen.idealOrder[0];
        const topActual = actual[0];
        const feedback = score >= 0.8
          ? "Excellent prioritisation — your ranking closely matches the ideal."
          : score >= 0.5
          ? "Reasonable ordering, but some priorities were out of place."
          : "The priority order needs rethinking — key items were ranked too low.";
        const idealTopText = screen.items.find(it => it.id === topIdeal)?.text;
        screenFeedback.push({
          screenIndex: answer.screenIndex, label, score, band: toBand(score), feedback,
          bestAnswer: topActual !== topIdeal && idealTopText ? `Top priority should be: ${idealTopText}` : undefined,
          dimension: (screen as { dimension?: string }).dimension,
        });
        break;
      }

      case "short-text": {
        // Can't auto-score free text — give neutral score, show what we look for
        screenFeedback.push({
          screenIndex: answer.screenIndex, label, score: 0.5, band: "Competent",
          feedback: "Free-text responses are evaluated against the criteria below. In production, an AI judge would score this.",
          scoringHints: screen.scoringHints,
          dimension: (screen as { dimension?: string }).dimension,
        });
        break;
      }
    }
  }

  // Overall score: average of all screen scores
  const scorable = screenFeedback.filter(sf => sf.score !== undefined);
  const overallScore = scorable.length > 0 ? scorable.reduce((sum, sf) => sum + sf.score, 0) / scorable.length : 0.5;

  // ─── Branch on product line ─────────────────────────────────
  // Academic tasks apply the construct gate logic (Task Achievement validity
  // gate, Critical Thinking upper gate, InsufficientEvidence off-scale).
  // Non-academic tasks keep the round-robin dimension mapping.
  if (task.productLine === "academic") {
    return buildAcademicReport(task, answers, screenFeedback, overallScore);
  }

  const overallBand: Outcome = toBand(overallScore);

  // Map dimensions — distribute screen scores across dimensions
  const autoScored = screenFeedback.filter(sf => sf.scoringHints === undefined);
  const dimensions: DimensionResult[] = task.scoringDimensions.map((dim, i) => {
    // Simple mapping: distribute auto-scored screens across dimensions
    const mapped = autoScored.length > 0
      ? autoScored[Math.min(i, autoScored.length - 1)]
      : undefined;
    const dimScore = mapped ? mapped.score : overallScore;
    const dimBand = toBand(dimScore);
    const feedback = dimBand === "Distinction" || dimBand === "Merit"
      ? `Your responses showed strong ${dim.name.toLowerCase()}.`
      : dimBand === "Competent"
      ? `Your ${dim.name.toLowerCase()} was adequate but could be sharper.`
      : `${dim.name} needs more attention — review the feedback on individual screens.`;
    return { name: dim.name, description: dim.description, band: dimBand, feedback };
  });

  // ─── Learner-facing feedback ────────────────────────────────
  const learnerFeedback = buildLearnerFeedback(task.id, screenFeedback, dimensions, toBand(overallScore));

  return { screenFeedback, overallScore, overallBand, dimensions, learnerFeedback };
}

// ─── Academic scoring ─────────────────────────────────────────
//
// Groups screen feedback by construct dimension, averages within each,
// detects insufficient-evidence conditions, and applies the construct's
// gate logic (scoreLevel.deriveAcademicOutcome) to produce the final
// outcome.

function countWords(text: string | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function detectInsufficientEvidence(
  task: ScenarioTaskDef,
  answers: Answer[],
  screenFeedback: ScreenFeedback[],
): { flagged: boolean; reason: string | null } {
  // Total candidate text across short-text responses
  const textWords = answers.reduce((sum, a) => sum + countWords(a.text), 0);
  if (textWords < 30) {
    return { flagged: true, reason: "Written response too short to evaluate reasoning across all four dimensions." };
  }

  // Completion check: more than half of scoring screens unanswered
  const scoringKinds = new Set(["choice", "multi-select", "short-text", "rank", "evidence-select"]);
  const scoringScreenIdx = task.screens
    .map((s, i) => (scoringKinds.has(s.kind) ? i : -1))
    .filter(i => i >= 0);
  const answered = new Set(screenFeedback.map(sf => sf.screenIndex));
  const missing = scoringScreenIdx.filter(i => !answered.has(i));
  if (scoringScreenIdx.length > 0 && missing.length / scoringScreenIdx.length > 0.5) {
    return { flagged: true, reason: "Too many scoring screens were left without a response." };
  }

  return { flagged: false, reason: null };
}

function buildAcademicReport(
  task: ScenarioTaskDef,
  answers: Answer[],
  screenFeedback: ScreenFeedback[],
  overallScore: number,
): TaskReport {
  // Group screen scores by their tagged construct dimension
  const byDim = new Map<string, ScreenFeedback[]>();
  for (const sf of screenFeedback) {
    if (!sf.dimension) continue;
    const bucket = byDim.get(sf.dimension) ?? [];
    bucket.push(sf);
    byDim.set(sf.dimension, bucket);
  }

  // Compute per-dimension level
  const dimensionScores: DimensionScore[] = task.scoringDimensions.map(dim => {
    const feedbacks = byDim.get(dim.name) ?? [];
    const avg = feedbacks.length
      ? feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length
      : overallScore;
    return { name: dim.name, level: scoreLevelFromNumeric(avg) };
  });

  const dimensions: DimensionResult[] = task.scoringDimensions.map((dim, i) => {
    const ds = dimensionScores[i];
    const feedbacks = byDim.get(dim.name) ?? [];
    const hasScreens = feedbacks.length > 0;
    const feedback = !hasScreens
      ? `No screens were tagged to this dimension. Reviewer attention recommended.`
      : ds.level === "Distinction"
      ? `Strong performance — responses consistently demonstrated ${dim.name.toLowerCase()}.`
      : ds.level === "Merit"
      ? `Solid performance on ${dim.name.toLowerCase()}, with room to sharpen further.`
      : ds.level === "Competent"
      ? `Adequate ${dim.name.toLowerCase()} — the reasoning held together but was uneven.`
      : `${dim.name} needs significant attention — see the per-screen feedback.`;
    return { name: dim.name, description: dim.description, band: ds.level, feedback };
  });

  // Insufficient Evidence detection — overrides any gate logic
  const { flagged, reason } = detectInsufficientEvidence(task, answers, screenFeedback);

  const { outcome, reviewerFlag, flagReason } = deriveAcademicOutcome(dimensionScores, flagged);

  const learnerFeedback = buildLearnerFeedback(
    task.id,
    screenFeedback,
    dimensions,
    outcome === "InsufficientEvidence" ? "NotYetCompetent" : outcome,
  );

  return {
    screenFeedback,
    overallScore,
    overallBand: outcome,
    dimensions,
    learnerFeedback,
    reviewerFlag: reviewerFlag || flagged,
    flagReason: flagReason ?? reason ?? null,
  };
}

// ─── Learner feedback builder ─────────────────────────────────

/** Per-task focus-area tips keyed by dimension name → score level.
 *  Partial because not every tier carries a tip — Distinction entries are
 *  intentionally blank (per-screen feedback handles excellence), and Merit
 *  entries are left to be filled in per-task as the product matures. */
const FOCUS_TIPS: Record<string, Record<string, Partial<Record<ScoreLevel, string>>>> = {
  ojt: {
    "Decision Quality": {
      Distinction: "",
      Competent: "Before choosing an action, list the consequences of each option. Ask: 'What happens if I do this and it doesn't work?'",
      NotYetCompetent: "Start with the most urgent problem. When there are multiple options, eliminate the ones that only delay the situation — look for actions that move things forward.",
    },
    "Justification Logic": {
      Distinction: "",
      Competent: "When explaining your reasoning, name the specific people affected and the time pressure involved — not just what feels right.",
      NotYetCompetent: "Try using the format: 'I chose this because [stakeholder] needs [outcome] within [timeframe].' This forces you to connect your choice to real consequences.",
    },
    "Escalation Judgment": {
      Distinction: "",
      Competent: "Escalation isn't about passing the problem — it's about getting the right authority involved at the right time. Ask: 'Can I still fix this alone, or do I need someone with more authority?'",
      NotYetCompetent: "Escalate when the situation is beyond what your role can resolve — not before you've tried, and not after it's too late. The trigger here was: the trainer confirmed they won't come.",
    },
    "Communication Quality": {
      Distinction: "",
      Competent: "A good status message has three parts: acknowledge the problem, say what's happening now, give a clear next step. Keep it short.",
      NotYetCompetent: "When writing under pressure, use this structure: (1) what happened, (2) what we're doing, (3) what you need to do. Avoid blame and keep the tone calm.",
    },
  },
  cpd: {
    "Problem Diagnosis": {
      Distinction: "",
      Competent: "Look beyond the obvious. 'Mixed levels' is a symptom — the cause is often lack of differentiation in the task design itself.",
      NotYetCompetent: "When diagnosing a classroom problem, separate what you can see (symptoms) from what's causing it (root causes). Multiple causes often work together.",
    },
    "Impact Awareness": {
      Distinction: "",
      Competent: "Be specific about impact. 'Students struggle' is vague — 'weaker students stop participating because the task is above their level' is actionable.",
      NotYetCompetent: "Think about impact from the student's perspective. How does this problem affect someone at the bottom of the class vs the top? What do they each experience?",
    },
    "Strategy Practicality": {
      Distinction: "",
      Competent: "Good strategies name a concrete action, not just an approach. 'Use group work' is vague. 'Assign mixed-ability pairs with role cards so the weaker student has a defined contribution' is practical.",
      NotYetCompetent: "For each strategy, ask yourself: could a colleague walk into my classroom and do this tomorrow with no extra materials? If not, simplify it.",
    },
    "Pedagogical Awareness": {
      Distinction: "",
      Competent: "Show that you understand why a strategy works, not just that it exists. Tiered tasks work because they let every student succeed at their level — say that.",
      NotYetCompetent: "Focus on three core ideas: differentiation (different tasks for different levels), scaffolding (support that you can gradually remove), and engagement (tasks that require active participation).",
    },
    "Decision Quality": {
      Distinction: "",
      Competent: "Under constraints, pick the strategy that gives the most impact for the least setup. Tiered tasks can be created with a single handout by adjusting the expected output.",
      NotYetCompetent: "When you have limited time and no extra materials, the best strategies are ones you can explain in one sentence and students can start immediately.",
    },
  },
  "ai-policy": {
    "Risk Detection": {
      Distinction: "",
      Competent: "When evaluating AI output, check three things: Is it pedagogically sound? Is it realistic? Does it match how people actually learn?",
      NotYetCompetent: "AI-generated content often looks professional but contains fundamental problems. Read it as if a new teacher wrote it — what would you correct?",
    },
    "Policy Alignment": {
      Distinction: "",
      Competent: "When checking against policy, go point by point. Don't just say 'it doesn't meet policy' — name which specific requirement it fails.",
      NotYetCompetent: "Read the policy as a checklist. For each point, ask: does this AI output meet this requirement? If not, write down exactly where it fails.",
    },
    "Adaptation Quality": {
      Distinction: "",
      Competent: "When rewriting AI content, don't just polish the language. Fix the underlying approach — change what students actually do, not just how it's described.",
      NotYetCompetent: "Start your rewrite by listing what's wrong, then fix each problem. A good adaptation changes the activities, not just the wording.",
    },
    "Reasoning Clarity": {
      Distinction: "",
      Competent: "When justifying your decisions, connect each point to a specific reason. 'This is wrong because...' is better than 'I don't think this works.'",
      NotYetCompetent: "Practice the 'because' test: every judgment you make should end with 'because [specific reason].' If you can't finish the sentence, your reasoning needs more thought.",
    },
  },
  "info-priority": {
    "Prioritisation Accuracy": {
      Distinction: "",
      Competent: "Urgency isn't just about deadlines — it's about who is affected and what happens if you wait. Prioritise actions that reduce uncertainty for the most people.",
      NotYetCompetent: "When prioritising, ask: 'If I do nothing about this for 15 minutes, what happens?' The items where the answer is 'things get worse' go to the top.",
    },
    "Logical Reasoning": {
      Distinction: "",
      Competent: "When explaining priorities, name the specific consequence of delay. 'Participants need to know' is weak. 'Three people are about to leave because they think it's cancelled' is strong.",
      NotYetCompetent: "Your reasoning should answer three questions: What's the most urgent thing? Why is it more urgent than the others? What happens if I do it later instead of now?",
    },
    "Adaptability": {
      Distinction: "",
      Competent: "When conditions change, re-evaluate from scratch. Don't just slot the new information into your existing plan — ask whether your whole approach still makes sense.",
      NotYetCompetent: "The twist changed the situation significantly. When that happens, stop, re-read the new information, and re-rank everything. Your first priority might need to change completely.",
    },
    "Communication Clarity": {
      Distinction: "",
      Competent: "Under pressure, keep messages to three sentences: what happened, what we're doing, what you should do. No background, no apologies, just clarity.",
      NotYetCompetent: "When people are waiting for information, they need facts, not reassurance. Tell them: the situation, the plan, and what to do next. Keep it under 40 words.",
    },
  },
  argument: {
    "Task Achievement": {
      Distinction: "",
      Competent: "Read each memo for what it actually claims, not what it reminds you of. Dr. Osei and Dr. Yıldız disagree on a specific question — your job is to engage with that disagreement precisely.",
      NotYetCompetent: "Start by writing each author's claim in one sentence. The claim is what they want you to believe, not the topic they're writing about. If your summary could apply to either memo, it's not precise enough.",
    },
    "Content Quality": {
      Distinction: "",
      Competent: "When evaluating evidence, ask: is it specific, is it from a credible source, does it directly support the claim? A research study controlling for motivation is different in kind from a blog post by one lecturer.",
      NotYetCompetent: "Evidence ranks on three things: reliability of the source, directness of the link to the claim, and vulnerability to obvious counter-examples. Grade each option against those three.",
    },
    "Argumentation": {
      Distinction: "",
      Competent: "A strong argument has three parts: a clear position, a reason, and evidence or an example. Make sure yours has all three, in that order, and acknowledge the opposing position.",
      NotYetCompetent: "Use this structure: 'I believe [position] because [reason]. For example, [evidence].' Then add one sentence acknowledging the strongest point on the other side — that shows balanced reasoning.",
    },
    "Critical Thinking": {
      Distinction: "",
      Competent: "Common argument weaknesses: overgeneralisation (claiming too much from limited evidence), ignoring alternatives, assuming causation from correlation. Name the specific flaw, don't just disagree.",
      NotYetCompetent: "Look for words like 'all,' 'always,' 'clear,' 'obvious' — they often signal overgeneralisation. Then check: is the evidence really strong enough for that conclusion, or could it point somewhere else entirely?",
    },
  },
  "data-literacy": {
    "Task Achievement": {
      Distinction: "",
      Competent: "Engage with THIS chart — the specific numbers, the specific claim. A generic critique of 'truncated y-axes' doesn't show you read the actual data. Name what you're looking at.",
      NotYetCompetent: "Before you evaluate, summarise: what does this chart actually show, and what does its title claim? The gap between those two is the thing you're analysing.",
    },
    "Content Quality": {
      Distinction: "",
      Competent: "An honest title states what was measured and what changed — without implying a cause. 'Satisfaction scores increased' is different from 'Training improved satisfaction.' Your rewrite needs to reflect the actual data.",
      NotYetCompetent: "Your rewrite should remove any causal claim and acknowledge what changed. Try: '[Metric] changed from X to Y between [dates]' as a starting point, then add the context that qualifies it.",
    },
    "Argumentation": {
      Distinction: "",
      Competent: "A good board summary has three sentences: what the data shows, what it doesn't prove, and what to measure next. That shape works for almost any data communication under uncertainty.",
      NotYetCompetent: "Structure your summary: (1) the fact, (2) the caveat, (3) the next step. Don't skip any of the three. Lead with the fact, not the caveat — that's how a board reads.",
    },
    "Critical Thinking": {
      Distinction: "",
      Competent: "Correlation is not causation. When two things happen at the same time, ask: what else changed? In this case, a competitor closing is a huge confounding variable — at least as likely an explanation as the training.",
      NotYetCompetent: "Just because B happened after A doesn't mean A caused B. To establish causation, you need to rule out other explanations. List everything else that changed in the same period before you credit the training.",
    },
  },
  "interpretation-evaluation": {
    "Task Achievement": {
      Distinction: "",
      Competent: "The task has two halves — explain AND evaluate. Doing one well and skipping the other is a fail on this dimension. Make sure your response tackles both, not just the one you find easier.",
      NotYetCompetent: "Read the task again. It asks you to (1) re-express Ziegler's framework in your own words, AND (2) evaluate its assumptions and scope. If you did only one, go back and do the other.",
    },
    "Content Quality": {
      Distinction: "",
      Competent: "Re-expression means capturing the structure, not just paraphrasing sentences. Ziegler's framework has three features plus a strong claim that failing any one means incoherence. Your version should preserve that structure.",
      NotYetCompetent: "Three features, one strong claim. That's the whole framework. If your re-expression drops the strong claim, it's incomplete. If it adds anything Ziegler didn't say, it's inaccurate.",
    },
    "Argumentation": {
      Distinction: "",
      Competent: "Your recommendation should take a clear position — apply, apply with caveats, or don't apply — and give reasons drawn from the framework itself, not from generic writing advice.",
      NotYetCompetent: "State your position first. Then give one reason tied specifically to Ziegler's claims (not general writing advice). Then close with one acknowledgement of where the framework might still be useful.",
    },
    "Critical Thinking": {
      Distinction: "",
      Competent: "Evaluation means naming specific assumptions and specific limits, not registering general discomfort. What does Ziegler's framework assume about what writing is for? Where does it break?",
      NotYetCompetent: "Think about edge cases. Does the framework handle a paper that deliberately explores two competing ideas? Does it work for papers that open out rather than narrow down? That's where its strong claim starts to break.",
    },
  },
  "weighing-alternatives": {
    "Task Achievement": {
      Distinction: "",
      Competent: "The task is to compare TWO positions, not to state your own view on AI in education. Stay with Aramayo and Beaumont — weigh their reasoning, not the general topic.",
      NotYetCompetent: "Keep returning to what Aramayo and Beaumont actually said. If your response drifts into your own general views on AI, you're doing a different task. The question is whose reasoning holds up.",
    },
    "Content Quality": {
      Distinction: "",
      Competent: "The deepest disagreement isn't 'pro-AI vs anti-AI' — that's the surface. It's about what the weekly essay is FOR: a cognitive process, or a product to be assessed. Find the substantive point.",
      NotYetCompetent: "When two people disagree, the useful question is: what underlying belief drives each view? Aramayo and Beaumont have different beliefs about the purpose of the assessment itself — that's the real disagreement.",
    },
    "Argumentation": {
      Distinction: "",
      Competent: "A weighted judgement has three parts: your position, your strongest reason, and an honest acknowledgement of what the rejected side gets right. All three matter — skipping the third makes you look one-sided.",
      NotYetCompetent: "Structure: 'I find [memo] more persuasive because [specific reason from the memo]. Beaumont/Aramayo is right that [concession], but on balance [why your reason outweighs it].'",
    },
    "Critical Thinking": {
      Distinction: "",
      Competent: "Weighing means scoring both sides on the same criteria. Which memo has tighter reasoning? Which depends on more assumptions? Which engages the other? Answer those, not just which you prefer.",
      NotYetCompetent: "Pick three criteria (specificity, assumptions, engagement with the other side) and grade each memo on them. The stronger memo should win on at least two. If you can't name criteria, you're voting, not weighing.",
    },
  },
  "justified-judgement": {
    "Task Achievement": {
      Distinction: "",
      Competent: "Take a position on THIS question — a four-year undergraduate degree with a structured research year — not on education in general. Specificity is what makes a judgement judgeable.",
      NotYetCompetent: "Your position needs to answer the actual question: should all undergraduate degrees become four-year programmes with a research year? Not 'research is valuable' in general — yes or no on this proposal.",
    },
    "Content Quality": {
      Distinction: "",
      Competent: "Draw on the specific considerations in the scenario — cost, student population mix, the comparison between project work and coursework. Generic reasoning about 'university' doesn't count.",
      NotYetCompetent: "Before you defend a position, list the considerations the scenario actually raises. Your reasoning should touch at least two of them. If it doesn't, you're defending something other than the specific proposal.",
    },
    "Argumentation": {
      Distinction: "",
      Competent: "Position → strongest reason → strongest counter → honest defence → scope of claim. Each part does work. Skipping any one weakens the whole case — especially the scope, which signals intellectual honesty.",
      NotYetCompetent: "Write each part separately, then read them together. Does your defence actually answer the counter, or does it repeat your original reasoning? If it repeats, you haven't engaged — rewrite the defence.",
    },
    "Critical Thinking": {
      Distinction: "",
      Competent: "The counter-argument test: if someone you respect read your counter, would they say 'yes, that's the hardest objection'? If it's easier than that, you chose an easy one. Rewrite it.",
      NotYetCompetent: "A strong counter-argument makes YOUR position harder, not easier, to defend. If you can knock it down with one sentence, it isn't the strongest objection. Go find one that makes you uncomfortable.",
    },
  },
  "prof-comm": {
    "Tone Appropriateness": {
      Distinction: "",
      Competent: "Match the tone to the audience and the stakes. A client delay message isn't an internal Slack — it should be warmer than a memo and more accountable than a chat message.",
      NotYetCompetent: "Before you write, picture the reader opening your message. If they'd find it too casual or too stiff, adjust. For clients, aim for calm, direct, and professional — avoid exclamation marks, slang, or over-apology.",
    },
    "Message Clarity": {
      Distinction: "",
      Competent: "Lead with the headline. The reader should know what the message is about in the first sentence — not the third.",
      NotYetCompetent: "Put the main point up top: what happened, what it means for them, what happens next. Don't bury the important information under context or caveats.",
    },
    "Relevance of Detail": {
      Distinction: "",
      Competent: "Every sentence should earn its place. If a detail doesn't help the reader understand the situation or decide what to do, cut it.",
      NotYetCompetent: "Try this test: read your draft and delete any sentence that doesn't answer 'what happened', 'why it matters', or 'what next'. What's left is usually the message you should send.",
    },
    "Register": {
      Distinction: "",
      Competent: "Professional register isn't the same as formal register. It's about consistency — don't open with 'Dear Client' and close with 'cheers!' Pick a lane and stay in it.",
      NotYetCompetent: "Read your message aloud. If any phrase feels too casual (emoji, slang, contractions in a serious context) or too stiff (legalese, corporate jargon), rewrite it in plain professional English.",
    },
    "Adaptation": {
      Distinction: "",
      Competent: "When the client reacts, your next message should feel like it heard them — not like it's reading from a script. Acknowledge what they said before moving on.",
      NotYetCompetent: "A good follow-up starts by naming what the reader just raised. Then answer it directly. Don't restate your original position — show you've absorbed their response and are responding to it.",
    },
  },
  interpersonal: {
    "Acknowledgement": {
      Distinction: "",
      Competent: "Name the impact, not just the facts. 'That must have been frustrating' lands differently than 'I see the deadline was missed.'",
      NotYetCompetent: "Start your reply with their experience: 'I understand this made things difficult for you in front of your manager.' Only after that do you explain or propose next steps. Acknowledgement first, action second.",
    },
    "Tone Under Pressure": {
      Distinction: "",
      Competent: "When someone pushes hard, match their seriousness but not their heat. Steady beats sharp — and it's what de-escalates.",
      NotYetCompetent: "If you feel defensive, pause before writing. Re-read your draft and cut any line that sounds like you're protecting yourself. A calm, even tone carries more authority than a sharp one.",
    },
    "De-escalation": {
      Distinction: "",
      Competent: "De-escalation means taking heat out of the exchange — not ignoring the problem. Acknowledge, then move the conversation toward a solution.",
      NotYetCompetent: "Avoid three things that add heat: counter-accusations, over-explaining, and repeated apologies. Do one thing instead: name the issue, commit to a concrete change, propose a conversation.",
    },
    "Proposed Resolution": {
      Distinction: "",
      Competent: "Vague reassurances ('we'll try harder') sound dismissive. A concrete next step — even a small one — shows you've actually thought about it.",
      NotYetCompetent: "End with a specific commitment: a process change, a check-in, a 15-minute call. 'What can change' is the question you're really answering — make sure your reply answers it.",
    },
    "Register": {
      Distinction: "",
      Competent: "A peer complaint needs a peer register — professional but not formal, honest but not casual. Match the level they chose.",
      NotYetCompetent: "Avoid going too stiff ('Dear colleague, I acknowledge receipt of your feedback') or too casual ('my bad, we'll sort it'). Aim for how you'd speak to them face-to-face if you were being thoughtful about it.",
    },
  },
};

function buildLearnerFeedback(
  taskId: string,
  screenFeedback: ScreenFeedback[],
  dimensions: DimensionResult[],
  overallBand: ScoreLevel,
): LearnerFeedback {
  const strongDims = dimensions.filter(d => d.band === "Distinction" || d.band === "Merit");
  const weakDims = dimensions.filter(d => d.band === "NotYetCompetent");
  const midDims = dimensions.filter(d => d.band === "Competent");

  // Strength callout
  const strength = strongDims.length > 0
    ? `You showed real strength in ${strongDims.map(d => d.name.toLowerCase()).join(" and ")}. This is a solid foundation.`
    : midDims.length > 0
    ? `You're on the right track with ${midDims[0].name.toLowerCase()} — with some focused practice, this could become a real strength.`
    : "You completed the task and engaged with every screen — that's a good starting point. The feedback below will help you improve.";

  // Focus areas — pull task-specific tips for weak/developing dimensions
  const taskTips = FOCUS_TIPS[taskId] ?? {};
  const focusAreas: string[] = [];

  // Prioritise weak dimensions first, then developing
  const toAddress = [...weakDims, ...midDims].slice(0, 3);
  for (const dim of toAddress) {
    const tip = taskTips[dim.name]?.[dim.band];
    if (tip) focusAreas.push(tip);
  }

  // If no task-specific tips found, give generic advice
  if (focusAreas.length === 0) {
    if (overallBand === "Distinction" || overallBand === "Merit") {
      focusAreas.push("Review the per-screen feedback to find small refinements — even strong performers have areas to sharpen.");
    } else {
      focusAreas.push("Look at the screens where you scored lowest and read the 'Better option' hints carefully. Understanding why the better option works is more valuable than memorising it.");
    }
  }

  // Next step
  const nextStep = overallBand === "Distinction" || overallBand === "Merit"
    ? "Try the task again and challenge yourself to justify every choice in one sentence — this builds the habit of clear reasoning under pressure."
    : overallBand === "Competent"
    ? "Pick your weakest dimension from above and try the task again, focusing specifically on that area. Targeted practice is more effective than repeating everything."
    : "Start by re-reading the feedback on the screens marked 'Not Yet Competent.' For each one, think about what you would do differently, then try the task again.";

  return { strength, focusAreas, nextStep };
}

export { bandLabel };
