import { Folder } from "lucide-react";
import { useState } from "react";
import FilterControls from "../components/FilterControls";
import FloatingActionButton from "../components/FloatingActionButton";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import ProjectTasksModal from "../components/ProjectTasksModal";
import {
  ProjectGridSkeleton,
  ProjectListSkeleton,
} from "../components/skeletons/ProjectSkeleton";
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
              : "space-y-3"
          }`}
        >
          {filteredProjects.map((project: Project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProject}
              onView={handleOpenViewModal}
              isDeleting={deleteProjectMutation.isPending}
            />
          ))}
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
