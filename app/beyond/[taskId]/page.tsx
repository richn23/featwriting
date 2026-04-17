"use client";
import { useParams } from "next/navigation";
import { SCENARIO_TASKS } from "../../_shared/scenario-tasks-data";
import { ScenarioTask } from "../../_shared/ScenarioTask";

export default function BeyondTaskPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = params?.taskId ?? "";
  const task = SCENARIO_TASKS[taskId];

  if (!task) {
    return (
      <main style={{ padding: 40, color: "#e6edf3", background: "#0d1117", minHeight: "100vh" }}>
        <h1>Task not found</h1>
        <p>No scenario task with id &quot;{taskId}&quot;.</p>
        <a href="/writing" style={{ color: "#34d399" }}>Back to FEAT</a>
      </main>
    );
  }

  return <ScenarioTask task={task} />;
}
