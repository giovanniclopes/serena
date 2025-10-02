import { ChevronDown, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useUpdateWorkspace,
  useWorkspaces,
} from "../features/workspaces/useWorkspaces";
import { useClickOutside } from "../hooks/useClickOutside";
import type { Workspace } from "../types";
import WorkspaceModal from "./WorkspaceModal";

export interface WorkspaceSelectorProps {
  onWorkspaceChange?: () => void;
}

export default function WorkspaceSelector({
  onWorkspaceChange,
}: WorkspaceSelectorProps) {
  const { state, dispatch, workspaceChanging } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<
    Workspace | undefined
  >(undefined);

  const { workspaces } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const containerRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  const activeWorkspace = workspaces?.find(
    (w) => w.id === state.activeWorkspaceId
  );

  const handleWorkspaceChange = (workspaceId: string) => {
    if (workspaceId === state.activeWorkspaceId) {
      setIsOpen(false);
      return;
    }

    dispatch({ type: "SET_WORKSPACE_CHANGING", payload: true });
    setIsOpen(false);

    if (onWorkspaceChange) {
      onWorkspaceChange();
    }

    setTimeout(() => {
      dispatch({ type: "SET_ACTIVE_WORKSPACE", payload: workspaceId });
      dispatch({ type: "SET_WORKSPACE_CHANGING", payload: false });
    }, 800);
  };

  const handleCreateWorkspace = () => {
    setEditingWorkspace(undefined);
    setIsWorkspaceModalOpen(true);
    setIsOpen(false);
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setIsWorkspaceModalOpen(true);
    setIsOpen(false);
  };

  const handleSaveWorkspace = (
    workspaceData: Omit<Workspace, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingWorkspace) {
      updateWorkspaceMutation.mutate({
        id: editingWorkspace.id,
        updates: workspaceData,
      });
    } else {
      createWorkspaceMutation.mutate(workspaceData);
    }
    setIsWorkspaceModalOpen(false);
    setEditingWorkspace(undefined);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este workspace? Todos os dados associados serão removidos."
      )
    ) {
      deleteWorkspaceMutation.mutate(workspaceId);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={workspaceChanging}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-opacity-10 transition-all duration-200 border-2 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          backgroundColor: state.currentTheme.colors.primary + "15",
          color: state.currentTheme.colors.primary,
          borderColor: state.currentTheme.colors.primary + "30",
        }}
      >
        {workspaceChanging ? (
          <div
            className="animate-spin rounded-full h-3 w-3 border-b-2"
            style={{ borderColor: state.currentTheme.colors.primary }}
          />
        ) : (
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                activeWorkspace?.color || state.currentTheme.colors.primary,
            }}
          />
        )}
        <span className="font-medium">
          {workspaceChanging
            ? "Alterando..."
            : activeWorkspace?.name || "Selecionar Workspace"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${workspaceChanging ? "opacity-50" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-full max-w-72 rounded-lg shadow-xl border z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <div className="p-3">
            <div className="mb-2 px-2 py-1">
              <h3
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Workspaces
              </h3>
            </div>
            {workspaces?.map((workspace) => (
              <div
                key={workspace.id}
                className={`w-full px-3 py-3 rounded-lg transition-all duration-200 mb-1 ${
                  workspace.id === state.activeWorkspaceId
                    ? "ring-2 shadow-md"
                    : "hover:shadow-sm"
                }`}
                style={{
                  backgroundColor:
                    workspace.id === state.activeWorkspaceId
                      ? state.currentTheme.colors.primary + "15"
                      : "transparent",
                }}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleWorkspaceChange(workspace.id)}
                    className="flex items-center space-x-3 flex-1 text-left group"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          backgroundColor: workspace.color,
                          borderColor:
                            workspace.id === state.activeWorkspaceId
                              ? state.currentTheme.colors.primary
                              : workspace.color + "40",
                        }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{workspace.name}</span>
                          {workspace.id === state.activeWorkspaceId && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  state.currentTheme.colors.primary,
                              }}
                            />
                          )}
                        </div>
                        {workspace.description && (
                          <div
                            className="text-sm mt-0.5"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {workspace.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditWorkspace(workspace)}
                      className="p-1.5 rounded-md hover:scale-110 transition-all duration-200"
                      style={{
                        backgroundColor:
                          state.currentTheme.colors.primary + "15",
                        color: state.currentTheme.colors.primary,
                      }}
                      title="Editar workspace"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {!workspace.isDefault && (
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        className="p-1.5 rounded-md hover:scale-110 transition-all duration-200"
                        style={{
                          backgroundColor:
                            state.currentTheme.colors.error + "15",
                          color: state.currentTheme.colors.error,
                        }}
                        title="Excluir workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div
              className="mt-3 pt-2 border-t"
              style={{ borderColor: state.currentTheme.colors.border }}
            >
              <button
                onClick={handleCreateWorkspace}
                className="w-full text-left px-3 py-3 rounded-lg hover:scale-[1.02] transition-all duration-200 group"
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "10",
                  color: state.currentTheme.colors.primary,
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="p-1.5 rounded-md"
                    style={{
                      backgroundColor: state.currentTheme.colors.primary + "20",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium">Criar Novo Workspace</span>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      Organize seus projetos e tarefas
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        workspace={editingWorkspace}
        onSave={handleSaveWorkspace}
      />
    </div>
  );
}
