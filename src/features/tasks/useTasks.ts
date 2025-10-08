import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  completeAllTasks,
  completeTask,
  createTask,
  deleteTask,
  getTasks,
  uncompleteTask,
  updateTask,
} from "../../services/apiTasks";

export function useTasks() {
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  return { tasks: tasks || [], isLoading, error };
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar tarefa:", error);
      toast.error("Erro ao criar tarefa. Tente novamente.");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa atualizada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar tarefa:", error);

      if (
        error?.message?.includes("subtasks") ||
        error?.message?.includes("pendentes") ||
        error?.message?.includes("pending") ||
        error?.code === "P0001"
      ) {
        toast.error("Ação Bloqueada", {
          description:
            error.message ||
            "Não é possível concluir uma tarefa que possui subtarefas pendentes. Complete todas as subtarefas primeiro.",
          duration: 5000,
        });
      } else {
        toast.error("Erro ao atualizar tarefa. Tente novamente.");
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir tarefa:", error);
      toast.error("Erro ao excluir tarefa. Tente novamente.");
    },
  });
}

export function useBulkDeleteTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      const deletePromises = taskIds.map((taskId) => deleteTask(taskId));
      await Promise.all(deletePromises);
      return taskIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        `${count} tarefa${count !== 1 ? "s" : ""} excluída${
          count !== 1 ? "s" : ""
        } com sucesso!`
      );
    },
    onError: (error) => {
      console.error("Erro ao excluir tarefas:", error);
      toast.error("Erro ao excluir tarefas. Tente novamente.");
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa concluída com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao completar tarefa:", error);

      if (
        error?.message?.includes("subtasks") ||
        error?.message?.includes("pendentes") ||
        error?.message?.includes("pending") ||
        error?.code === "P0001"
      ) {
        toast.error("Ação Bloqueada", {
          description:
            error.message ||
            "Não é possível concluir uma tarefa que possui subtarefas pendentes. Complete todas as subtarefas primeiro.",
          duration: 5000,
        });
      } else {
        toast.error("Erro ao concluir tarefa. Tente novamente.");
      }
    },
  });
}

export function useUncompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uncompleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa marcada como não concluída!");
    },
    onError: (error: any) => {
      console.error("Erro ao desmarcar tarefa como concluída:", error);
      toast.error("Erro ao desmarcar tarefa. Tente novamente.");
    },
  });
}

export function useCompleteAllTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeAllTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Todas as tarefas foram concluídas com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao completar todas as tarefas:", error);
      toast.error("Erro ao concluir todas as tarefas. Tente novamente.");
    },
  });
}
