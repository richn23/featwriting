import { TaskRunner } from "./TaskRunner";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <TaskRunner taskId={taskId} />;
}
