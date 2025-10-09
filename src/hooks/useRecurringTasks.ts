import { useCallback, useEffect, useState } from "react";
import type { RecurringTaskCompletion, Task } from "../types";
import {
  getRecurringTaskCompletions,
  getRecurringTaskInstancesForDate,
  getRecurringTaskInstancesForDateRange,
  isRecurringTaskInstanceCompleted,
  markRecurringTaskInstanceComplete,
  saveRecurringTaskCompletions,
} from "../utils/recurrenceUtils";

export function useRecurringTasks() {
  const [completions, setCompletions] = useState<RecurringTaskCompletion[]>([]);

  useEffect(() => {
    setCompletions(getRecurringTaskCompletions());
  }, []);

  const markInstanceComplete = useCallback(
    (taskId: string, date: Date, isCompleted: boolean = true) => {
      markRecurringTaskInstanceComplete(taskId, date, isCompleted);
      setCompletions(getRecurringTaskCompletions());
    },
    []
  );

  const isInstanceCompleted = useCallback(
    (taskId: string, date: Date): boolean => {
      return isRecurringTaskInstanceCompleted(taskId, date);
    },
    []
  );

  const getInstancesForDate = useCallback(
    (tasks: Task[], date: Date): Task[] => {
      return getRecurringTaskInstancesForDate(tasks, date);
    },
    []
  );

  const getInstancesForDateRange = useCallback(
    (tasks: Task[], startDate: Date, endDate: Date) => {
      return getRecurringTaskInstancesForDateRange(tasks, startDate, endDate);
    },
    []
  );

  const clearAllCompletions = useCallback(() => {
    saveRecurringTaskCompletions([]);
    setCompletions([]);
  }, []);

  const clearTaskCompletions = useCallback(
    (taskId: string) => {
      const filtered = completions.filter((c) => c.taskId !== taskId);
      saveRecurringTaskCompletions(filtered);
      setCompletions(filtered);
    },
    [completions]
  );

  return {
    completions,
    markInstanceComplete,
    isInstanceCompleted,
    getInstancesForDate,
    getInstancesForDateRange,
    clearAllCompletions,
    clearTaskCompletions,
  };
}
