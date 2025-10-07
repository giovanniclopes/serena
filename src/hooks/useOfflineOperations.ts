import { useCallback } from "react";
import { toast } from "sonner";
import type { Countdown, Habit, Project, Task } from "../types";
import { useOfflineMode } from "./useOfflineMode";

export function useOfflineOperations() {
  const { isOnline, addPendingAction, getOfflineData, setOfflineData } =
    useOfflineMode();

  const createTaskOffline = useCallback(
    (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      if (isOnline) {
        // Se estiver online, executar normalmente
        return { shouldExecute: true, data: taskData };
      }

      // Se estiver offline, adicionar à fila
      addPendingAction({
        type: "CREATE",
        entity: "task",
        data: taskData,
      });

      toast.info(
        "Tarefa criada offline. Será sincronizada quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: taskData };
    },
    [isOnline, addPendingAction]
  );

  const updateTaskOffline = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      if (isOnline) {
        return { shouldExecute: true, data: { taskId, updates } };
      }

      addPendingAction({
        type: "UPDATE",
        entity: "task",
        data: { taskId, updates },
      });

      toast.info(
        "Tarefa atualizada offline. Será sincronizada quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: { taskId, updates } };
    },
    [isOnline, addPendingAction]
  );

  const deleteTaskOffline = useCallback(
    (taskId: string) => {
      if (isOnline) {
        return { shouldExecute: true, data: { taskId } };
      }

      addPendingAction({
        type: "DELETE",
        entity: "task",
        data: { taskId },
      });

      toast.info(
        "Tarefa removida offline. Será sincronizada quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: { taskId } };
    },
    [isOnline, addPendingAction]
  );

  const createProjectOffline = useCallback(
    (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
      if (isOnline) {
        return { shouldExecute: true, data: projectData };
      }

      addPendingAction({
        type: "CREATE",
        entity: "project",
        data: projectData,
      });

      toast.info(
        "Projeto criado offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: projectData };
    },
    [isOnline, addPendingAction]
  );

  const updateProjectOffline = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      if (isOnline) {
        return { shouldExecute: true, data: { projectId, updates } };
      }

      addPendingAction({
        type: "UPDATE",
        entity: "project",
        data: { projectId, updates },
      });

      toast.info(
        "Projeto atualizado offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: { projectId, updates } };
    },
    [isOnline, addPendingAction]
  );

  const deleteProjectOffline = useCallback(
    (projectId: string) => {
      if (isOnline) {
        return { shouldExecute: true, data: { projectId } };
      }

      addPendingAction({
        type: "DELETE",
        entity: "project",
        data: { projectId },
      });

      toast.info(
        "Projeto removido offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: { projectId } };
    },
    [isOnline, addPendingAction]
  );

  const createHabitOffline = useCallback(
    (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
      if (isOnline) {
        return { shouldExecute: true, data: habitData };
      }

      addPendingAction({
        type: "CREATE",
        entity: "habit",
        data: habitData,
      });

      toast.info(
        "Hábito criado offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: habitData };
    },
    [isOnline, addPendingAction]
  );

  const updateHabitOffline = useCallback(
    (habitId: string, updates: Partial<Habit>) => {
      if (isOnline) {
        return { shouldExecute: true, data: { habitId, updates } };
      }

      addPendingAction({
        type: "UPDATE",
        entity: "habit",
        data: { habitId, updates },
      });

      toast.info(
        "Hábito atualizado offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: { habitId, updates } };
    },
    [isOnline, addPendingAction]
  );

  const deleteHabitOffline = useCallback(
    (habitId: string) => {
      if (isOnline) {
        return { shouldExecute: true, data: { habitId } };
      }

      addPendingAction({
        type: "DELETE",
        entity: "habit",
        data: { habitId },
      });

      toast.info(
        "Hábito removido offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: { habitId } };
    },
    [isOnline, addPendingAction]
  );

  const createCountdownOffline = useCallback(
    (countdownData: Omit<Countdown, "id" | "createdAt" | "updatedAt">) => {
      if (isOnline) {
        return { shouldExecute: true, data: countdownData };
      }

      addPendingAction({
        type: "CREATE",
        entity: "countdown",
        data: countdownData,
      });

      toast.info(
        "Contador criado offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: countdownData };
    },
    [isOnline, addPendingAction]
  );

  const updateCountdownOffline = useCallback(
    (countdownId: string, updates: Partial<Countdown>) => {
      if (isOnline) {
        return { shouldExecute: true, data: { countdownId, updates } };
      }

      addPendingAction({
        type: "UPDATE",
        entity: "countdown",
        data: { countdownId, updates },
      });

      toast.info(
        "Contador atualizado offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: { countdownId, updates } };
    },
    [isOnline, addPendingAction]
  );

  const deleteCountdownOffline = useCallback(
    (countdownId: string) => {
      if (isOnline) {
        return { shouldExecute: true, data: { countdownId } };
      }

      addPendingAction({
        type: "DELETE",
        entity: "countdown",
        data: { countdownId },
      });

      toast.info(
        "Contador removido offline. Será sincronizado quando a conexão for restaurada.",
        {
          duration: 4000,
        }
      );

      return { shouldExecute: false, data: { countdownId } };
    },
    [isOnline, addPendingAction]
  );

  // Funções para cache local
  const cacheData = useCallback(
    (key: string, data: unknown) => {
      setOfflineData(key, {
        data,
        timestamp: Date.now(),
      });
    },
    [setOfflineData]
  );

  const getCachedData = useCallback(
    (key: string, maxAge: number = 5 * 60 * 1000) => {
      const cached = getOfflineData(key);
      if (!cached) return null;

      const age = Date.now() - cached.timestamp;
      if (age > maxAge) {
        return null; // Cache expirado
      }

      return cached.data;
    },
    [getOfflineData]
  );

  return {
    // Tarefas
    createTaskOffline,
    updateTaskOffline,
    deleteTaskOffline,

    // Projetos
    createProjectOffline,
    updateProjectOffline,
    deleteProjectOffline,

    // Hábitos
    createHabitOffline,
    updateHabitOffline,
    deleteHabitOffline,

    // Contadores
    createCountdownOffline,
    updateCountdownOffline,
    deleteCountdownOffline,

    // Cache
    cacheData,
    getCachedData,
  };
}
