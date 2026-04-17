// ─────────────────────────────────────────────────────────────────────────────
// writing-descriptors.ts — Single source of truth for Writing Task 1: Diagnostic Chat
//
// PURE CONFIG. No API routes. No OpenAI calls. No UI components.
//
// This is the writing test equivalent of descriptors.ts (speaking Task 1).
// Same architecture: GSE micros → AZE macros → level clusters → thresholds.
//
// Sources:
//   • GSE Writing LO Functional Analysis (205 functional descriptors)
//   • AZE Writing Test Macro-Buckets DRAFT (Feb 2026)
//   • AZE Writing Test Stakeholder Pages (Feb 2026)
// ─────────────────────────────────────────────────────────────────────────────


// ═════════════════════════════════════════════════════════════════════════════
// 1. TYPES
// ═════════════════════════════════════════════════════════════════════════════

export type CefrLevel =
  | "PRE_A1"
  | "A1"
  | "A2"
  | "A2_PLUS"
  | "B1"
  | "B1_PLUS"
  | "B2_PLUS";

export type FunctionType = "Interactional" | "Informing";

export type MacroVerdict = "CAN" | "NOT_YET" | "NOT_TESTED";

export interface GseMicro {
  id: string;
  gse: number;
  fn: FunctionType;
  text: string;
}

export interface AzeMacro {
  azeId: string;
  claim: string;
  fn: FunctionType;
  level: CefrLevel;
  microIds: string[];
  probeGuidance: string[];
  notes?: string;
}

export interface LevelCluster {
  level: CefrLevel;
  label: string;
  gseRange: [number, number];
  macroIds: string[];
  confirmThreshold: number;
  totalMacros: number;
  onConfirm: string;
  levelDescription: string;
}

export interface Topic {
  label: string;
  seedPrompt: string;
  /** Tiered prompts: the route picks one based on perceived candidate level */
  tierPrompts?: {
    low: string;   // Pre-A1 to A2: simple, concrete, personal
    mid: string;   // B1: familiar but requires some explanation
    high: string;  // B2+: abstract, comparative, requires reasoning
  };
  /** Primary communicative demand this topic naturally elicits */
  demand: "narrative" | "descriptive" | "comparative" | "evaluative" | "explanatory";
  /** Opener hint — how the examiner should transition into this topic from IDENTITY */
  openerHint: string;
}

export interface WritingTask1Config {
  meta: {
    taskId: string;
    title: string;
    functions: FunctionType[];
    maxExchanges: number;
    description: string;
  };
  principles: {
    responseDefinesEvidence: boolean;
    higherOverridesLowerGaps: boolean;
    singleClearInstanceSufficient: boolean;
    weakInstancesDoNotCombine: boolean;
    textInputOnly: boolean;
    aiDrivesConversation: boolean;
    stopAfterConsecutiveNotYet: number;
  };
  gseMicro: GseMicro[];
  azeMacro: AzeMacro[];
  levelClusters: LevelCluster[];
  topics: Topic[];
}


// ═════════════════════════════════════════════════════════════════════════════
// 2. TASK METADATA
// ═════════════════════════════════════════════════════════════════════════════

const meta: WritingTask1Config["meta"] = {
  taskId: "w-task-1",
  title: "Diagnostic Chat",
  functions: ["Interactional", "Informing"],
  maxExchanges: 12,
  description:
    "WhatsApp-style chat where AI probes up/down to find the candidate's " +
    "writing level. 5–8 exchanges. Tests written interaction and baseline " +
    "informing. Everyone takes this task. Duration: 3–4 minutes.",
};


// ═════════════════════════════════════════════════════════════════════════════
// 3. SCORING PRINCIPLES
// ═════════════════════════════════════════════════════════════════════════════

const principles: WritingTask1Config["principles"] = {
  responseDefinesEvidence: true,
  higherOverridesLowerGaps: true,
  singleClearInstanceSufficient: true,
  weakInstancesDoNotCombine: true,
  textInputOnly: true,
  aiDrivesConversation: true,
  stopAfterConsecutiveNotYet: 2,
};


// ═════════════════════════════════════════════════════════════════════════════
// 4. GSE MICRO DESCRIPTORS (evidence layer)
// ═════════════════════════════════════════════════════════════════════════════

