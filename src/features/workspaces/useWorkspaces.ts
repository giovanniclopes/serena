import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaces,
  updateWorkspace,
} from "../../services/apiWorkspaces";
import type { Workspace } from "../../types";

export function useWorkspaces() {
  const {
    data: workspaces,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });

  return { workspaces, isLoading, error };
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar workspace:", error);
      toast.error("Erro ao criar workspace. Tente novamente.");
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Workspace>;
    }) => updateWorkspace(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar workspace:", error);
      toast.error("Erro ao atualizar workspace. Tente novamente.");
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Workspace excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir workspace:", error);
      toast.error("Erro ao excluir workspace. Tente novamente.");
    },
  });
}
