import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../../services/apiProjects";
import type { Project } from "../../types";

export function useProjects() {
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return { projects, isLoading, error };
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      project,
    }: {
      project: Omit<Project, "id" | "createdAt" | "updatedAt">;
      templateId?: string;
    }) => {
      const createdProject = await createProject(project);
      return createdProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projeto criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar projeto:", error);
      toast.error("Erro ao criar projeto. Tente novamente.");
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) =>
      updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projeto atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar projeto:", error);
      toast.error("Erro ao atualizar projeto. Tente novamente.");
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projeto excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir projeto:", error);
      toast.error("Erro ao excluir projeto. Tente novamente.");
    },
  });
}
