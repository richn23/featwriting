/* ═══════════════════════════════════════════════════════════════
   Scenario Task Types — Beyond Language Testing
   Shared type definitions for the workplace readiness tasks.
   ═══════════════════════════════════════════════════════════════ */

export type BriefingScreen = {
  kind: "briefing";
  badge: string;
  title: string;
  titleEmphasis: string;
  subtitle: string;
  objective: string;
  criteria: string[];
  stakeholder: { title: string; body: string }[];
};

export type ScenarioScreen = {
  kind: "scenario";
  label: string;
  title: string;
  body: string;        // supports \n for line breaks
  note?: string;       // optional italicised note below body
  pinAsReference?: boolean;  // if true, content stays visible as sidebar on all subsequent screens
};

export type ChoiceScreen = {
  kind: "choice";
  label: string;
  question: string;
  options: { id: string; text: string; quality: "best" | "acceptable" | "poor" }[];
  requireJustification: boolean;
  justificationPrompt?: string;
  justificationMax?: number;
};

export type MultiSelectScreen = {
  kind: "multi-select";
  label: string;
  question: string;
  options: { id: string; text: string; correct: boolean }[];
  minSelect?: number;
  maxSelect?: number;
  requireJustification: boolean;
  justificationPrompt?: string;
  justificationMax?: number;
};

export type ShortTextScreen = {
  kind: "short-text";
  label: string;
  question: string;
  constraints?: string[];   // bullet-style constraints shown to user
  maxWords: number;
  scoringHints: string[];   // what good answers include (for results)
};

export type RankScreen = {
  kind: "rank";
  label: string;
  question: string;
  items: { id: string; text: string }[];
  idealOrder: string[];     // ideal ranking by item id
  requireJustification: boolean;
  justificationPrompt?: string;
  justificationMax?: number;
};

export type UpdateScreen = {
  kind: "update";
  label: string;
  title: string;
  body: string;
  note?: string;
};

export type EvidenceSelectScreen = {
  kind: "evidence-select";
  label: string;
  question: string;
  options: { id: string; text: string; quality: "strong" | "weak" | "irrelevant" | "misleading" }[];
  requireJustification: boolean;
  justificationPrompt?: string;
};

export type Screen =
  | BriefingScreen
  | ScenarioScreen
  | ChoiceScreen
  | MultiSelectScreen
  | ShortTextScreen
  | RankScreen
  | UpdateScreen
  | EvidenceSelectScreen;

export type ScenarioTaskDef = {
  id: string;
  shortTitle: string;
  accentColor: string;    // CSS color for accents
  screens: Screen[];
  scoringDimensions: { name: string; description: string }[];
};
