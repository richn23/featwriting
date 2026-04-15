/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

export const LEVEL_LABELS: Record<string, string> = {
  PRE_A1: "Pre-A1", A1: "A1", A2: "A2", A2_PLUS: "A2+",
  B1: "B1", B1_PLUS: "B1+", B2: "B2", B2_PLUS: "B2+", C1: "C1",
};

export const levelLabel = (level: string) => LEVEL_LABELS[level] ?? level;

export const levelToPercent = (lvl: string): number => {
  const map: Record<string, number> = {
    "Pre-A1": 8, "A1": 18, "A2": 30, "A2+": 40, "B1": 52, "B1+": 62,
    "B2": 72, "B2+": 80, "C1": 90, "C2": 98,
  };
  return map[lvl] ?? 30;
};

export const barColor = (lvl: string): string => {
  const p = levelToPercent(lvl);
  if (p < 25) return "#ef4444";
  if (p < 45) return "#f59e0b";
  if (p < 65) return "#10b981";
  if (p < 80) return "#3b82f6";
  return "#6366f1";
};

export const getTime = (i: number) => {
  const d = new Date(); d.setHours(10, 0, 0, 0); d.setMinutes(d.getMinutes() + i);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const TASK_META: Record<number, { functions: string[]; label: string; note: string }> = {
  1: { functions: ["Informing", "Interactional"], label: "Diagnostic Chat", note: "Short adaptive chat — evidence gathered across 6 structured stages." },
  2: { functions: ["Informing", "Narrating"], label: "Extended Writing", note: "Extended response — evidence from a single sustained piece of writing." },
  3: { functions: ["Expressing", "Arguing"], label: "Opinion Chat", note: "Debate-style chat — evidence from opinion exchange under challenge." },
  4: { functions: ["Mediating"], label: "Pragmatic Control", note: "Stimulus-response — evidence from text transformation tasks." },
  5: { functions: ["Mediating", "Informing"], label: "Compare & Advise", note: "Advisory chat — evidence from comparing and recommending options." },
};

export const softenLevel = (lvl: string): string => {
  const map: Record<string, string> = {
    "Pre-A1": "Pre-A1", "A1": "A1", "A2": "A2", "A2+": "approaching B1",
    "B1": "B1", "B1+": "approaching B2", "B2": "B2", "B2+": "high B2",
    "C1": "C1", "C2": "C2",
  };
  return map[lvl] ?? lvl;
};

export const levelToScore10 = (lvl: string): number => {
  const map: Record<string, number> = {
    "Pre-A1": 1, "A1": 2, "A2": 3.5, "A2+": 4.5,
    "B1": 6, "B1+": 7.5, "B2": 8.5, "B2+": 9.5, "C1": 10,
  };
  return map[lvl] ?? 0;
};

export const resizeTextareaToContent = (e: React.FormEvent<HTMLTextAreaElement>) => {
  const el = e.currentTarget;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
};
