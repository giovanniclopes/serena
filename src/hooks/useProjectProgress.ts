import { useMemo } from "react";
import { useTasks } from "../features/tasks/useTasks";
import type { Project } from "../types";

export interface ProjectProgress {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  nextTask?: {
    id: string;
    title: string;
    dueDate?: Date;
  };
}

export function useProjectProgress(projects: Project[]): ProjectProgress[] {
  const { tasks } = useTasks();

  return useMemo(() => {
    return projects.map((project) => {
      const projectTasks =
        tasks?.filter((task) => task.projectId === project.id) || [];
      const completedTasks = projectTasks.filter((task) => task.isCompleted);
      const totalTasks = projectTasks.length;
      const progressPercentage =
        totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

      // Encontrar a próxima tarefa pendente
      const nextTask = projectTasks
        .filter((task) => !task.isCompleted)
        .sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        })[0];

      return {
        projectId: project.id,
        totalTasks,
        completedTasks: completedTasks.length,
        progressPercentage: Math.round(progressPercentage),
        nextTask: nextTask
          ? {
              id: nextTask.id,
              title: nextTask.title,
              dueDate: nextTask.dueDate,
            }
          : undefined,
      };
    });
  }, [projects, tasks]);
}
