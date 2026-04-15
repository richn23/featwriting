export type TaskKind = "chat" | "write" | "stimulus" | "diagnostic-chat" | "extended-write" | "opinion-chat" | "advisory-chat";

export type TaskBriefing = {
  badge: string;
  titlePrefix: string;
  titleEmphasis: string;
  subtitle: string;
  sections: { title: string; body: string }[];
  reassurance: string;
  startButtonLabel: string;
  extraBriefingClass?: string;
};

export type TaskDefinition = {
  id: string;           // "01" .. "10"
  taskNum: number;      // 1 .. 10 (used by ResultsDashboard + TASK_META)
  kind: TaskKind;
  label: string;        // passed to ResultsDashboard taskLabel
  shortTitle: string;
  apiEndpoint: string;
  descriptorEndpoint: string;
  briefing: TaskBriefing;
};
