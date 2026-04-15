/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

export type Message = { role: "assistant" | "user"; content: string; stage?: number };

export type LevelCluster = {
  level: string; label: string; gseRange: [number, number];
  macroIds: string[]; confirmThreshold: number; totalMacros: number;
  onConfirm: string; levelDescription: string;
  promptGuidance?: { topic: string; wordRange: [number, number]; example: string };
};

export type AzeMacro = {
  azeId: string; claim: string; fn: string; level: string;
  microIds: string[]; probes?: string[]; signals?: string[]; notes?: string;
};

export type TaskConfig = {
  meta: { taskId: string; title: string; functions: string[]; maxExchanges?: number; scaffoldingExchanges?: number; description: string };
  principles: Record<string, unknown>;
  gseMicro: unknown[];
  azeMacro: AzeMacro[];
  levelClusters: LevelCluster[];
};

export type MacroResult = {
  azeId: string; claim: string; level: string; fn: string;
  result: "CONFIRMED" | "NOT_DEMONSTRATED" | "NOT_TESTED"; rationale: string; evidence: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
};

export type LevelResult = { level: string; confirmed: boolean; canCount: number; threshold: string };
export type Diagnosis = { diagnosedLevel: string; levelResults: LevelResult[]; results: MacroResult[] };
export type FormDimension = { dimension: string; level: string; descriptor: string; examples: string[]; levelMeaning?: string; focusNext?: string; outliers?: string[]; vocabRange?: string; vocabConsistency?: string };
export type FormAnalysis = { overallFormLevel: string; overallFormSummary: string; dimensions: FormDimension[] };
export type WritingPrompt = { promptTitle: string; promptText: string; suggestedWords: [number, number]; topicSummary: string };
export type ProbeTarget = { azeId: string; claim: string; level: string; fn: string; confidence: string };
export type ElicitationTarget = { azeId: string; claim: string; level: string; fn: string; probeGuidance: string[] };

export type Phase =
  | "loading" | "landing"
  | "t1-briefing" | "t1-conversation" | "t1-probing" | "t1-eliciting" | "t1-diagnosing" | "t1-results"
  | "t2-briefing" | "t2-scaffolding" | "t2-generating-prompt" | "t2-writing" | "t2-diagnosing" | "t2-results"
  | "t3-briefing" | "t3-topic-select" | "t3-conversation" | "t3-probing" | "t3-diagnosing" | "t3-results"
  | "t4-briefing" | "t4-loading-stimuli" | "t4-challenges" | "t4-diagnosing" | "t4-results"
  | "t5-briefing" | "t5-loading" | "t5-conversation" | "t5-probing" | "t5-diagnosing" | "t5-results"
  | "final-report";

export type LearnerCapabilitySection = { title: string; lines: string[] };
export type StimulusItem = { id: string; level: string; type: string; label: string; instruction: string; stimulus: string; targetMacroIds: string[] };
