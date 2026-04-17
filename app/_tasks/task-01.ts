import type { TaskDefinition } from "./types";

export const task01: TaskDefinition = {
  id: "01",
  taskNum: 1,
  kind: "diagnostic-chat",
  label: "Task 1 · Diagnostic Chat",
  shortTitle: "Diagnostic Chat",
  apiEndpoint: "/api/writing-chat",
  descriptorEndpoint: "/api/writing-descriptors",
  briefing: {
    badge: "✍️ Writing Test · Task 1",
    titlePrefix: "Diagnostic",
    titleEmphasis: "Chat",
    subtitle: "Text chat · 3–4 minutes",
    sections: [
      {
        title: "What you'll do",
        body: "You'll have a short text conversation with the AI examiner — similar to messaging apps like WhatsApp or iMessage.\n\nIt starts simple (your name, where you're from) and becomes more challenging based on how you respond.",
      },
      {
        title: "How the AI will behave",
        body: "The AI adapts to your level.\n<ul><li>If you're comfortable, it will ask more challenging questions.</li><li>If something is difficult, it will adjust and support you.</li></ul>\n\nThe aim is to create a natural interaction where you can show how you communicate in writing.",
      },
      {
        title: "How your responses are evaluated",
        body: "Your responses are evaluated based on what you are able to communicate.\n\nThe system looks for clear evidence of your ability across different types of communication.",
      },
    ],
    reassurance: "There are no right or wrong answers — the goal is to see how you communicate.",
    startButtonLabel: "Start Chat",
    extraBriefingClass: "split-briefing-task1",
  },
};
