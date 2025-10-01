import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCountdown,
  deleteCountdown,
  getCountdowns,
  updateCountdown,
} from "../../services/apiCountdowns";

export function useCountdowns() {
  const {
    data: countdowns,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["countdowns"],
    queryFn: getCountdowns,
  });

  return { countdowns: countdowns || [], isLoading, error };
}

export function useCreateCountdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCountdown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countdowns"] });
    },
    onError: (error) => {
      console.error("Erro ao criar contagem regressiva:", error);
    },
  });
}

export function useUpdateCountdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCountdown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countdowns"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar contagem regressiva:", error);
    },
  });
}

export function useDeleteCountdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCountdown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countdowns"] });
    },
    onError: (error) => {
      console.error("Erro ao excluir contagem regressiva:", error);
    },
  });
}
