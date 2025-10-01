import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createHabit,
  createHabitEntry,
  deleteHabit,
  getHabitEntries,
  getHabits,
  updateHabit,
  updateHabitEntry,
} from "../../services/apiHabits";

export function useHabits() {
  const {
    data: habits,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["habits"],
    queryFn: getHabits,
  });

  return { habits: habits || [], isLoading, error };
}

export function useHabitEntries() {
  const {
    data: entries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["habitEntries"],
    queryFn: getHabitEntries,
  });

  return { entries: entries || [], isLoading, error };
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Hábito criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar hábito:", error);
      toast.error("Erro ao criar hábito. Tente novamente.");
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Hábito atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar hábito:", error);
      toast.error("Erro ao atualizar hábito. Tente novamente.");
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habitEntries"] });
      toast.success("Hábito excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir hábito:", error);
      toast.error("Erro ao excluir hábito. Tente novamente.");
    },
  });
}

export function useCreateHabitEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHabitEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitEntries"] });
      toast.success("Entrada de hábito registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar entrada de hábito:", error);
      toast.error("Erro ao registrar entrada de hábito. Tente novamente.");
    },
  });
}

export function useUpdateHabitEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHabitEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitEntries"] });
      toast.success("Entrada de hábito atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar entrada de hábito:", error);
      toast.error("Erro ao atualizar entrada de hábito. Tente novamente.");
    },
  });
}
