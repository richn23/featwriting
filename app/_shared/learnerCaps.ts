import type { LearnerCapabilitySection, Diagnosis, FormAnalysis } from "./types";
import { levelToPercent } from "./helpers";

export const CEFR_LEARNER_ORDER = ["Below A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"] as const;

export const pickLearnerTier = <T,>(byLevel: Record<string, T>, diagnosedLevel: string, fallback: T): T => {
  const hit = byLevel[diagnosedLevel];
  if (hit !== undefined) return hit;
  const idx = CEFR_LEARNER_ORDER.findIndex(l => l === diagnosedLevel);
  if (idx >= 0) {
    const t = byLevel[CEFR_LEARNER_ORDER[idx] as string];
    if (t !== undefined) return t;
  }
  return fallback;
};

/** Task 3 learner-facing only — positive, cumulative summaries by function (not macro checklist). */
export type T3LearnerCaps = { expressing: string[]; arguing: string[] };

export const T3_LEARNER_CAPS_BY_LEVEL: Record<string, T3LearnerCaps> = {
  "Below A1": {
    expressing: ["share simple likes, dislikes, or preferences in writing", "answer short questions about your opinion", "use familiar words to react to a prompt"],
    arguing: ["give a one-line reason for a simple choice", "respond briefly when someone disagrees"],
  },
  A1: {
    expressing: ["state opinions on familiar topics in simple sentences", "give short reasons for what you think", "use basic phrases to agree or disagree"],
    arguing: ["answer follow-up questions about your view", "compare two simple options and say which you prefer"],
  },
  A2: {
    expressing: ["express opinions on everyday topics with short explanations", "add detail so your position is clear", "stay on topic while you develop your answer"],
    arguing: ["respond when someone questions your view", "give at least one reason or example to support a claim"],
  },
  "A2+": {
    expressing: ["express views with more than one supporting point", "use connecting language to link ideas", "adjust your tone slightly when the question changes"],
    arguing: ["engage with a counter-view in simple terms", "defend a position across a short exchange"],
  },
  B1: {
    expressing: ["express opinions clearly with reasons and examples", "maintain your position while adding detail", "acknowledge that others may see things differently"],
    arguing: ["respond to challenge without losing your main point", "support claims with brief explanations or examples"],
  },
  "B1+": {
    expressing: ["state nuanced opinions and qualify them where needed", "use varied language to explain your stance", "keep your line of argument easy to follow"],
    arguing: ["handle disagreement while refining your position", "compare your view with an alternative perspective"],
  },
  B2: {
    expressing: ["express confident opinions on abstract and concrete topics", "use precise language to sharpen your point", "hold a clear personal line across several turns"],
    arguing: ["respond to counter-arguments with reasons", "defend your view under sustained challenge", "weigh strengths and limits of your position"],
  },
  "B2+": {
    expressing: ["express clear and confident opinions on complex prompts", "use strong, precise language to make a point", "maintain a consistent personal position in debate-style exchange"],
    arguing: ["respond to counter-arguments with structured reasoning", "maintain and defend a position under challenge", "use examples to strengthen claims"],
  },
  C1: {
    expressing: ["express clear and confident opinions", "use precise language to make your point", "maintain a strong personal position", "acknowledge another side while keeping your own view"],
    arguing: ["respond to challenge and disagreement", "defend your views with reasons", "acknowledge alternative perspectives while holding your position", "develop arguments with examples and explanation"],
  },
  C2: {
    expressing: ["express nuanced, well-supported opinions with control of tone", "use precise, flexible language to sharpen and qualify your point", "sustain a clear position across a demanding exchange"],
    arguing: ["respond flexibly to challenge and refine your stance", "defend and complicate your views with layered reasoning", "integrate counter-perspectives without losing your line of argument"],
  },
};

export type T1LearnerCaps = { informing: string[]; interactional: string[] };
export type T2LearnerCaps = { informing: string[]; narrating: string[] };

