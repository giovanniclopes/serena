import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { startTaskTimer, stopTaskTimer } from "../services/apiTasks";
import type { Task, TimeEntry } from "../types";

export function useTaskTimer(task: Task) {
  const queryClient = useQueryClient();
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMutation = useMutation({
    mutationFn: startTaskTimer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Cronômetro iniciado!");
    },
    onError: (error) => {
      console.error("Erro ao iniciar cronômetro:", error);
      toast.error("Erro ao iniciar cronômetro. Tente novamente.");
    },
  });

  const stopMutation = useMutation({
    mutationFn: ({
      taskId,
      timeEntry,
    }: {
      taskId: string;
      timeEntry: TimeEntry;
    }) => stopTaskTimer(taskId, timeEntry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Cronômetro parado!");
      setElapsedTime(0);
    },
    onError: (error) => {
      console.error("Erro ao parar cronômetro:", error);
      toast.error("Erro ao parar cronômetro. Tente novamente.");
    },
  });

  useEffect(() => {
    if (task.isTimerRunning && task.currentSessionStart) {
      const startTime = new Date(task.currentSessionStart).getTime();

      const updateElapsedTime = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      };

      updateElapsedTime();
      intervalRef.current = setInterval(updateElapsedTime, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      setElapsedTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [task.isTimerRunning, task.currentSessionStart]);

  const handleStart = useCallback(() => {
    if (task.isTimerRunning) {
      toast.warning("Cronômetro já está rodando!");
      return;
    }
    startMutation.mutate(task.id);
  }, [task.id, task.isTimerRunning, startMutation]);

  const handleStop = useCallback(() => {
    if (!task.isTimerRunning || !task.currentSessionStart) {
      toast.warning("Cronômetro não está rodando!");
      return;
    }

    const endTime = new Date();
    const duration = elapsedTime;

    const timeEntry: TimeEntry = {
      id: crypto.randomUUID(),
      startedAt: new Date(task.currentSessionStart),
      endedAt: endTime,
      duration,
    };

    stopMutation.mutate({ taskId: task.id, timeEntry });
  }, [
    task.id,
    task.isTimerRunning,
    task.currentSessionStart,
    elapsedTime,
    stopMutation,
  ]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  const formatTotalTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  }, []);

  return {
    isRunning: task.isTimerRunning,
    elapsedTime,
    totalTimeSpent: task.totalTimeSpent,
    timeEntries: task.timeEntries,
    handleStart,
    handleStop,
    formatTime,
    formatTotalTime,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
  };
}
