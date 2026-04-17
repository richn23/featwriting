import type { TaskDefinition } from "./types";

export const task05: TaskDefinition = {
  id: "05",
  taskNum: 5,
  kind: "advisory-chat",
  label: "Task 5 · Compare & Advise",
  shortTitle: "Compare & Advise",
  apiEndpoint: "/api/writing-task5-chat",
  descriptorEndpoint: "/api/writing-task5-descriptors",
  briefing: {
    badge: "🔀 Writing Test · Task 5",
    titlePrefix: "Compare &",
    titleEmphasis: "Advise",
    subtitle: "Two options + chat · 4–5 minutes",
    sections: [
      {
        title: "What you'll do",
        body: "You'll see two options shown side by side (like two cards). Then you'll chat in writing about them — comparing them and suggesting which might suit someone better.",
      },
      {
        title: "How the chat works",
        body: "The AI will describe different people or situations and ask for your recommendation. The situation may change — you might need to rethink your advice when the details change.",
      },
      {
        title: "What to focus on",
        body: "Explain your thinking in plain language. Compare the options when it helps, and say why a choice fits (or doesn't fit) the person or context you're given.",
      },
    ],
    reassurance: "It's fine to ask for clarification in the chat if something is unclear.",
    startButtonLabel: "See the options",
    extraBriefingClass: "split-briefing-task5",
  },
};
