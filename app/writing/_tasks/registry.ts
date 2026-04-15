import type { TaskDefinition } from "./types";
import { task01 } from "./task-01";
import { task02 } from "./task-02";
import { task03 } from "./task-03";
import { task04 } from "./task-04";
import { task05 } from "./task-05";

export const TASKS: Record<string, TaskDefinition> = {
  "01": task01,
  "02": task02,
  "03": task03,
  "04": task04,
  "05": task05,
};

export function getTask(id: string): TaskDefinition | null {
  return TASKS[id] ?? null;
}
