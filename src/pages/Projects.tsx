import { Folder } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import FilterControls from "../components/FilterControls";
import FloatingActionButton from "../components/FloatingActionButton";
import GoalModal from "../components/GoalModal";
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
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [viewingGoalsProject, setViewingGoalsProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleOpenGoalsModal = (project: Project) => {
    setViewingGoalsProject(project);
    setIsGoalModalOpen(true);
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
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete);
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
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
              onViewGoals={handleOpenGoalsModal}
              isDeleting={deleteProjectMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Folder}
          title={
            searchQuery
              ? "Nenhum projeto encontrado"
              : showCompleted
              ? "Nenhum projeto concluído"
              : "Nenhum projeto criado"
          }
          description={
            searchQuery
              ? "Tente ajustar sua busca ou filtros para encontrar o que procura."
              : showCompleted
              ? "Você ainda não concluiu nenhum projeto. Continue trabalhando!"
              : "Crie projetos para organizar suas tarefas e acompanhar seu progresso de forma mais eficiente."
          }
          actionLabel={
            searchQuery ? undefined : showCompleted ? undefined : "Criar Primeiro Projeto"
          }
          onAction={searchQuery || showCompleted ? undefined : handleOpenCreateModal}
        />
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

      {isGoalModalOpen && (
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => {
            setIsGoalModalOpen(false);
            setViewingGoalsProject(null);
          }}
          project={viewingGoalsProject}
        />
      )}

      <FloatingActionButton
        onClick={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        title="Excluir Projeto"
        message="Tem certeza que deseja excluir este projeto? Todas as tarefas associadas também serão excluídas. Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
}
