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

// Size guards. Writing tasks collect candidate text, not long-form essays,
// so individual samples of ~10k chars are already generous (≈2000 words).
// Total cap prevents quota-exceeded on the 5MB-ish localStorage budget
// even if the user runs every task back-to-back.
const MAX_SAMPLE_CHARS = 10_000;
const MAX_TOTAL_CHARS = 500_000;

function clampSample(s: string): string {
  const trimmed = (s || "").trim();
  return trimmed.length > MAX_SAMPLE_CHARS ? trimmed.slice(0, MAX_SAMPLE_CHARS) : trimmed;
}

function totalChars(all: TaskSample[]): number {
  let sum = 0;
  for (const t of all) for (const s of t.samples) sum += s.length;
  return sum;
}

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

function write(all: TaskSample[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    // Quota exceeded, storage disabled, or private-mode restriction.
    // Drop oldest tasks one at a time and retry, so the most recent
    // samples (which the user just finished) survive.
    const pruned = [...all].sort((a, b) => a.savedAt - b.savedAt);
    while (pruned.length > 1) {
      pruned.shift();
      try {
        window.localStorage.setItem(KEY, JSON.stringify(pruned));
        return true;
      } catch {
        // keep pruning
      }
    }
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    return false;
  }
}

/** Store (or replace) the samples for one task. */
export function saveTaskSamples(taskId: string, taskLabel: string, samples: string[]): void {
  const cleaned = samples.map(clampSample).filter(s => s.length > 0);
  if (cleaned.length === 0) return;

  const all = read().filter(t => t.taskId !== taskId);
  all.push({ taskId, taskLabel, samples: cleaned, savedAt: Date.now() });
  all.sort((a, b) => a.taskId.localeCompare(b.taskId));

  // Budget-based trim: if the combined payload exceeds the cap, drop the
  // oldest samples until we fit. Preserves the most recent work.
  while (totalChars(all) > MAX_TOTAL_CHARS && all.length > 1) {
    const oldest = [...all].sort((a, b) => a.savedAt - b.savedAt)[0];
    const idx = all.indexOf(oldest);
    if (idx >= 0) all.splice(idx, 1);
    else break;
  }

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
