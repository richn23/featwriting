/* ═══════════════════════════════════════════════════════════════
   Scenario Scoring — Basic prototype scoring engine
   Evaluates answers against quality markers in the task data.
   ═══════════════════════════════════════════════════════════════ */

import type { ScenarioTaskDef, Screen } from "./scenario-types";

// ─── Types ────────────────────────────────────────────────────

export type Band = "strong" | "developing" | "needs-work";

export type ScreenFeedback = {
  screenIndex: number;
  label: string;
  score: number;          // 0–1
  band: Band;
  feedback: string;       // one-line comment
  bestAnswer?: string;    // what ideal looked like
  scoringHints?: string[];// for short-text screens
};

export type DimensionResult = {
  name: string;
  description: string;
  band: Band;
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
  overallBand: Band;
  dimensions: DimensionResult[];
  learnerFeedback: LearnerFeedback;
};

type Answer = {
  screenIndex: number;
  choice?: string;
  selections?: string[];
  text?: string;
  ranking?: string[];
};

// ─── Helpers ──────────────────────────────────────────────────

function toBand(score: number): Band {
  if (score >= 0.7) return "strong";
  if (score >= 0.4) return "developing";
  return "needs-work";
}

function bandLabel(b: Band): string {
  return b === "strong" ? "Strong" : b === "developing" ? "Developing" : "Needs work";
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
        });
        break;
      }

      case "short-text": {
        // Can't auto-score free text — give neutral score, show what we look for
        screenFeedback.push({
          screenIndex: answer.screenIndex, label, score: 0.5, band: "developing",
          feedback: "Free-text responses are evaluated against the criteria below. In production, an AI judge would score this.",
          scoringHints: screen.scoringHints,
        });
        break;
      }
    }
  }

  // Overall score: average of all screen scores
  const scorable = screenFeedback.filter(sf => sf.score !== undefined);
  const overallScore = scorable.length > 0 ? scorable.reduce((sum, sf) => sum + sf.score, 0) / scorable.length : 0.5;
  const overallBand = toBand(overallScore);

  // Map dimensions — distribute screen scores across dimensions
  const autoScored = screenFeedback.filter(sf => sf.scoringHints === undefined);
  const dimensions: DimensionResult[] = task.scoringDimensions.map((dim, i) => {
    // Simple mapping: distribute auto-scored screens across dimensions
    const mapped = autoScored.length > 0
      ? autoScored[Math.min(i, autoScored.length - 1)]
      : undefined;
    const dimScore = mapped ? mapped.score : overallScore;
    const dimBand = toBand(dimScore);
    const feedback = dimBand === "strong"
      ? `Your responses showed strong ${dim.name.toLowerCase()}.`
      : dimBand === "developing"
      ? `Your ${dim.name.toLowerCase()} was adequate but could be sharper.`
      : `${dim.name} needs more attention — review the feedback on individual screens.`;
    return { name: dim.name, description: dim.description, band: dimBand, feedback };
  });

  // ─── Learner-facing feedback ────────────────────────────────
  const learnerFeedback = buildLearnerFeedback(task.id, screenFeedback, dimensions, overallBand);

  return { screenFeedback, overallScore, overallBand, dimensions, learnerFeedback };
}

// ─── Learner feedback builder ─────────────────────────────────

