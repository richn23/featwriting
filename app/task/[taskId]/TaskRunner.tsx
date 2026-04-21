"use client";
import dynamic from "next/dynamic";
import { getTask } from "../../_tasks/registry";

const TaskLoading = () => (
  <main className="diagnosing-container">
    <div className="diagnosing-inner animate-fade-up">
      <div className="spinner" style={{ margin: "0 auto" }} />
    </div>
  </main>
);

const StimulusTask = dynamic(
  () => import("../../_shared/StimulusTask").then(m => m.StimulusTask),
  { loading: TaskLoading }
);
const DiagnosticChatTask = dynamic(
  () => import("../../_shared/DiagnosticChatTask").then(m => m.DiagnosticChatTask),
  { loading: TaskLoading }
);
const ExtendedWriteTask = dynamic(
  () => import("../../_shared/ExtendedWriteTask").then(m => m.ExtendedWriteTask),
  { loading: TaskLoading }
);
const OpinionChatTask = dynamic(
  () => import("../../_shared/OpinionChatTask").then(m => m.OpinionChatTask),
  { loading: TaskLoading }
);
const AdvisoryChatTask = dynamic(
  () => import("../../_shared/AdvisoryChatTask").then(m => m.AdvisoryChatTask),
  { loading: TaskLoading }
);

export function TaskRunner({ taskId }: { taskId: string }) {
  const task = getTask(taskId);

  if (!task) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Task not found</h1>
        <p>No task with id &quot;{taskId}&quot;.</p>
      </main>
    );
  }

  switch (task.kind) {
    case "stimulus":
      return <StimulusTask task={task} />;
    case "diagnostic-chat":
      return <DiagnosticChatTask task={task} />;
    case "extended-write":
      return <ExtendedWriteTask task={task} />;
    case "opinion-chat":
      return <OpinionChatTask task={task} />;
    case "advisory-chat":
      return <AdvisoryChatTask task={task} />;
    default:
      return (
        <main style={{ padding: 40 }}>
          <h1>{task.label}</h1>
          <p>Unknown task kind.</p>
        </main>
      );
  }
}
