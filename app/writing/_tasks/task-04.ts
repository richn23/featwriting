import type { TaskDefinition } from "./types";

export const task04: TaskDefinition = {
  id: "04",
  taskNum: 4,
  kind: "stimulus",
  label: "Task 4 · Rephrase & Adjust",
  shortTitle: "Rephrase & Adjust",
  apiEndpoint: "/api/writing-task4-chat",
  descriptorEndpoint: "/api/writing-task4-descriptors",
  briefing: {
    badge: "🔄 Writing Test · Task 4",
    titlePrefix: "Rephrase &",
    titleEmphasis: "Adjust",
    subtitle: "Short texts · 4–5 minutes",
    sections: [
      { title: "What you'll do", body: "You'll see several short texts. Each time, you'll be asked to rewrite the text for a new purpose — for example, simpler language, a different tone, or a different reader." },
      { title: "How to approach it", body: "Read the original carefully, read what you're asked to do, then write your version. You can move on when you're happy with each answer." },
      { title: "What matters", body: "Focus on matching the task: the right level of formality, clarity, and fit for the situation described — not on memorising rules." },
    ],
    reassurance: "You're not being tested on naming grammar terms — we care how well your rewritten text fits the brief.",
    startButtonLabel: "Start challenges ...",
    extraBriefingClass: "split-briefing-task4",
  },
};
