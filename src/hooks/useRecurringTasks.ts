import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  listRecurringCompletions,
  setRecurringCompletion,
} from "../services/apiRecurringCompletions";
import {
  excludeRecurringInstance,
  listRecurringExclusions,
  removeRecurringExclusion,
} from "../services/apiRecurringExclusions";
import type { RecurringTaskCompletion, Task } from "../types";
import {
  getRecurringTaskCompletions,
  getRecurringTaskExclusions,
  getRecurringTaskInstancesForDate,
  getRecurringTaskInstancesForDateRange,
  isRecurringTaskInstanceCompleted,
  isRecurringTaskInstanceExcluded,
  markRecurringTaskInstanceComplete,
  markRecurringTaskInstanceExcluded,
  saveRecurringTaskCompletions,
  saveRecurringTaskExclusions,
} from "../utils/recurrenceUtils";

export function useRecurringTasks() {
  const [completions, setCompletions] = useState<RecurringTaskCompletion[]>([]);
  const [exclusions, setExclusions] = useState<
    Array<{ taskId: string; date: string }>
  >([]);
  const { user } = useAuth();
  const { state } = useApp();

  useEffect(() => {
    setCompletions(getRecurringTaskCompletions());
    setExclusions(getRecurringTaskExclusions());
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
            state.activeWorkspaceId,
          );
        }
      } catch (err) {
        console.error(
          "Erro ao sincronizar conclusão recorrente no servidor:",
          err,
        );
      }
    },
    [user, state.activeWorkspaceId],
  );

  const isInstanceCompleted = useCallback(
    (taskId: string, date: Date): boolean => {
      return isRecurringTaskInstanceCompleted(taskId, date);
    },
    [],
  );

  const getInstancesForDate = useCallback(
    (tasks: Task[], date: Date): Task[] => {
      return getRecurringTaskInstancesForDate(tasks, date);
    },
    [],
  );

  const getInstancesForDateRange = useCallback(
    (tasks: Task[], startDate: Date, endDate: Date) => {
      return getRecurringTaskInstancesForDateRange(tasks, startDate, endDate);
    },
    [],
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
    [user],
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
    [completions],
  );

  const excludeInstance = useCallback(
    async (taskId: string, date: Date, isExcluded: boolean = true) => {
      const dateKey = format(date, "yyyy-MM-dd");

      if (isExcluded) {
        markRecurringTaskInstanceExcluded(taskId, dateKey);
        setExclusions(getRecurringTaskExclusions());

        try {
          if (user && state.activeWorkspaceId) {
            await excludeRecurringInstance(
              taskId,
              dateKey,
              state.activeWorkspaceId,
            );
          }
        } catch (err) {
          console.error(
            "Erro ao sincronizar exclusão recorrente no servidor:",
            err,
          );
        }
      } else {
        const filtered = exclusions.filter(
          (e) => !(e.taskId === taskId && e.date === dateKey),
        );
        saveRecurringTaskExclusions(filtered);
        setExclusions(filtered);

        try {
          if (user && state.activeWorkspaceId) {
            await removeRecurringExclusion(
              taskId,
              dateKey,
              state.activeWorkspaceId,
            );
          }
        } catch (err) {
          console.error(
            "Erro ao sincronizar remoção de exclusão no servidor:",
            err,
          );
        }
      }
    },
    [user, state.activeWorkspaceId, exclusions],
  );

  const isInstanceExcluded = useCallback(
    (taskId: string, date: Date): boolean => {
      return isRecurringTaskInstanceExcluded(taskId, date);
    },
    [],
  );

  const syncExclusionsForRange = useCallback(
    async (taskIds: string[], startDate: Date, endDate: Date) => {
      try {
        if (!user) return;
        const start = format(startDate, "yyyy-MM-dd");
        const end = format(endDate, "yyyy-MM-dd");
        const serverRows = await listRecurringExclusions(taskIds, start, end);

        const local = getRecurringTaskExclusions();
        const serverMapped: Array<{ taskId: string; date: string }> =
          serverRows.map((r) => ({
            taskId: r.task_id,
            date: r.excluded_date,
          }));

        const key = (e: { taskId: string; date: string }) =>
          `${e.taskId}|${e.date}`;
        const mergedMap = new Map<string, { taskId: string; date: string }>();
        for (const e of local) mergedMap.set(key(e), e);
        for (const e of serverMapped) mergedMap.set(key(e), e);
        const merged = Array.from(mergedMap.values());
        saveRecurringTaskExclusions(merged);
        setExclusions(merged);
      } catch (err) {
        console.error("Erro ao sincronizar exclusões do servidor:", err);
      }
    },
    [user],
  );

  const clearAllExclusions = useCallback(() => {
    saveRecurringTaskExclusions([]);
    setExclusions([]);
  }, []);

  const clearTaskExclusions = useCallback(
    (taskId: string) => {
      const filtered = exclusions.filter((e) => e.taskId !== taskId);
      saveRecurringTaskExclusions(filtered);
      setExclusions(filtered);
    },
    [exclusions],
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
    exclusions,
    excludeInstance,
    isInstanceExcluded,
    syncExclusionsForRange,
    clearAllExclusions,
    clearTaskExclusions,
  };
}
