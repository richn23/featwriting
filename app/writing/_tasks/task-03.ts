import type { TaskDefinition } from "./types";

export const task03: TaskDefinition = {
  id: "03",
  taskNum: 3,
  kind: "opinion-chat",
  label: "Task 3 · Express & Argue",
  shortTitle: "Opinion Chat",
  apiEndpoint: "/api/writing-task3-chat",
  descriptorEndpoint: "/api/writing-task3-descriptors",
  briefing: {
    badge: "💬 Writing Test · Task 3",
    titlePrefix: "Express &",
    titleEmphasis: "Argue",
    subtitle: "Opinion chat · 4–5 minutes",
    sections: [
      {
        title: "What you'll do",
        body: "You'll choose a topic you care about, then have a written back-and-forth with the AI — like a text debate.",
      },
      {
        title: "How the chat works",
        body: "The AI will respond to what you write. It may disagree, ask \"why?\", or offer another side of the argument. You don't have to \"win\" — just respond honestly.",
      },
      {
        title: "What to focus on",
        body: "Say what you think and explain yourself when asked. Short answers are fine; the important part is that you engage with the questions.",
      },
    ],
    reassurance: "There are no trick questions — we want to see how you handle a real discussion in writing.",
    startButtonLabel: "Choose a topic",
    extraBriefingClass: "split-briefing-task3",
  },
};