export const T1_LEARNER_CAPS_BY_LEVEL: Record<string, T1LearnerCaps> = {
  "Below A1": {
    informing: ["give very short factual answers in writing", "name simple topics or preferences", "repeat or copy familiar phrases when prompted"],
    interactional: ["respond to a greeting or simple question", "use basic signs of politeness", "signal yes/no or simple agreement"],
  },
  A1: {
    informing: ["share simple facts about yourself and everyday topics", "answer direct questions with short written replies", "list a few related points on a familiar theme"],
    interactional: ["keep a short written exchange going", "ask and answer simple follow-up questions", "show you have understood the other person's prompt"],
  },
  A2: {
    informing: ["give simple descriptions and explanations in writing", "add a second sentence to clarify what you mean", "stay relevant to the question asked"],
    interactional: ["take turns in a structured chat-style task", "react to feedback or a new angle briefly", "repair misunderstanding with simpler wording"],
  },
  "A2+": {
    informing: ["organise a short answer into two or three clear points", "use linking words to connect sentences", "adjust detail when the prompt asks for more"],
    interactional: ["maintain appropriate tone across several exchanges", "respond to hints without losing the thread", "signal when you need a moment or a repeat"],
  },
  B1: {
    informing: ["explain ideas with reasons and simple examples", "compare basic options in writing", "summarise what you think the reader needs to know"],
    interactional: ["co-operate with the flow of a guided conversation", "negotiate meaning when a word is tricky", "close your contribution politely and clearly"],
  },
  "B1+": {
    informing: ["develop a line of thought across several sentences", "highlight what matters most to your reader", "use paraphrase to avoid repetition"],
    interactional: ["respond flexibly to a change of sub-topic", "show awareness of the other speaker's goal", "keep contributions balanced in length"],
  },
  B2: {
    informing: ["present information clearly for a defined purpose", "select relevant detail and leave out noise", "structure answers so the main message comes first"],
    interactional: ["manage a demanding exchange without losing rapport", "hedge or qualify appropriately in writing", "handle mild disagreement constructively"],
  },
  "B2+": {
    informing: ["convey nuanced information with controlled emphasis", "integrate evidence from prompts or prior turns", "preview and recap to guide the reader"],
    interactional: ["sustain stance and tone under time pressure", "anticipate likely follow-ups in your wording", "show pragmatic control of register"],
  },
  C1: {
    informing: ["communicate complex information with clarity and economy", "prioritise and layer detail for different reader needs", "monitor your own message for clarity as you write"],
    interactional: ["orchestrate extended interaction with natural flow", "fine-tune tone to the interpersonal context", "recover smoothly from ambiguity or overlap"],
  },
  C2: {
    informing: ["handle subtle informational tasks with full control", "exploit stylistic range to serve the communicative goal", "integrate multiple sources of information coherently"],
    interactional: ["show full interactional ease in demanding written dialogue", "deploy idiomatic and precise pragmatic choices", "mediate between perspectives with sensitivity"],
  },
};

export const T2_LEARNER_CAPS_BY_LEVEL: Record<string, T2LearnerCaps> = {
  "Below A1": {
    informing: ["write a few words or a short label about a topic", "copy or complete a simple sentence from a model"],
    narrating: ["name one event or action in order", "use present or past in a very simple way"],
  },
  A1: {
    informing: ["describe people, places, or routines in simple sentences", "give basic factual information in order"],
    narrating: ["tell a short sequence of events", "use simple time words (then, after, before)", "say how something felt or ended"],
  },
  A2: {
    informing: ["explain what happened with a clear beginning and end", "add one or two supporting details", "keep tense mostly consistent"],
    narrating: ["link events with basic connectors", "include simple background", "show attitude toward what happened"],
  },
  "A2+": {
    informing: ["select information that supports your main point", "vary sentence openings slightly", "round off with a short conclusion"],
    narrating: ["build a clearer arc (setup — event — outcome)", "use past and past progressive where appropriate"],
  },
  B1: {
    informing: ["structure a longer piece with paragraphs", "illustrate ideas with examples", "signal main vs supporting information"],
    narrating: ["sustain a story or account across several paragraphs", "use time and place references to orient the reader", "describe reactions and consequences"],
  },
  "B1+": {
    informing: ["prioritise ideas so the reader can follow easily", "integrate description with explanation", "preview what you will cover"],
    narrating: ["vary pacing and focus within the narrative", "use reported speech or summary where useful"],
  },
  B2: {
    informing: ["craft an engaging informative text for a known audience", "balance objective detail with stance where appropriate", "use cohesive devices across sections"],
    narrating: ["shape narrative for effect (highlight, foreshadow, reflect)", "control viewpoint and voice", "maintain coherence across a sustained text"],
  },
  "B2+": {
    informing: ["handle abstract and concrete content in one piece", "tighten redundancy while keeping voice", "guide the reader through non-linear information"],
    narrating: ["sustain tension or reflection in extended narration", "embed evaluation within the story"],
  },
  C1: {
    informing: ["control information density and reader guidance at will", "exploit stylistic choices for clarity and impact", "integrate examples without losing thread"],
    narrating: ["sophisticated narrative control — time, perspective, evaluation", "sustain voice and register across a long response"],
  },
  C2: {
    informing: ["write with near-native flexibility for demanding informative purposes", "exploit full range of organisational and stylistic means"],
    narrating: ["full narrative artistry with natural, idiomatic control"],
  },
};

