import { Folder, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ProjectModal from "../components/ProjectModal";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "../features/projects/useProjects";
import { useWorkspaces } from "../features/workspaces/useWorkspaces";
import type { Project } from "../types";

export default function Projects() {
  const { workspaces } = useWorkspaces();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspaceId) {
      const defaultWorkspace =
        workspaces.find((w) => w.isDefault) || workspaces[0];
      setActiveWorkspaceId(defaultWorkspace.id);
    }
  }, [workspaces, activeWorkspaceId]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!activeWorkspaceId) return;

    if (editingProject) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        updates: projectData,
      });
    } else {
      createProjectMutation.mutate({
        ...projectData,
        workspaceId: activeWorkspaceId,
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

  if (isLoadingProjects) {
    return <div className="text-center p-4">A carregar projetos...</div>;
  }

  const filteredProjects =
    projects?.filter((p) => p.workspaceId === activeWorkspaceId) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark-gray">Projetos</h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-peach-pink text-dark-gray rounded-md hover:bg-opacity-80 transition-colors"
        >
          <Plus size={20} />
          Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project: Project) => (
          <div
            key={project.id}
            className="p-4 bg-ice-white border border-light-gray rounded-md shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <Folder size={20} className="text-medium-gray" />
              <h2 className="font-bold text-dark-gray">{project.name}</h2>
            </div>
            <p className="text-medium-gray text-sm mb-4">
              {project.description}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenEditModal(project)}
                className="text-sm text-dark-gray hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteProject(project.id)}
                disabled={deleteProjectMutation.isPending}
                className="text-sm text-red-500 hover:underline disabled:opacity-50"
              >
                Apagar
              </button>
            </div>
          </div>
        ))}
      </div>

      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
          project={editingProject || undefined}
        />
      )}
    </div>
  );
}