const gseMicro: GseMicro[] = [

  // ── Pre-A1 (GSE 10–21) ──────────────────────────────────────────────────
  { id: "wgse-10-i-1", gse: 10, fn: "Informing", text: "Can write their name, address and nationality." },
  { id: "wgse-16-x-1", gse: 16, fn: "Interactional", text: "Can post simple online greetings, using basic formulaic expressions and emoticons." },
  { id: "wgse-20-i-1", gse: 20, fn: "Informing", text: "Can give personal information in written form (e.g. name, nationality, age, address)." },

  // ── A1 (GSE 22–29) ──────────────────────────────────────────────────────
  { id: "wgse-25-i-1", gse: 25, fn: "Informing", text: "Can write short sentences about things people have." },
  { id: "wgse-27-i-1", gse: 27, fn: "Informing", text: "Can write short, simple sentences about their family, where they live and what they do." },
  { id: "wgse-29-i-1", gse: 29, fn: "Informing", text: "Can write short sentences to describe familiar objects." },
  { id: "wgse-25-x-1", gse: 25, fn: "Interactional", text: "Can write very simple personal messages (e.g. thanks, sorry)." },
  { id: "wgse-27-x-1", gse: 27, fn: "Interactional", text: "Can write a few sentences about themselves (e.g. family, interests)." },

  // ── A2 (GSE 30–35) ──────────────────────────────────────────────────────
  { id: "wgse-30-i-1", gse: 30, fn: "Informing", text: "Can write about what people do for a living." },
  { id: "wgse-31-i-1", gse: 31, fn: "Informing", text: "Can describe a room, house, or workplace." },
  { id: "wgse-32-i-1", gse: 32, fn: "Informing", text: "Can write about feelings using basic fixed expressions." },
  { id: "wgse-34-i-1", gse: 34, fn: "Informing", text: "Can write about likes and dislikes using basic fixed expressions." },
  { id: "wgse-30-x-1", gse: 30, fn: "Interactional", text: "Can write short messages relating to matters of immediate need." },
  { id: "wgse-34-x-1", gse: 34, fn: "Interactional", text: "Can exchange short messages about everyday matters using simple language." },

  // ── A2+ (GSE 36–42) ─────────────────────────────────────────────────────
  { id: "wgse-38-i-1", gse: 38, fn: "Informing", text: "Can write short messages on everyday matters." },
  { id: "wgse-39-i-1", gse: 39, fn: "Informing", text: "Can write about past events and everyday experiences." },
  { id: "wgse-40-i-1", gse: 40, fn: "Informing", text: "Can write about a future trip or plans." },
  { id: "wgse-38-x-1", gse: 38, fn: "Interactional", text: "Can ask and answer questions in short messages on everyday matters." },
  { id: "wgse-42-x-1", gse: 42, fn: "Interactional", text: "Can introduce themselves and manage simple exchanges in writing." },
  { id: "wgse-42-x-2", gse: 42, fn: "Interactional", text: "Can seek clarification in a simple written exchange." },

  // ── B1 (GSE 43–50) ──────────────────────────────────────────────────────
  { id: "wgse-47-i-1", gse: 47, fn: "Informing", text: "Can write connected text about personal interests in some detail." },
  { id: "wgse-48-i-1", gse: 48, fn: "Informing", text: "Can respond to instructions and ask clarifications in writing." },
  { id: "wgse-50-i-1", gse: 50, fn: "Informing", text: "Can write personal online postings with some detail about experiences and feelings." },
  { id: "wgse-46-x-1", gse: 46, fn: "Interactional", text: "Can express opinions in online postings with reasons." },
  { id: "wgse-48-x-1", gse: 48, fn: "Interactional", text: "Can engage in online exchanges, responding to comments and explaining points." },
  { id: "wgse-50-x-1", gse: 50, fn: "Interactional", text: "Can write connected responses with some detail in an ongoing exchange." },

  // ── B1+ (GSE 51–58) ─────────────────────────────────────────────────────
  { id: "wgse-53-x-1", gse: 53, fn: "Interactional", text: "Can follow the thread of an online discussion and contribute relevant comments." },
  { id: "wgse-56-x-1", gse: 56, fn: "Interactional", text: "Can participate in real-time online exchanges with multiple participants." },
  { id: "wgse-55-i-1", gse: 55, fn: "Informing", text: "Can report recent events in some detail in writing." },

  // ── B2+ (GSE 67–75) ─────────────────────────────────────────────────────
  { id: "wgse-68-x-1", gse: 68, fn: "Interactional", text: "Can deal with misunderstandings and disagreements in written exchanges." },
  { id: "wgse-71-x-1", gse: 71, fn: "Interactional", text: "Can negotiate terms and conditions in writing." },
];