/** Task 5 learner: mediation — positive summaries (not Informing/Mediating/Directing macro labels). */
export type T5LearnerMediationCaps = { understandingComparing: string[]; givingAdvice: string[]; usingInformation: string[] };

export const T5_LEARNER_MEDIATION_BY_LEVEL: Record<string, T5LearnerMediationCaps> = {
  "Below A1": {
    understandingComparing: ["notice that there are two different options to choose from", "point to something simple that distinguishes them"],
    givingAdvice: ["say which option you would pick in a few words", "respond when someone asks what you think"],
    usingInformation: ["use words or details from what you can see on the cards", "give a short reason tied to one detail"],
  },
  A1: {
    understandingComparing: ["spot basic differences between the two options (e.g. price, main feature)", "name the option that fits a simple need better"],
    givingAdvice: ["recommend one option for a clear situation", "give a one-line reason for your choice"],
    usingInformation: ["refer to at least one fact from the options when you answer", "stay with what the cards show"],
  },
  A2: {
    understandingComparing: ["compare two options in a short, clear way", "say what matters most for the person asking"],
    givingAdvice: ["choose an option and say why it helps", "match your suggestion to the situation described"],
    usingInformation: ["select details from the cards that support your view", "explain your choice in your own words"],
  },
  "A2+": {
    understandingComparing: ["contrast options with more than one point of difference", "adjust what you highlight when the question changes"],
    givingAdvice: ["give a reason that fits the situation, not only generic opinion", "signal when one option is better for one purpose and the other for another"],
    usingInformation: ["weave together two or more details from the options", "keep your advice tied to what is on the cards"],
  },
  B1: {
    understandingComparing: ["explain trade-offs between options in a structured way", "prioritise what matters for the decision"],
    givingAdvice: ["recommend clearly and back it with reasons from the options", "acknowledge when neither option is perfect"],
    usingInformation: ["synthesise information so the reader can decide", "leave out detail that does not help the decision"],
  },
  "B1+": {
    understandingComparing: ["compare across several criteria (cost, quality, fit, time)", "reframe the comparison when the situation changes"],
    givingAdvice: ["tailor advice to the person's goals and constraints", "qualify your recommendation when risks exist"],
    usingInformation: ["filter and organise card information for the reader's need", "anticipate what else they might need to know"],
  },
  B2: {
    understandingComparing: ["handle nuanced differences and subtle trade-offs between options", "keep the comparison fair and balanced"],
    givingAdvice: ["give persuasive, well-supported recommendations with an appropriate tone", "respond when priorities conflict"],
    usingInformation: ["integrate several pieces of evidence from the options into a clear line of advice", "present information in an order that supports the decision"],
  },
  "B2+": {
    understandingComparing: ["synthesise trade-offs at abstract and concrete levels", "reframe when new constraints appear"],
    givingAdvice: ["defend a recommendation under challenge or complication", "adapt advice when the scenario shifts"],
    usingInformation: ["foreground what matters most for the decision", "connect multiple factors from the source into a coherent recommendation"],
  },
  C1: {
    understandingComparing: ["orchestrate comparison across several dimensions", "mediate conflicting information between options"],
    givingAdvice: ["deliver nuanced, context-sensitive advice", "balance empathy with clarity"],
    usingInformation: ["control emphasis and omission for impact", "integrate stakeholder perspectives into one clear takeaway"],
  },
  C2: {
    understandingComparing: ["compare complex options with full pragmatic control", "hold multiple criteria in view at once"],
    givingAdvice: ["advise with flexibility, tact, and precision", "adjust stance smoothly as needs change"],
    usingInformation: ["mediate dense material for any stated interpersonal goal", "exploit stylistic range to build trust in your advice"],
  },
};

