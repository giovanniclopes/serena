import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  listRecurringCompletions,
  setRecurringCompletion,
} from "../services/apiRecurringCompletions";
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
  const { user } = useAuth();
  const { state } = useApp();

  useEffect(() => {
    setCompletions(getRecurringTaskCompletions());
  }, []);

  const markInstanceComplete = useCallback(
    async (taskId: string, date: Date, isCompleted: boolean = true) => {
      markRecurringTaskInstanceComplete(taskId, date, isCompleted);
      setCompletions(getRecurringTaskCompletions());

      try {
        if (user && state.activeWorkspaceId) {
          const instanceDate = format(date, "yyyy-MM-dd");
          await setRecurringCompletion(
            taskId,
            instanceDate,
            isCompleted,
            state.activeWorkspaceId
          );
        }
      } catch (err) {
        console.error(
          "Erro ao sincronizar conclusão recorrente no servidor:",
          err
        );
      }
    },
    [user, state.activeWorkspaceId]
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

  const syncCompletionsForRange = useCallback(
    async (taskIds: string[], startDate: Date, endDate: Date) => {
      try {
        if (!user) return;
        const start = format(startDate, "yyyy-MM-dd");
        const end = format(endDate, "yyyy-MM-dd");
        const serverRows = await listRecurringCompletions(taskIds, start, end);

        const local = getRecurringTaskCompletions();
        const serverMapped: RecurringTaskCompletion[] = serverRows.map((r) => ({
          taskId: r.task_id,
          date: r.instance_date,
          isCompleted: !!r.is_completed,
          completedAt: r.completed_at ? new Date(r.completed_at) : undefined,
        }));

        const key = (c: RecurringTaskCompletion) => `${c.taskId}|${c.date}`;
        const mergedMap = new Map<string, RecurringTaskCompletion>();
        for (const c of local) mergedMap.set(key(c), c);
        for (const c of serverMapped) mergedMap.set(key(c), c);
        const merged = Array.from(mergedMap.values());
        saveRecurringTaskCompletions(merged);
        setCompletions(merged);
      } catch (err) {
        console.error("Erro ao sincronizar conclusões do servidor:", err);
      }
    },
    [user]
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
    syncCompletionsForRange,
    clearAllCompletions,
    clearTaskCompletions,
  };
}
