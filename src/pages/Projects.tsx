import { Folder, Plus } from "lucide-react";
import { useState } from "react";
import ProjectModal from "../components/ProjectModal";
import { useApp } from "../context/AppContext";
import type { Project } from "../types";

export default function Projects() {
  const { state, dispatch } = useApp();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(
    undefined
  );

  const handleCreateProject = () => {
    setEditingProject(undefined);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingProject) {
      dispatch({
        type: "UPDATE_PROJECT",
        payload: {
          ...editingProject,
          ...projectData,
          updatedAt: new Date(),
        },
      });
    } else {
      dispatch({
        type: "ADD_PROJECT",
        payload: {
          ...projectData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este projeto? Todas as tarefas associadas também serão removidas."
      )
    ) {
      dispatch({ type: "DELETE_PROJECT", payload: projectId });
    }
  };

  const currentWorkspaceProjects = state.projects.filter(
    (p) => p.workspaceId === state.activeWorkspaceId
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: state.currentTheme.colors.text }}
        >
          Projetos
        </h1>
        <button
          onClick={handleCreateProject}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          style={{
            backgroundColor: state.currentTheme.colors.primary,
            color: "white",
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {currentWorkspaceProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentWorkspaceProjects.map((project) => {
            const projectTasks = state.tasks.filter(
              (t) => t.projectId === project.id
            );
            const completedTasks = projectTasks.filter((t) => t.isCompleted);
            const progress =
              projectTasks.length > 0
                ? (completedTasks.length / projectTasks.length) * 100
                : 0;

            return (
              <div
                key={project.id}
                className="p-4 rounded-lg border relative overflow-hidden"
                style={{
                  backgroundColor: state.currentTheme.colors.surface,
                  borderColor: state.currentTheme.colors.border,
                }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: project.color }}
                />

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className="p-2 rounded-md"
                      style={{ backgroundColor: project.color + "20" }}
                    >
                      <Folder
                        className="w-4 h-4"
                        style={{ color: project.color }}
                      />
                    </div>
                    <div>
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: state.currentTheme.colors.text }}
                      >
                        {project.name}
                      </h3>
                      {project.description && (
                        <p
                          className="text-xs"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-1 rounded hover:bg-opacity-10 transition-colors"
                      style={{
                        backgroundColor:
                          state.currentTheme.colors.primary + "20",
                        color: state.currentTheme.colors.primary,
                      }}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1 rounded hover:bg-opacity-10 transition-colors"
                      style={{
                        backgroundColor: state.currentTheme.colors.error + "20",
                        color: state.currentTheme.colors.error,
                      }}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs font-medium"
                      style={{ color: state.currentTheme.colors.text }}
                    >
                      Progresso
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      {completedTasks.length}/{projectTasks.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: project.color,
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {projectTasks.length} tarefa
                    {projectTasks.length !== 1 ? "s" : ""}
                  </span>
                  <span
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {Math.round(progress)}% concluído
                  </span>
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
            Organize suas tarefas em projetos para melhor produtividade
          </p>
          <button
            onClick={handleCreateProject}
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

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
      />
    </div>
  );
}