// ═════════════════════════════════════════════════════════════════════════════
// 5. AZE MACRO DESCRIPTORS (assessment layer)
// ═════════════════════════════════════════════════════════════════════════════

const azeMacro: AzeMacro[] = [

  // ── Pre-A1 ─────────────────────────────────────────────────────────────
  {
    azeId: "W-INT-1",
    claim: "Can exchange basic personal info in writing",
    fn: "Interactional",
    level: "PRE_A1",
    microIds: ["wgse-10-i-1", "wgse-16-x-1", "wgse-20-i-1"],
    probeGuidance: [
      "Ask for their name",
      "Ask where they are from",
      "Ask their age or what they do",
    ],
    notes:
      "OPENING ANCHOR — always used regardless of topic. " +
      "Accept single words, fragments, or very short phrases. " +
      "CAN requires at least 2 of: name, country/nationality, age, occupation. " +
      "Single-signal response (name only) = NOT_YET unless followed by further exchange.",
  },

  // ── A1 ─────────────────────────────────────────────────────────────────
  {
    azeId: "W-INF-1",
    claim: "Can write simple sentences about self and others",
    fn: "Informing",
    level: "A1",
    microIds: ["wgse-25-i-1", "wgse-27-i-1", "wgse-29-i-1"],
    probeGuidance: [
      "Ask them to describe something simple related to the session topic (e.g. family member, a possession, their home)",
      "Ask what they have or own in relation to the topic",
      "Ask who is involved in their topic (e.g. who they do the hobby with)",
    ],
    notes:
      "INFORMING signals (need at least 2): " +
      "(1) subject + verb + object pattern present; " +
      "(2) references something specific from the topic — not just generic agreement; " +
      "(3) response is at least 2 clauses or 10 words. " +
      "Single-word answers or generic filler ('it is nice') = NOT_YET. " +
      "Misunderstanding the question does not invalidate the macro if the candidate attempts to describe something.",
  },
  {
    azeId: "W-INT-2",
    claim: "Can write very simple personal messages",
    fn: "Interactional",
    level: "A1",
    microIds: ["wgse-25-x-1", "wgse-27-x-1"],
    probeGuidance: [
      "Ask them to tell you a bit about themselves in relation to the topic",
      "Ask what they like or don't like about the topic area",
    ],
    notes:
      "INTERACTION signals (need at least 2): " +
      "(1) directly addresses the question asked; " +
      "(2) adds at least one personal detail beyond the question (not just repeating the question back); " +
      "(3) response is at least 2 clauses or 10 words. " +
      "Generic responses ('I like it very much') without topic reference = NOT_YET.",
  },

  // ── A2 ─────────────────────────────────────────────────────────────────
  {
    azeId: "W-INF-2",
    claim: "Can describe people, places, and routines in writing",
    fn: "Informing",
    level: "A2",
    microIds: ["wgse-30-i-1", "wgse-31-i-1", "wgse-32-i-1", "wgse-34-i-1"],
    probeGuidance: [
      "Ask them to describe something connected to the topic in more detail",
      "Ask what they like and dislike about the topic",
      "Ask them to describe their routine or habits around the topic",
    ],
    notes:
      "DESCRIPTION signals (need at least 2): " +
      "(1) names a specific entity from the topic (place, person, activity) — not generic; " +
      "(2) adds at least one attribute or detail about that entity; " +
      "(3) expresses a preference or feeling with at least minimal reason ('I like X because Y'). " +
      "Repetition loops ('it is good because it is nice') = NOT_YET. " +
      "Topic reference must be explicit — adjacent topics do not count.",
  },
  {
    azeId: "W-INT-3",
    claim: "Can exchange everyday information in short messages",
    fn: "Interactional",
    level: "A2",
    microIds: ["wgse-30-x-1", "wgse-34-x-1"],
    probeGuidance: [
      "Ask what they did recently in relation to the topic",
      "Ask for their preference between two options in the topic area",
      "Add your own reaction and ask them to respond",
    ],
    notes:
      "EXCHANGE signals (need at least 2): " +
      "(1) directly addresses the question — not adjacent topic; " +
      "(2) adds a new piece of information not in the question; " +
      "(3) responds to a follow-up differently from their first answer (shows exchange, not repetition). " +
      "Vague agreement or filler without new content = NOT_YET.",
  },

  // ── A2+ ────────────────────────────────────────────────────────────────
  {
    azeId: "W-INF-3",
    claim: "Can write about events and experiences with time markers",
    fn: "Informing",
    level: "A2_PLUS",
    microIds: ["wgse-38-i-1", "wgse-39-i-1", "wgse-40-i-1"],
    probeGuidance: [
      "Ask them to describe something that happened related to the topic (past)",
      "Ask about their plans or hopes in the topic area (future)",
      "Ask what changed for them in relation to the topic over time",
    ],
    notes:
      "TIME MARKERS signals (need at least 2): " +
      "(1) uses past or future tense with recognisable intent — errors allowed; " +
      "(2) includes a time reference word (last week, yesterday, soon, in the future, when I was); " +
      "(3) describes an event or plan — not just a state. " +
      "Present tense only with no time reference = NOT_YET even if fluent. " +
      "Assess communicative intent, not grammatical accuracy.",
  },
  {
    azeId: "W-INT-4",
    claim: "Can manage simple written exchanges on familiar topics",
    fn: "Interactional",
    level: "A2_PLUS",
    microIds: ["wgse-38-x-1", "wgse-42-x-1", "wgse-42-x-2"],
    probeGuidance: [
      "Ask for clarification on something they said about the topic",
      "Say you didn't quite understand and ask them to explain differently",
      "Ask a follow-up that requires them to expand on a previous message",
    ],
    notes:
      "REPAIR / FOLLOW-UP signals (need at least 2): " +
      "(1) responds directly to the follow-up — not repeating a previous message; " +
      "(2) adjusts or expands their answer in response to the challenge; " +
      "(3) attempts to clarify or rephrase when prompted. " +
      "Repeating the same content without adjustment = NOT_YET.",
  },

  // ── B1 ─────────────────────────────────────────────────────────────────
  {
    azeId: "W-INF-4",
    claim: "Can write connected text about interests and experiences with detail",
    fn: "Informing",
    level: "B1",
    microIds: ["wgse-47-i-1", "wgse-48-i-1", "wgse-50-i-1"],
    probeGuidance: [
      "Ask them to describe their experience with the topic in detail",
      "Ask them to explain why the topic matters to them",
      "Ask them to describe a specific moment or example from the topic area",
    ],
    notes:
      "CONNECTED TEXT signals (need at least 2): " +
      "(1) produces multiple connected sentences — not a list of isolated facts; " +
      "(2) includes at least one of: example, reason, comparison, description of experience; " +
      "(3) uses at least one discourse marker showing connection (because, so, but, for example, although). " +
      "Idea progression must be present — new information added across sentences, not repetition. " +
      "Generic filler ('it is very interesting and very good') without topic content = NOT_YET.",
  },
  {
    azeId: "W-INT-5",
    claim: "Can engage in online exchanges with some detail and opinions",
    fn: "Interactional",
    level: "B1",
    microIds: ["wgse-46-x-1", "wgse-48-x-1", "wgse-50-x-1"],
    probeGuidance: [
      "Share a viewpoint about the topic and ask if they agree",
      "Disagree with something they said and ask them to respond",
      "Ask them to explain why they feel the way they do about the topic",
    ],
    notes:
      "OPINION + ENGAGEMENT signals (need at least 2): " +
      "(1) states a clear opinion — not just preference ('I think X because Y', not just 'I like X'); " +
      "(2) provides at least one reason or justification for the opinion; " +
      "(3) responds to a challenge or disagreement with a new point — not just restating. " +
      "Topic comfort or confident tone alone does not indicate B1 — reasoning must be present. " +
      "Adjusting a response to a follow-up challenge is strong evidence.",
  },

  // ── B1+ ────────────────────────────────────────────────────────────────
  {
    azeId: "W-INT-6",
    claim: "Can participate in real-time exchanges recognising intent and thread",
    fn: "Interactional",
    level: "B1_PLUS",
    microIds: ["wgse-53-x-1", "wgse-56-x-1", "wgse-55-i-1"],
    probeGuidance: [
      "Shift the topic slightly and see if they follow and connect it to earlier messages",
      "Reference something they said earlier and ask how it connects to something new",
      "Ask them to summarise or reflect on what they've shared so far",
    ],
    notes:
      "THREAD signals (need at least 2): " +
      "(1) follows a topic shift without losing coherence — does not revert to earlier content; " +
      "(2) references or connects to something said earlier in the conversation; " +
      "(3) adjusts their response when the AI changes the framing of a question. " +
      "Simply giving a long response does not indicate B1+ — cross-turn coherence must be present.",
  },

  // ── B2+ ────────────────────────────────────────────────────────────────
  {
    azeId: "W-INT-7",
    claim: "Can handle misunderstandings and negotiate in writing",
    fn: "Interactional",
    level: "B2_PLUS",
    microIds: ["wgse-68-x-1", "wgse-71-x-1"],
    probeGuidance: [
      "Deliberately misinterpret something they said and see if they correct it",
      "Make a strong claim about the topic and ask them to defend or challenge it",
      "Ask them to be more precise about something they stated loosely",
    ],
    notes:
      "NEGOTIATION signals (need at least 2): " +
      "(1) identifies and corrects a misunderstanding without becoming confused; " +
      "(2) defends a position with new reasoning — not just repetition; " +
      "(3) uses precise or hedged language to clarify a vague point. " +
      "AI must deliberately misinterpret to elicit this — it will not emerge naturally. " +
      "Confident tone alone does not indicate B2+ — precision and repair must be present.",
  },
];



