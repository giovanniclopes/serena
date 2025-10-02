import { CheckCircle2, Folder, Target } from "lucide-react";
import { useState } from "react";
import FloatingActionButton from "../components/FloatingActionButton";
import ProjectModal from "../components/ProjectModal";
import { useApp } from "../context/AppContext";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "../features/projects/useProjects";
import type { Project } from "../types";

export default function Projects() {
  const { state } = useApp();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const activeWorkspaceId = state.activeWorkspaceId;

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">,
    templateId?: string
  ) => {
    if (!activeWorkspaceId) return;

    if (editingProject) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        updates: projectData,
      });
    } else {
      createProjectMutation.mutate({
        project: {
          ...projectData,
          workspaceId: activeWorkspaceId,
        },
        templateId,
      });
    }
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (
      window.confirm(
        "Tem a certeza que quer apagar este projeto e todas as suas tarefas?"
      )
    ) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const filteredProjects = Array.isArray(projects)
    ? projects.filter((p: Project) => p.workspaceId === activeWorkspaceId)
    : [];

  if (isLoadingProjects) {
    return <div className="text-center p-4">A carregar projetos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark-gray">Projetos</h1>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project: Project) => {
            const completionPercentage =
              project.tasksTotalCount > 0
                ? Math.round(
                    (project.tasksCompletedCount / project.tasksTotalCount) *
                      100
                  )
                : 0;

            return (
              <div
                key={project.id}
                className="p-4 bg-ice-white border border-light-gray rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: project.color || "#ec4899" }}
                  >
                    <Folder size={16} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-dark-gray font-nunito">
                      {project.name}
                    </h2>
                    {project.description && (
                      <p className="text-medium-gray text-sm font-nunito">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                {project.tasksTotalCount > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-medium-gray" />
                        <span className="text-sm text-medium-gray font-nunito">
                          {project.tasksCompletedCount}/
                          {project.tasksTotalCount} tarefas
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-dark-gray font-nunito">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${completionPercentage}%`,
                          backgroundColor: project.color || "#ec4899",
                        }}
                      />
                    </div>

                    {completionPercentage === 100 && (
                      <div className="flex items-center gap-2 mt-4 text-peach-pink">
                        <CheckCircle2 className="w-4 h-4" />
                        <p className="text-sm font-semibold font-nunito">
                          Projeto concluído!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="text-sm text-dark-gray border border-gray-500 rounded-lg px-2 py-1 hover:underline"
                    style={{
                      color: state.currentTheme.colors.text,
                      opacity: deleteProjectMutation.isPending ? 0.5 : 1,
                    }}
                    disabled={deleteProjectMutation.isPending}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deleteProjectMutation.isPending}
                    className="text-sm text-red-500 border border-red-500 rounded-lg px-2 py-1 hover:underline disabled:opacity-50"
                    style={{
                      backgroundColor: state.currentTheme.colors.error + "10",
                      color: state.currentTheme.colors.error,
                      opacity: deleteProjectMutation.isPending ? 0.5 : 1,
                    }}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="text-center py-8 rounded-lg"
          style={{ backgroundColor: state.currentTheme.colors.surface }}
        >
          <div
            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "20",
            }}
          >
            <Folder
              className="w-6 h-6"
              style={{ color: state.currentTheme.colors.primary }}
            />
          </div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: state.currentTheme.colors.text }}
          >
            Nenhum projeto criado
          </h3>
          <p
            className="text-sm mb-3"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Crie projetos para organizar suas tarefas
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            Criar Primeiro Projeto
          </button>
        </div>
      )}

      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
          project={editingProject || undefined}
          workspaceId={activeWorkspaceId}
        />
      )}

      <FloatingActionButton
        onClick={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
      />
    </div>
  );
}