/** Task 4: transformation / pragmatic control — gated positives (B2+ → audience; C1 → full control). */
export const TASK4_CEFR_ORDER = ["Below A2", "Below A1", "Pre-A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"] as const;

export const task4CefrRank = (lvl: string): number => {
  const alias: Record<string, string> = { A2_PLUS: "A2+", B1_PLUS: "B1+", B2_PLUS: "B2+" };
  const key = alias[lvl] ?? lvl;
  const i = TASK4_CEFR_ORDER.indexOf(key as (typeof TASK4_CEFR_ORDER)[number]);
  if (i >= 0) return i;
  return 5;
};

export const getTask4LearnerCapabilitySections = (diagnosedLevel: string): LearnerCapabilitySection[] => {
  const r = task4CefrRank(diagnosedLevel);
  const iB2 = TASK4_CEFR_ORDER.indexOf("B2");
  const iB2p = TASK4_CEFR_ORDER.indexOf("B2+");
  const iC1 = TASK4_CEFR_ORDER.indexOf("C1");
  const isB2 = r >= iB2;
  const isB2Plus = r >= iB2p;
  const isC1 = r >= iC1;

  const adjusting: string[] = [];
  const audience: string[] = [];

  if (!isB2) {
    adjusting.push("use simpler wording when you need to make a short text easier to follow");
    adjusting.push("shift how formal or informal your rewrite sounds");
    adjusting.push("keep the main idea clear when you change words or phrases");
    audience.push("notice who will read the text and tweak wording slightly for that reader");
  } else {
    adjusting.push("simplify complex sentences so they are easier to understand");
    adjusting.push("rewrite messages in a clearer, more natural way");
    adjusting.push("change tone to match the situation");
    adjusting.push("keep the main meaning when you rewrite");
    if (!isB2Plus) audience.push("shape your wording for the reader or situation named in the task");
    else {
      audience.push("adjust language for a specific reader (e.g. colleague, customer, general reader)");
      audience.push("make information more accessible for the intended audience");
    }
    if (isC1) {
      adjusting.push("bring together simplification, register shift, and precise meaning in harder reformulations");
    }
  }

  return [
    { title: "Adjusting language", lines: adjusting.slice(0, 5) },
    { title: "Adapting for audience", lines: audience.slice(0, 5) },
  ];
};

export const getTask5LearnerCapabilitySections = (diagnosedLevel: string): LearnerCapabilitySection[] => {
  const fb = T5_LEARNER_MEDIATION_BY_LEVEL.B1!;
  const c = pickLearnerTier(T5_LEARNER_MEDIATION_BY_LEVEL, diagnosedLevel, fb);
  return [
    { title: "Understanding and comparing options", lines: c.understandingComparing.slice(0, 5) },
    { title: "Giving advice", lines: c.givingAdvice.slice(0, 5) },
    { title: "Using information effectively", lines: c.usingInformation.slice(0, 5) },
  ];
};

/**
 * Build "What you can do" from actual CONFIRMED diagnosis macros when available.
 * Falls back to the fixed level-based lookup tables when diagnosis has no results.
 */