// ═════════════════════════════════════════════════════════════════════════════
// 6. LEVEL CLUSTERS + THRESHOLDS
// ═════════════════════════════════════════════════════════════════════════════

const levelClusters: LevelCluster[] = [
  {
    level: "PRE_A1",
    label: "Pre-A1",
    gseRange: [10, 21],
    macroIds: ["W-INT-1"],
    confirmThreshold: 1,
    totalMacros: 1,
    onConfirm: "Confirmed Pre-A1 floor. Probe A1.",
    levelDescription:
      "Candidate can type their name, country, and basic personal details. " +
      "Single words and very short fragments accepted.",
  },
  {
    level: "A1",
    label: "A1",
    gseRange: [22, 29],
    macroIds: ["W-INF-1", "W-INT-2"],
    confirmThreshold: 2,
    totalMacros: 2,
    onConfirm: "Confirmed A1. Probe A2.",
    levelDescription:
      "Candidate writes simple sentences about themselves, family, and possessions. " +
      "Key shift: single words to simple sentences.",
  },
  {
    level: "A2",
    label: "A2",
    gseRange: [30, 35],
    macroIds: ["W-INF-2", "W-INT-3"],
    confirmThreshold: 2,
    totalMacros: 2,
    onConfirm: "Confirmed A2. Probe A2+.",
    levelDescription:
      "Candidate describes people, places, routines, and likes/dislikes. " +
      "Key shift: sentences to connected descriptions.",
  },
  {
    level: "A2_PLUS",
    label: "A2+",
    gseRange: [36, 42],
    macroIds: ["W-INF-3", "W-INT-4"],
    confirmThreshold: 2,
    totalMacros: 2,
    onConfirm: "Confirmed A2+. Probe B1.",
    levelDescription:
      "Candidate writes about past events and future plans with time markers. " +
      "Key shift: present only to past/future with interaction.",
  },
  {
    level: "B1",
    label: "B1",
    gseRange: [43, 50],
    macroIds: ["W-INF-4", "W-INT-5"],
    confirmThreshold: 2,
    totalMacros: 2,
    onConfirm: "Confirmed B1. Probe B1+.",
    levelDescription:
      "Candidate writes connected text with detail, opinions, and reasons. " +
      "Key shift: describing to explaining.",
  },
  {
    level: "B1_PLUS",
    label: "B1+",
    gseRange: [51, 58],
    macroIds: ["W-INT-6"],
    confirmThreshold: 1,
    totalMacros: 1,
    onConfirm: "Confirmed B1+. Probe B2+.",
    levelDescription:
      "Candidate manages multi-turn exchanges, follows threads, handles topic shifts. " +
      "Key shift: responding to steering the conversation.",
  },
  {
    level: "B2_PLUS",
    label: "B2+",
    gseRange: [67, 75],
    macroIds: ["W-INT-7"],
    confirmThreshold: 1,
    totalMacros: 1,
    onConfirm: "Confirmed B2+. Ceiling for Task 1.",
    levelDescription:
      "Candidate handles misunderstandings diplomatically, negotiates meaning, " +
      "defends positions with precision. Key shift: participating to negotiating.",
  },
];


