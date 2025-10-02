import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProjectFromTemplate,
  getTemplateById,
} from "../../constants/projectTemplates";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "../../services/apiProjects";
import { createTask } from "../../services/apiTasks";
import type { Project } from "../../types";

export function useProjects() {
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  return { projects, isLoading, error };
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      project,
      templateId,
    }: {
      project: Omit<Project, "id" | "createdAt" | "updatedAt">;
      templateId?: string;
    }) => {
      const createdProject = await createProject(project);

      // Se um template foi selecionado, criar as tarefas padrão
      if (templateId) {
        const template = getTemplateById(templateId);
        if (template) {
          const { tasks } = createProjectFromTemplate(
            template,
            project.workspaceId
          );

          // Criar as tarefas do template
          for (const taskTemplate of tasks) {
            try {
              await createTask({
                ...taskTemplate,
                projectId: createdProject.id,
              });
            } catch (error) {
              console.error("Erro ao criar tarefa do template:", error);
            }
          }
        }
      }

      return createdProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