/** Per-task focus-area tips keyed by dimension name → band */
const FOCUS_TIPS: Record<string, Record<string, Record<Band, string>>> = {
  ojt: {
    "Decision Quality": {
      strong: "",
      developing: "Before choosing an action, list the consequences of each option. Ask: 'What happens if I do this and it doesn't work?'",
      "needs-work": "Start with the most urgent problem. When there are multiple options, eliminate the ones that only delay the situation — look for actions that move things forward.",
    },
    "Justification Logic": {
      strong: "",
      developing: "When explaining your reasoning, name the specific people affected and the time pressure involved — not just what feels right.",
      "needs-work": "Try using the format: 'I chose this because [stakeholder] needs [outcome] within [timeframe].' This forces you to connect your choice to real consequences.",
    },
    "Escalation Judgment": {
      strong: "",
      developing: "Escalation isn't about passing the problem — it's about getting the right authority involved at the right time. Ask: 'Can I still fix this alone, or do I need someone with more authority?'",
      "needs-work": "Escalate when the situation is beyond what your role can resolve — not before you've tried, and not after it's too late. The trigger here was: the trainer confirmed they won't come.",
    },
    "Communication Quality": {
      strong: "",
      developing: "A good status message has three parts: acknowledge the problem, say what's happening now, give a clear next step. Keep it short.",
      "needs-work": "When writing under pressure, use this structure: (1) what happened, (2) what we're doing, (3) what you need to do. Avoid blame and keep the tone calm.",
    },
  },
  cpd: {
    "Problem Diagnosis": {
      strong: "",
      developing: "Look beyond the obvious. 'Mixed levels' is a symptom — the cause is often lack of differentiation in the task design itself.",
      "needs-work": "When diagnosing a classroom problem, separate what you can see (symptoms) from what's causing it (root causes). Multiple causes often work together.",
    },
    "Impact Awareness": {
      strong: "",
      developing: "Be specific about impact. 'Students struggle' is vague — 'weaker students stop participating because the task is above their level' is actionable.",
      "needs-work": "Think about impact from the student's perspective. How does this problem affect someone at the bottom of the class vs the top? What do they each experience?",
    },
    "Strategy Practicality": {
      strong: "",
      developing: "Good strategies name a concrete action, not just an approach. 'Use group work' is vague. 'Assign mixed-ability pairs with role cards so the weaker student has a defined contribution' is practical.",
      "needs-work": "For each strategy, ask yourself: could a colleague walk into my classroom and do this tomorrow with no extra materials? If not, simplify it.",
    },
    "Pedagogical Awareness": {
      strong: "",
      developing: "Show that you understand why a strategy works, not just that it exists. Tiered tasks work because they let every student succeed at their level — say that.",
      "needs-work": "Focus on three core ideas: differentiation (different tasks for different levels), scaffolding (support that you can gradually remove), and engagement (tasks that require active participation).",
    },
    "Decision Quality": {
      strong: "",
      developing: "Under constraints, pick the strategy that gives the most impact for the least setup. Tiered tasks can be created with a single handout by adjusting the expected output.",
      "needs-work": "When you have limited time and no extra materials, the best strategies are ones you can explain in one sentence and students can start immediately.",
    },
  },
  "ai-policy": {
    "Risk Detection": {
      strong: "",
      developing: "When evaluating AI output, check three things: Is it pedagogically sound? Is it realistic? Does it match how people actually learn?",
      "needs-work": "AI-generated content often looks professional but contains fundamental problems. Read it as if a new teacher wrote it — what would you correct?",
    },
    "Policy Alignment": {
      strong: "",
      developing: "When checking against policy, go point by point. Don't just say 'it doesn't meet policy' — name which specific requirement it fails.",
      "needs-work": "Read the policy as a checklist. For each point, ask: does this AI output meet this requirement? If not, write down exactly where it fails.",
    },
    "Adaptation Quality": {
      strong: "",
      developing: "When rewriting AI content, don't just polish the language. Fix the underlying approach — change what students actually do, not just how it's described.",
      "needs-work": "Start your rewrite by listing what's wrong, then fix each problem. A good adaptation changes the activities, not just the wording.",
    },
    "Reasoning Clarity": {
      strong: "",
      developing: "When justifying your decisions, connect each point to a specific reason. 'This is wrong because...' is better than 'I don't think this works.'",
      "needs-work": "Practice the 'because' test: every judgment you make should end with 'because [specific reason].' If you can't finish the sentence, your reasoning needs more thought.",
    },
  },
  "info-priority": {
    "Prioritisation Accuracy": {
      strong: "",
      developing: "Urgency isn't just about deadlines — it's about who is affected and what happens if you wait. Prioritise actions that reduce uncertainty for the most people.",
      "needs-work": "When prioritising, ask: 'If I do nothing about this for 15 minutes, what happens?' The items where the answer is 'things get worse' go to the top.",
    },
    "Logical Reasoning": {
      strong: "",
      developing: "When explaining priorities, name the specific consequence of delay. 'Participants need to know' is weak. 'Three people are about to leave because they think it's cancelled' is strong.",
      "needs-work": "Your reasoning should answer three questions: What's the most urgent thing? Why is it more urgent than the others? What happens if I do it later instead of now?",
    },
    "Adaptability": {
      strong: "",
      developing: "When conditions change, re-evaluate from scratch. Don't just slot the new information into your existing plan — ask whether your whole approach still makes sense.",
      "needs-work": "The twist changed the situation significantly. When that happens, stop, re-read the new information, and re-rank everything. Your first priority might need to change completely.",
    },
    "Communication Clarity": {
      strong: "",
      developing: "Under pressure, keep messages to three sentences: what happened, what we're doing, what you should do. No background, no apologies, just clarity.",
      "needs-work": "When people are waiting for information, they need facts, not reassurance. Tell them: the situation, the plan, and what to do next. Keep it under 40 words.",
    },
  },
  argument: {
    "Claim Identification": {
      strong: "",
      developing: "A claim is the main point the author is trying to convince you of — not a summary of everything they said. Ask: 'What is this person arguing for?'",
      "needs-work": "To find the main claim, look for the sentence that everything else supports. In Text A, every point leads to 'online learning is the future.' That's the claim.",
    },
    "Evaluation Quality": {
      strong: "",
      developing: "When comparing arguments, don't just say which one you agree with. Look at the quality of reasoning: which one has better evidence, fewer assumptions, and stronger logic?",
      "needs-work": "Stronger arguments have: specific evidence (not just claims), limited assumptions, and logical connections between points. Compare the texts on these three criteria.",
    },
    "Weakness Detection": {
      strong: "",
      developing: "Common weaknesses: overgeneralisation (claiming too much from limited evidence), ignoring alternatives, and assuming causation from correlation.",
      "needs-work": "Look for words like 'all,' 'always,' 'clear,' 'obvious' — they often signal overgeneralisation. Then check: is the evidence really strong enough for that conclusion?",
    },
    "Evidence Judgment": {
      strong: "",
      developing: "Good evidence is specific, from a credible source, and directly relevant. A blog post or headline is not as strong as a research study.",
      "needs-work": "When choosing evidence, ask: (1) Is it from a reliable source? (2) Does it directly support the point? (3) Could someone argue against it easily? The best evidence passes all three tests.",
    },
    "Argument Construction": {
      strong: "",
      developing: "A strong argument has three parts: a clear position, a reason, and evidence. Make sure yours has all three, in that order.",
      "needs-work": "Use this structure: 'I believe [position] because [reason]. For example, [evidence].' Then add one sentence acknowledging the other side to show balanced thinking.",
    },
  },
  "data-literacy": {
    "Problem Detection": {
      strong: "",
      developing: "When looking at a chart, check three things systematically: the axes (are they honest?), the sample (is it big enough?), and the question (did it change?).",
      "needs-work": "Start with the y-axis. If it doesn't start at zero, ask why. Then check the sample size — 12 people is not the same as 1,200. These are the most common tricks in data presentation.",
    },
    "Causal Reasoning": {
      strong: "",
      developing: "Correlation is not causation. When two things happen at the same time, ask: what else changed? In this case, a competitor closing is a huge confounding variable.",
      "needs-work": "Just because B happened after A doesn't mean A caused B. To establish causation, you need to rule out other explanations. List every other thing that changed in the same period.",
    },
    "Data Reinterpretation": {
      strong: "",
      developing: "An honest title states what was measured and what changed — without implying a cause. 'Satisfaction scores increased' is different from 'Training improved satisfaction.'",
      "needs-work": "Your rewrite should remove any causal claim and acknowledge what changed. Try: '[Metric] changed from X to Y between [dates]' as a starting point, then add relevant context.",
    },
    "Communication Clarity": {
      strong: "",
      developing: "When writing for a non-technical audience, lead with what you know, then what you don't know, then what to do next. That structure works for almost any data summary.",
      "needs-work": "A good board summary has three sentences: what the data shows, why we should be cautious about the conclusion, and what we should measure next. Keep it factual and constructive.",
    },
  },
  "explain-simply": {
    "Core Accuracy": {
      strong: "",
      developing: "Simplifying doesn't mean leaving things out. The core mechanism (interest earning interest) must be in your explanation — without it, the person won't understand why compound interest is special.",
      "needs-work": "Check your explanation against this test: if someone only knew what you told them, would they understand why £1,000 grows faster in year 20 than year 1? If not, you've missed the key idea.",
    },
    "Jargon Removal": {
      strong: "",
      developing: "Every technical term is a barrier. 'Principal' means nothing to most people. 'The money you started with' means the same thing and costs nothing in accuracy.",
      "needs-work": "Read your explanation aloud. Every word that a non-expert would need to look up is jargon. Replace it with everyday language. If you can't replace it, explain it in the same sentence.",
    },
    "Analogy Quality": {
      strong: "",
      developing: "A good analogy captures the mechanism, not just the outcome. A snowball works because it shows acceleration — the bigger it gets, the faster it grows. A ladder doesn't — it implies steady, linear progress.",
      "needs-work": "The best analogies share the same structure as the concept. Compound interest accelerates over time. So your analogy needs to show something that speeds up, not just something that gets bigger.",
    },
    "Adaptation": {
      strong: "",
      developing: "When someone says 'so it's just more interest?' — they've understood the surface but missed the acceleration. Address that specific gap rather than repeating your original explanation.",
      "needs-work": "When someone is confused, don't start over. Listen to what they said, identify the specific thing they've missed, and address only that. Their confusion tells you exactly where to focus.",
    },
    "Tone & Accessibility": {
      strong: "",
      developing: "The best explanations sound like a conversation, not a lecture. Use 'you' and 'your money' — make it personal. Avoid 'one should consider' or 'it is important to note.'",
      "needs-work": "Imagine you're explaining this to a friend over coffee. That's the tone you want. Warm, direct, no showing off. The goal is their understanding, not your credibility.",
    },
  },
};

function buildLearnerFeedback(
  taskId: string,
  screenFeedback: ScreenFeedback[],
  dimensions: DimensionResult[],
  overallBand: Band,
): LearnerFeedback {
  // Find strongest dimension
  const strongDims = dimensions.filter(d => d.band === "strong");
  const weakDims = dimensions.filter(d => d.band === "needs-work");
  const midDims = dimensions.filter(d => d.band === "developing");

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
    if (overallBand === "strong") {
      focusAreas.push("Review the per-screen feedback to find small refinements — even strong performers have areas to sharpen.");
    } else {
      focusAreas.push("Look at the screens where you scored lowest and read the 'Better option' hints carefully. Understanding why the better option works is more valuable than memorising it.");
    }
  }

  // Next step
  const nextStep = overallBand === "strong"
    ? "Try the task again and challenge yourself to justify every choice in one sentence — this builds the habit of clear reasoning under pressure."
    : overallBand === "developing"
    ? "Pick your weakest dimension from above and try the task again, focusing specifically on that area. Targeted practice is more effective than repeating everything."
    : "Start by re-reading the feedback on the screens marked 'Needs work.' For each one, think about what you would do differently, then try the task again.";

  return { strength, focusAreas, nextStep };
}

export { bandLabel };
