import type { TaskDefinition } from "./types";

export const task02: TaskDefinition = {
  id: "02",
  taskNum: 2,
  kind: "extended-write",
  label: "Task 2 · Inform & Narrate",
  shortTitle: "Extended Writing",
  apiEndpoint: "/api/writing-task2-chat",
  descriptorEndpoint: "/api/writing-task2-descriptors",
  briefing: {
    badge: "✍️ Writing Test · Task 2",
    titlePrefix: "Inform &",
    titleEmphasis: "Narrate",
    subtitle: "Two phases · ~5 minutes",
    sections: [
      {
        title: "What you'll do",
        body: "This task has two parts. First, you'll have a short chat with the AI to warm up your ideas. Then you'll write a longer answer on your own.",
      },
      {
        title: "Phase 1 — Short chat",
        body: "The AI will ask a few quick questions to help you think. This part is <strong>not</strong> part of your result — relax, explore ideas, and don't worry about mistakes.",
      },
      {
        title: "Phase 2 — Your writing",
        body: "You'll get a writing prompt based on what you discussed. Take your time and write in your own words — include detail where you can.",
      },
    ],
    reassurance: "Only your extended writing in phase 2 is reviewed — the warm-up chat is there to help you, not to test you.",
    startButtonLabel: "Start Task 2",
    extraBriefingClass: "split-briefing-task2",
  },
};
