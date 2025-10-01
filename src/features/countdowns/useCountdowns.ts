import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      toast.success("Contagem regressiva criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar contagem regressiva:", error);
      toast.error("Erro ao criar contagem regressiva. Tente novamente.");
    },
  });
}

export function useUpdateCountdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCountdown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countdowns"] });
      toast.success("Contagem regressiva atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar contagem regressiva:", error);
      toast.error("Erro ao atualizar contagem regressiva. Tente novamente.");
    },
  });
}

export function useDeleteCountdown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCountdown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countdowns"] });
      toast.success("Contagem regressiva excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir contagem regressiva:", error);
      toast.error("Erro ao excluir contagem regressiva. Tente novamente.");
    },
  });
}