// ═════════════════════════════════════════════════════════════════════════════
// 7. TOPICS (session themes for diagnostic chat)
// ═════════════════════════════════════════════════════════════════════════════

const topics: Topic[] = [

  // ── NARRATIVE demand: get them telling a story ──

  {
    label: "a trip or journey",
    seedPrompt: "Get them to tell you about a trip they took — where, when, what happened.",
    demand: "narrative",
    openerHint: "Connect from where they're from — ask if they've been anywhere interesting recently.",
    tierPrompts: {
      low: "Ask about a simple trip — maybe to a shop, a friend's house, or a nearby town. 'Did you go anywhere last weekend?'",
      mid: "Ask about a holiday or a journey that was memorable. 'Tell me about a trip you took — what happened?'",
      high: "Ask about a journey that changed their perspective or didn't go as planned. 'Tell me about a trip that surprised you.'",
    },
  },
  {
    label: "something that went wrong",
    seedPrompt: "Get them to recount a problem or mishap — what happened and how they dealt with it.",
    demand: "narrative",
    openerHint: "After learning about their life, ask about a time something didn't go to plan.",
    tierPrompts: {
      low: "Ask about a small problem — losing something, being late. 'Did something go wrong this week?'",
      mid: "Ask about a time things didn't go as expected. 'Tell me about a time something went wrong — what did you do?'",
      high: "Ask about a mistake they learned from or a situation that was hard to handle. 'Has something ever gone wrong that turned out to be a good thing?'",
    },
  },
  {
    label: "a celebration or special day",
    seedPrompt: "Get them to describe a celebration — birthday, wedding, holiday, festival.",
    demand: "narrative",
    openerHint: "Ask naturally from what they told you — maybe a recent birthday or holiday.",
    tierPrompts: {
      low: "Ask about their last birthday or a holiday they celebrate. 'What did you do on your birthday?'",
      mid: "Ask about a celebration that was important to them. 'Tell me about a special day you remember.'",
      high: "Ask about how celebrations differ across cultures or have changed over time. 'How do people where you're from celebrate important events?'",
    },
  },

  // ── DESCRIPTIVE demand: get them painting a picture ──

  {
    label: "where they live",
    seedPrompt: "Get them to describe their home, street, or neighbourhood — what it looks like, what's nearby.",
    demand: "descriptive",
    openerHint: "They already told you where they're from — now ask what it's actually like there.",
    tierPrompts: {
      low: "Ask what is near their home. 'What is near your house? Is there a shop or park?'",
      mid: "Ask them to describe their neighbourhood — what they see, what they like. 'What does your street look like?'",
      high: "Ask how the area has changed, or what makes it different from other places. 'How has your neighbourhood changed since you moved there?'",
    },
  },
  {
    label: "a person they know well",
    seedPrompt: "Get them to describe someone — appearance, personality, what they do together.",
    demand: "descriptive",
    openerHint: "Ask about someone they mentioned or someone important to them.",
    tierPrompts: {
      low: "Ask about a family member or friend. 'Tell me about your best friend.' or 'Who is in your family?'",
      mid: "Ask them to describe someone they admire or spend a lot of time with. 'What are they like as a person?'",
      high: "Ask what makes that person different from others, or how the relationship has developed. 'What do you think makes someone a good friend?'",
    },
  },
  {
    label: "their typical day",
    seedPrompt: "Get them to walk you through a normal day — morning to evening.",
    demand: "descriptive",
    openerHint: "Connect from their work/study answer — ask what a normal day looks like.",
    tierPrompts: {
      low: "Ask what they do in the morning or after school/work. 'What do you do every day?'",
      mid: "Ask them to describe a typical day from start to finish. 'Walk me through your day — what happens?'",
      high: "Ask how their routine has changed, or whether they like routine or variety. 'Is your daily routine different now from a few years ago?'",
    },
  },
  {
    label: "a favourite place",
    seedPrompt: "Get them to describe a place they enjoy — a cafe, a park, a beach, a room.",
    demand: "descriptive",
    openerHint: "Ask about a place that makes them happy or that they go to often.",
    tierPrompts: {
      low: "Ask about a place they like. 'Do you have a favourite place? What is it like?'",
      mid: "Ask them to describe the place in detail — what you'd see, hear, feel. 'What makes that place special to you?'",
      high: "Ask why certain places feel important or what a place says about a person. 'Why do you think people get attached to certain places?'",
    },
  },

  // ── COMPARATIVE demand: get them weighing two things ──

  {
    label: "city life vs country life",
    seedPrompt: "Get them to compare living in a city with living in the countryside.",
    demand: "comparative",
    openerHint: "From where they live, ask whether they prefer city or quiet areas.",
    tierPrompts: {
      low: "Ask simple preference. 'Do you like living in a big city or a small town?'",
      mid: "Ask them to compare the two. 'What is better about living in a city? And the countryside?'",
      high: "Ask about trade-offs, quality of life, or what matters most in where you live. 'What would you choose if you could live anywhere — and why?'",
    },
  },
  {
    label: "now vs when they were younger",
    seedPrompt: "Get them to compare their life now with their life when they were younger.",
    demand: "comparative",
    openerHint: "Ask if things are different now compared to when they were at school.",
    tierPrompts: {
      low: "Ask a simple then-vs-now question. 'What was different when you were a child?'",
      mid: "Ask them to compare their life now with 5-10 years ago. 'How is your life different from when you were younger?'",
      high: "Ask about what has improved and what hasn't, or whether change is always good. 'Do you think your life is better now than when you were younger? In what ways?'",
    },
  },

  // ── EVALUATIVE demand: get them judging and justifying ──

  {
    label: "something they would change",
    seedPrompt: "Get them to identify something they'd change about their life, town, or country — and explain why.",
    demand: "evaluative",
    openerHint: "From what they've described, ask if there's anything they'd change.",
    tierPrompts: {
      low: "Ask one simple thing they'd change. 'Is there something you don't like about your town?'",
      mid: "Ask what they would change and why. 'If you could change one thing about where you live, what would it be?'",
      high: "Ask about change at a bigger scale. 'What's one thing you think should be different about how people live today?'",
    },
  },
  {
    label: "a decision they made",
    seedPrompt: "Get them to talk about a choice — what they decided, why, and whether it was right.",
    demand: "evaluative",
    openerHint: "Ask about a choice they faced recently — big or small.",
    tierPrompts: {
      low: "Ask about a simple choice. 'What did you choose to eat today? Why?' or 'Do you like your job — or do you want a different one?'",
      mid: "Ask about a decision and their reasoning. 'Tell me about a choice you made recently — was it the right one?'",
      high: "Ask about a difficult decision with trade-offs. 'What's the hardest decision you've had to make? What made it hard?'",
    },
  },
  {
    label: "what makes a good job",
    seedPrompt: "Get them to evaluate what matters in work — money, people, location, interest.",
    demand: "evaluative",
    openerHint: "From their work/study answer, ask what they think matters most in a job.",
    tierPrompts: {
      low: "Ask what they like about work. 'Do you like your job? Why?' or 'What is a good job?'",
      mid: "Ask them to weigh factors. 'What is more important in a job — the money or the people?'",
      high: "Ask about work values in a broader sense. 'Do you think people today care more about money or job satisfaction?'",
    },
  },

  // ── EXPLANATORY demand: get them explaining how or why ──

  {
    label: "how they learned something",
    seedPrompt: "Get them to explain how they picked up a skill — cooking, driving, a language, a sport.",
    demand: "explanatory",
    openerHint: "Ask about a skill they have and how they learned it.",
    tierPrompts: {
      low: "Ask about something they can do. 'Can you cook? Who showed you?' or 'Can you drive?'",
      mid: "Ask them to explain the process. 'How did you learn to do that? Was it difficult?'",
      high: "Ask about learning methods and what works best for them. 'Do you learn better by doing or by reading? Why do you think that is?'",
    },
  },
  {
    label: "why they like something",
    seedPrompt: "Get them to explain their preference — a food, a hobby, a type of music, a place.",
    demand: "explanatory",
    openerHint: "Pick up on something they mentioned enjoying and ask why.",
    tierPrompts: {
      low: "Ask why they like something simple. 'You said you like football — why do you like it?'",
      mid: "Push for reasons beyond 'it's nice'. 'What is it about that thing that you enjoy? Can you explain?'",
      high: "Ask about the deeper reasons. 'Why do you think some things stay important to us while others don't?'",
    },
  },
  {
    label: "how something works where they live",
    seedPrompt: "Get them to explain a system or custom from their context — transport, school, shopping, a tradition.",
    demand: "explanatory",
    openerHint: "Ask how something everyday works where they're from.",
    tierPrompts: {
      low: "Ask about something concrete. 'How do you get to work?' or 'Where do people buy food in your town?'",
      mid: "Ask them to explain a system. 'How does public transport work where you live?' or 'How do people usually find a flat?'",
      high: "Ask them to explain and evaluate. 'How does the education system work where you're from — do you think it works well?'",
    },
  },
  {
    label: "phones and daily life",
    seedPrompt: "Get them to explain how they use their phone and what role it plays in their day.",
    demand: "explanatory",
    openerHint: "Ask naturally — most people use phones constantly, easy to bring up.",
    tierPrompts: {
      low: "Ask what they use their phone for. 'What do you do on your phone?'",
      mid: "Ask them to explain the role it plays. 'Could you live without your phone for a week? Why / why not?'",
      high: "Ask them to explain the broader impact. 'How do you think phones have changed the way people communicate?'",
    },
  },

  // ── MIXED demand: topics that naturally combine multiple types ──

  {
    label: "food and meals",
    seedPrompt: "Start with what they eat, then explore cooking, meals with others, food culture.",
    demand: "descriptive",
    openerHint: "Easy to bring up from daily routine — ask about lunch or dinner.",
    tierPrompts: {
      low: "Ask what they eat. 'What do you usually have for lunch?'",
      mid: "Ask about a meal or cooking experience. 'Do you ever cook for other people? Tell me about it.'",
      high: "Ask about food culture. 'How important is food in your culture? Has the way people eat changed?'",
    },
  },
  {
    label: "weekends",
    seedPrompt: "Get them talking about what they do at the weekend — routine or special activities.",
    demand: "narrative",
    openerHint: "Natural follow-up from daily routine or work questions.",
    tierPrompts: {
      low: "Ask what they did last weekend. 'What did you do at the weekend?'",
      mid: "Ask about a typical vs special weekend. 'What's a good weekend for you?'",
      high: "Ask about work-life balance or how weekends have changed. 'Do you think people need more free time? Why?'",
    },
  },
  {
    label: "animals and pets",
    seedPrompt: "Get them talking about pets, animals, or their feelings about animals.",
    demand: "descriptive",
    openerHint: "Ask if they have any pets or like animals.",
    tierPrompts: {
      low: "Ask if they have a pet or like animals. 'Do you have a pet? What is it like?'",
      mid: "Ask about their experience with animals. 'Tell me about a pet you had — or an animal you like.'",
      high: "Ask about the role of animals in society. 'Do you think keeping pets is always good for the animals?'",
    },
  },
  {
    label: "something new they tried",
    seedPrompt: "Get them to tell you about a time they tried something new — food, activity, place, job.",
    demand: "narrative",
    openerHint: "Ask about a recent first experience.",
    tierPrompts: {
      low: "Ask about something simple and new. 'Did you try anything new this week?'",
      mid: "Ask about a more memorable first time. 'Tell me about a time you tried something for the first time.'",
      high: "Ask about risk and novelty. 'Do you think it's important to try new things? What makes people afraid to?'",
    },
  },
];


// ═════════════════════════════════════════════════════════════════════════════
// 8. EXPORT
// ═════════════════════════════════════════════════════════════════════════════

export const WRITING_TASK1: WritingTask1Config = {
  meta,
  principles,
  gseMicro,
  azeMacro,
  levelClusters,
  topics,
};

export default WRITING_TASK1;