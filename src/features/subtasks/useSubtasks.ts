import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  completeSubtask,
  createSubtask,
  deleteSubtask,
  getSubtasks,
  updateSubtask,
} from "../../services/apiSubtasks";

export function useSubtasks(taskId: string) {
  const {
    data: subtasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subtasks", taskId],
    queryFn: () => getSubtasks(taskId),
    enabled: !!taskId,
  });

  return { subtasks, isLoading, error };
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubtask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.parentTaskId],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Subtarefa criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar subtarefa:", error);
      toast.error("Erro ao criar subtarefa. Tente novamente.");
    },
  });
}

export function useUpdateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubtask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subtasks", variables.parentTaskId],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Subtarefa atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar subtarefa:", error);
      toast.error("Erro ao atualizar subtarefa. Tente novamente.");
    },
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubtask,
    onSuccess: (_, subtaskId) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Subtarefa excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir subtarefa:", error);
      toast.error("Erro ao excluir subtarefa. Tente novamente.");
    },
  });
}

export function useCompleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeSubtask,
    onSuccess: (_, subtaskId) => {
      queryClient.invalidateQueries({ queryKey: ["subtasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Subtarefa concluída!");
    },
    onError: (error) => {
      console.error("Erro ao completar subtarefa:", error);
      toast.error("Erro ao completar subtarefa. Tente novamente.");
    },
  });
}
