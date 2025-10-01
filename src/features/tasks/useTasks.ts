import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  completeAllTasks,
  completeTask,
  createTask,
  deleteTask,
  getTasks,
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
    onError: (error) => {
      console.error("Erro ao atualizar tarefa:", error);
      toast.error("Erro ao atualizar tarefa. Tente novamente.");
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

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa concluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao completar tarefa:", error);
      toast.error("Erro ao concluir tarefa. Tente novamente.");
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
