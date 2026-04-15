"use client";
import { useParams } from "next/navigation";
import { getTask } from "../../_tasks/registry";
import { StimulusTask } from "../../_shared/StimulusTask";
import { DiagnosticChatTask } from "../../_shared/DiagnosticChatTask";
import { ExtendedWriteTask } from "../../_shared/ExtendedWriteTask";
import { OpinionChatTask } from "../../_shared/OpinionChatTask";
import { AdvisoryChatTask } from "../../_shared/AdvisoryChatTask";

export default function TaskPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = params?.taskId ?? "";
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
