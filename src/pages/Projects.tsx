import { CheckCircle2, Eye, Folder, Target } from "lucide-react";
import { useState } from "react";
import FilterControls from "../components/FilterControls";
import FloatingActionButton from "../components/FloatingActionButton";
import ProjectModal from "../components/ProjectModal";
import ProjectTasksModal from "../components/ProjectTasksModal";
import {
  ProjectGridSkeleton,
  ProjectListSkeleton,
} from "../components/skeletons/ProjectSkeleton";
import StandardCard from "../components/StandardCard";
import { useApp } from "../context/AppContext";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "../features/projects/useProjects";
import { useSkeletonLoading } from "../hooks/useSkeletonLoading";
import type { Project } from "../types";
import { filterProjects, searchProjects } from "../utils";

export default function Projects() {
  const { state } = useApp();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { showSkeleton } = useSkeletonLoading(isLoadingProjects);
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProjectTasksModalOpen, setIsProjectTasksModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const activeWorkspaceId = state.activeWorkspaceId;

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleOpenViewModal = (project: Project) => {
    setViewingProject(project);
    setIsProjectTasksModalOpen(true);
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

  const workspaceProjects = Array.isArray(projects)
    ? projects.filter((p: Project) => p.workspaceId === activeWorkspaceId)
    : [];

  const filteredProjects = filterProjects(
    searchProjects(workspaceProjects, searchQuery),
    showCompleted
  );

  if (showSkeleton) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        {viewMode === "grid" ? (
          <ProjectGridSkeleton count={6} />
        ) : (
          <ProjectListSkeleton count={4} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: state.currentTheme.colors.text }}
        >
          Projetos
        </h1>
      </div>

      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        searchPlaceholder="Buscar projetos..."
        showCompletedLabel="Mostrar concluídos"
      />

      {filteredProjects.length > 0 ? (
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }`}
        >
          {filteredProjects.map((project: Project) => {
            const completionPercentage =
              project.tasksTotalCount > 0
                ? Math.round(
                    (project.tasksCompletedCount / project.tasksTotalCount) *
                      100
                  )
                : 0;

            return (
              <StandardCard key={project.id} color={project.color}>
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{
                      backgroundColor:
                        project.color || state.currentTheme.colors.primary,
                      background: `linear-gradient(135deg, ${
                        project.color || state.currentTheme.colors.primary
                      }, ${
                        project.color || state.currentTheme.colors.primary
                      }dd)`,
                    }}
                  >
                    <Folder size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2
                      className="font-bold text-lg mb-1 truncate"
                      style={{ color: state.currentTheme.colors.text }}
                    >
                      {project.name}
                    </h2>
                    {project.description && (
                      <p
                        className="text-sm leading-relaxed line-clamp-2"
                        style={{
                          color: state.currentTheme.colors.textSecondary,
                        }}
                      >
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                {project.tasksTotalCount > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor:
                              (project.color ||
                                state.currentTheme.colors.primary) + "20",
                          }}
                        >
                          <Target
                            size={12}
                            style={{
                              color:
                                project.color ||
                                state.currentTheme.colors.primary,
                            }}
                          />
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {project.tasksCompletedCount}/
                          {project.tasksTotalCount} tarefas
                        </span>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor:
                            (project.color ||
                              state.currentTheme.colors.primary) + "20",
                          color:
                            project.color || state.currentTheme.colors.primary,
                        }}
                      >
                        {completionPercentage}%
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        className="w-full rounded-full h-3 overflow-hidden"
                        style={{
                          backgroundColor:
                            state.currentTheme.colors.border + "40",
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out relative"
                          style={{
                            width: `${completionPercentage}%`,
                            background: `linear-gradient(90deg, ${
                              project.color || state.currentTheme.colors.primary
                            }, ${
                              project.color || state.currentTheme.colors.primary
                            }cc)`,
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-full opacity-30"
                            style={{
                              background:
                                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                              animation: "shimmer 2s infinite",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {completionPercentage === 100 && (
                      <div
                        className="flex items-center gap-2 mt-4 p-3 rounded-xl"
                        style={{
                          backgroundColor:
                            state.currentTheme.colors.success + "15",
                        }}
                      >
                        <CheckCircle2
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: state.currentTheme.colors.success }}
                        />
                        <p
                          className="text-sm font-semibold"
                          style={{ color: state.currentTheme.colors.success }}
                        >
                          Projeto concluído! 🎉
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenViewModal(project)}
                    className="flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: state.currentTheme.colors.primary + "10",
                      color: state.currentTheme.colors.primary,
                      border: `1px solid ${state.currentTheme.colors.primary}30`,
                      opacity: deleteProjectMutation.isPending ? 0.5 : 1,
                    }}
                    disabled={deleteProjectMutation.isPending}
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Visualizar
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: state.currentTheme.colors.background,
                      color: state.currentTheme.colors.text,
                      border: `1px solid ${state.currentTheme.colors.border}`,
                      opacity: deleteProjectMutation.isPending ? 0.5 : 1,
                    }}
                    disabled={deleteProjectMutation.isPending}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deleteProjectMutation.isPending}
                    className="flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{
                      backgroundColor: state.currentTheme.colors.error + "10",
                      color: state.currentTheme.colors.error,
                      border: `1px solid ${state.currentTheme.colors.error}30`,
                    }}
                  >
                    🗑️ Apagar
                  </button>
                </div>
              </StandardCard>
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

      {isProjectTasksModalOpen && (
        <ProjectTasksModal
          isOpen={isProjectTasksModalOpen}
          onClose={() => setIsProjectTasksModalOpen(false)}
          project={viewingProject}
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
