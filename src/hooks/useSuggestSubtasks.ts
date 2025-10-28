import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suggestSubtasks } from "../services/aiTasks";
import { createSubtask } from "../services/apiSubtasks";

interface SuggestSubtasksParams {
  taskTitle: string;
  taskDescription?: string;
  taskId: string;
  workspaceId: string;
}

export function useSuggestSubtasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskTitle,
      taskDescription,
      taskId,
      workspaceId,
    }: SuggestSubtasksParams) => {
      const suggestions = await suggestSubtasks(taskTitle, taskDescription);

      if (taskId === "preview") {
        return suggestions;
      }

      const createPromises = suggestions.map(async (title, index) => {
        return createSubtask({
          title,
          description: undefined,
          projectId: undefined,
          parentTaskId: taskId,
          subtasks: [],
          dueDate: undefined,
          priority: "P3",
          reminders: [],
          tags: [],
          attachments: [],
          isCompleted: false,
          completedAt: undefined,
          workspaceId,
          order: index,
          timeEntries: [],
          totalTimeSpent: 0,
          isTimerRunning: false,
          currentSessionStart: undefined,
        });
      });

      const results = await Promise.all(createPromises);
      console.log("Subtarefas criadas:", results);
      return suggestions;
    },
    onSuccess: (suggestions, variables) => {
      if (variables.taskId !== "preview") {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", variables.taskId],
        });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        toast.success(`${suggestions.length} subtarefas sugeridas e criadas!`);
      } else {
        toast.success(`${suggestions.length} subtarefas sugeridas!`);
      }
    },
    onError: (error: Error) => {
      console.error("Erro ao sugerir subtarefas:", error);
      toast.error(
        error.message || "Falha ao gerar sugestões. Tente novamente."
      );
    },
  });
}
