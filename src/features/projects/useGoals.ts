import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  completeGoal,
  createGoal,
  deleteGoal,
  getGoals,
  uncompleteGoal,
  updateGoal,
} from "../../services/apiGoals";
import type { ProjectGoal } from "../../types";

export function useGoals(projectId?: string) {
  const {
    data: goals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["goals", projectId],
    queryFn: () => getGoals(projectId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return { goals, isLoading, error };
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goal: Omit<ProjectGoal, "id" | "createdAt" | "updatedAt">) =>
      createGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar meta:", error);
      toast.error("Erro ao criar meta. Tente novamente.");
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ProjectGoal>;
    }) => updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar meta:", error);
      toast.error("Erro ao atualizar meta. Tente novamente.");
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir meta:", error);
      toast.error("Erro ao excluir meta. Tente novamente.");
    },
  });
}

export function useCompleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta concluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao concluir meta:", error);
      toast.error("Erro ao concluir meta. Tente novamente.");
    },
  });
}

export function useUncompleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uncompleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta reaberta com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao reabrir meta:", error);
      toast.error("Erro ao reabrir meta. Tente novamente.");
    },
  });
}