export const getLearnerCapabilitySections = (taskNum: number, diagnosedLevel: string, diagnosis?: Diagnosis | null): LearnerCapabilitySection[] | null => {
  if (diagnosedLevel === "—") return null;

  // ── Try actual diagnosis results first ──
  const confirmed = diagnosis?.results?.filter(r => r.result === "CONFIRMED") ?? [];
  if (confirmed.length > 0) {
    // Group confirmed macros by their function label (e.g. "Interactional", "Informing")
    const byFn = new Map<string, string[]>();
    for (const r of confirmed) {
      const fn = r.fn || "General";
      if (!byFn.has(fn)) byFn.set(fn, []);
      byFn.get(fn)!.push(r.claim);
    }
    const sections: LearnerCapabilitySection[] = [];
    for (const [fn, claims] of byFn) {
      sections.push({ title: fn, lines: claims });
    }
    if (sections.length > 0) return sections;
  }

  // ── Fallback: fixed level-based tables ──
  const fb1 = T1_LEARNER_CAPS_BY_LEVEL.B1!;
  const fb3 = T3_LEARNER_CAPS_BY_LEVEL.B1!;
  switch (taskNum) {
    case 1: {
      const c = pickLearnerTier(T1_LEARNER_CAPS_BY_LEVEL, diagnosedLevel, fb1);
      return [{ title: "Informing", lines: c.informing }, { title: "Interactional", lines: c.interactional }];
    }
    case 2: {
      const c = pickLearnerTier(T2_LEARNER_CAPS_BY_LEVEL, diagnosedLevel, T2_LEARNER_CAPS_BY_LEVEL.B1!);
      return [{ title: "Informing", lines: c.informing }, { title: "Narrating", lines: c.narrating }];
    }
    case 3: {
      const c = pickLearnerTier(T3_LEARNER_CAPS_BY_LEVEL, diagnosedLevel, fb3);
      return [{ title: "Expressing", lines: c.expressing }, { title: "Arguing", lines: c.arguing }];
    }
    case 4:
      return getTask4LearnerCapabilitySections(diagnosedLevel);
    case 5:
      return getTask5LearnerCapabilitySections(diagnosedLevel);
    default:
      return null;
  }
};

/** Learner "What to improve next" — short, developmental; not macro failure lists. */
export const getLearnerImprovementHints = (form: FormAnalysis | null, taskNum: number): string[] => {
  const hints: string[] = [];
  const sorted = [...(form?.dimensions ?? [])].sort((a, b) => levelToPercent(a.level) - levelToPercent(b.level));
  const dimHint = (dim: string): string | null => {
    const d = dim.toLowerCase();
    if (d.includes("grammar")) {
      if (taskNum === 4) return "tighten grammar control in reformulated text";
      return "refine accuracy and range in more demanding sentences";
    }
    if (d.includes("vocab")) {
      if (taskNum === 4) return "widen vocabulary for paraphrase and reformulation";
      if (taskNum === 5) return "extend precision when comparing options and giving advice";
      if (taskNum === 3) return "extend precision and variety in argumentative language";
      return "build vocabulary range for clearer expression";
    }
    if (d.includes("coher") || d.includes("cohesion")) {
      if (taskNum === 2) return "improve cohesion across paragraphs and ideas";
      if (taskNum === 4) return "keep reformulated text coherent end-to-end";
      if (taskNum === 5) return "connect your advice so each step follows from the options and the situation";
      if (taskNum === 3) return "improve cohesion across longer reasoning";
      return "strengthen how ideas link in your writing";
    }
    if (d.includes("spell")) return "keep working on spelling and mechanics so ideas come through clearly";
    if (d.includes("communicative") || d.includes("effectiveness")) {
      if (taskNum === 1) return "make each reply a little fuller when the task invites it";
      if (taskNum === 4) return "make rewrites feel more natural and less stiff or translated";
      if (taskNum === 5) return "strengthen how clearly your advice lands for the reader";
      if (taskNum === 3) return "strengthen how clearly your argument lands for the reader";
      return "aim for clearer impact on the reader";
    }
    return null;
  };
  for (const x of sorted) {
    if (hints.length >= 3) break;
    if (levelToPercent(x.level) >= 75) continue;
    const h = dimHint(x.dimension);
    if (h) hints.push(h);
  }
  const defaults: Record<number, string[]> = {
    1: ["add a bit more detail when you answer open questions", "use linking words across several short turns", "re-read for missing words before sending"],
    2: ["develop ideas with clearer examples", "vary how sentences open", "check paragraph flow"],
    3: ["organise longer arguments more clearly", "use more developed examples", "strengthen cohesion across ideas"],
    4: [
      "make rewrites sound more natural and less stiff or translated",
      "hold tone steady across the whole text",
      "improve control when switching between formal and informal styles",
      "keep meaning aligned with the source when the brief demands precision",
    ],
    5: [
      "weigh trade-offs between options more explicitly when priorities conflict",
      "adapt your recommendation when the situation or need changes",
      "tie reasons to specific details from the options so your advice stays grounded",
    ],
  };
  const fill = defaults[taskNum] ?? defaults[3]!;
  for (const d of fill) {
    if (hints.length >= 3) break;
    if (!hints.includes(d)) hints.push(d);
  }
  return [...new Set(hints)].slice(0, 3);
};
