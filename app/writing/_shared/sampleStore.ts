// Cross-task writing sample store (browser localStorage).
// Each task pushes the candidate's raw text into this store when it finishes,
// and the final /writing/report page pools everything for one language analysis.

export type TaskSample = {
  taskId: string;      // "01" | "02" | "03" | "04" | "05"
  taskLabel: string;   // human label for the report
  samples: string[];   // one string per candidate utterance / response
  savedAt: number;     // epoch ms
};

const KEY = "writing-samples-v1";

function read(): TaskSample[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(all: TaskSample[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // quota exceeded or disabled — silently ignore
  }
}

/** Store (or replace) the samples for one task. */
export function saveTaskSamples(taskId: string, taskLabel: string, samples: string[]): void {
  const cleaned = samples.map(s => (s || "").trim()).filter(s => s.length > 0);
  if (cleaned.length === 0) return;
  const all = read().filter(t => t.taskId !== taskId);
  all.push({ taskId, taskLabel, samples: cleaned, savedAt: Date.now() });
  all.sort((a, b) => a.taskId.localeCompare(b.taskId));
  write(all);
}

/** Read everything back for the final report. */
export function getAllTaskSamples(): TaskSample[] {
  return read();
}

/** Wipe the store — used when the candidate restarts. */
export function clearTaskSamples(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** How many tasks have samples saved so far. */
export function getCompletedTaskCount(): number {
  return read().length;
}
