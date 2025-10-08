import { ChevronDown, Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
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
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  const { workspaces } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const containerRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) {
      setIsOpen(false);
    }
    if (showActionsMenu) {
      setShowActionsMenu(null);
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
    setShowActionsMenu(null);
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
      createWorkspaceMutation.mutate(workspaceData, {
        onSuccess: (newWorkspace) => {
          if (newWorkspace) {
            dispatch({ type: "SET_WORKSPACE_CHANGING", payload: true });
            setTimeout(() => {
              dispatch({
                type: "SET_ACTIVE_WORKSPACE",
                payload: newWorkspace.id,
              });
              dispatch({ type: "SET_WORKSPACE_CHANGING", payload: false });
            }, 800);
          }
        },
      });
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
    setShowActionsMenu(null);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={workspaceChanging}
        className="flex items-center space-x-1.5 px-2 py-1.5 rounded-md hover:bg-opacity-10 transition-all duration-200 border disabled:opacity-70 disabled:cursor-not-allowed max-w-[140px] sm:max-w-[180px]"
        style={{
          backgroundColor: state.currentTheme.colors.primary + "15",
          color: state.currentTheme.colors.primary,
          borderColor: state.currentTheme.colors.primary + "30",
        }}
      >
        {workspaceChanging ? (
          <div
            className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 flex-shrink-0"
            style={{ borderColor: state.currentTheme.colors.primary }}
          />
        ) : (
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                activeWorkspace?.color || state.currentTheme.colors.primary,
            }}
          />
        )}
        <span className="font-medium text-xs truncate">
          {workspaceChanging
            ? "Alterando..."
            : activeWorkspace?.name || "Workspace"}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          } ${workspaceChanging ? "opacity-50" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 md:mt-2 w-56 md:w-72 max-w-[240px] md:max-w-[280px] rounded-lg shadow-xl border z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <div className="p-1.5 md:p-3">
            <div className="mb-1 md:mb-2 px-1 md:px-2 py-0.5">
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
                className={`w-full px-1.5 md:px-3 py-1.5 md:py-3 rounded-md transition-all duration-200 mb-0.5 md:mb-1 group relative ${
                  workspace.id === state.activeWorkspaceId
                    ? "ring-1 shadow-sm"
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
                    className="flex items-center space-x-1.5 md:space-x-3 flex-1 text-left min-w-0"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    <div
                      className="w-2.5 md:w-4 h-2.5 md:h-4 rounded-full border flex-shrink-0"
                      style={{
                        backgroundColor: workspace.color,
                        borderColor:
                          workspace.id === state.activeWorkspaceId
                            ? state.currentTheme.colors.primary
                            : workspace.color + "40",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-xs md:text-sm truncate">
                          {workspace.name}
                        </span>
                        {workspace.id === state.activeWorkspaceId && (
                          <div
                            className="w-1 md:w-2 h-1 md:h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                state.currentTheme.colors.primary,
                            }}
                          />
                        )}
                      </div>
                      {workspace.description && (
                        <div
                          className="text-xs md:text-sm mt-0.5 truncate opacity-75 md:opacity-100"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {workspace.description}
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionsMenu(
                        showActionsMenu === workspace.id ? null : workspace.id
                      );
                    }}
                    className="p-0.5 md:p-1.5 rounded hover:scale-110 transition-all duration-200 opacity-60 group-hover:opacity-100 flex-shrink-0 flex items-center justify-center w-5 h-5 md:w-auto md:h-auto"
                    style={{
                      backgroundColor: state.currentTheme.colors.primary + "15",
                      color: state.currentTheme.colors.primary,
                    }}
                    title="Ações do workspace"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {showActionsMenu === workspace.id && (
                  <div
                    className="absolute top-full right-0 mt-0.5 md:mt-1 w-28 md:w-32 rounded-md shadow-lg border z-10 animate-in fade-in-0 zoom-in-95 duration-200"
                    style={{
                      backgroundColor: state.currentTheme.colors.surface,
                      borderColor: state.currentTheme.colors.border,
                    }}
                  >
                    <div className="p-0.5 md:p-1">
                      <button
                        onClick={() => handleEditWorkspace(workspace)}
                        className="w-full text-left px-1.5 md:px-2 py-1 md:py-1.5 rounded-md hover:scale-[1.02] transition-all duration-200 flex items-center space-x-1.5 md:space-x-2"
                        style={{
                          backgroundColor:
                            state.currentTheme.colors.primary + "10",
                          color: state.currentTheme.colors.primary,
                        }}
                      >
                        <Edit className="w-2.5 md:w-3 h-2.5 md:h-3" />
                        <span className="text-xs">Editar</span>
                      </button>
                      {!workspace.isDefault && (
                        <button
                          onClick={() => handleDeleteWorkspace(workspace.id)}
                          className="w-full text-left px-1.5 md:px-2 py-1 md:py-1.5 rounded-md hover:scale-[1.02] transition-all duration-200 flex items-center space-x-1.5 md:space-x-2 mt-0.5"
                          style={{
                            backgroundColor:
                              state.currentTheme.colors.error + "10",
                            color: state.currentTheme.colors.error,
                          }}
                        >
                          <Trash2 className="w-2.5 md:w-3 h-2.5 md:h-3" />
                          <span className="text-xs">Excluir</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div
              className="mt-1.5 md:mt-3 pt-1 md:pt-2 border-t"
              style={{ borderColor: state.currentTheme.colors.border }}
            >
              <button
                onClick={handleCreateWorkspace}
                className="w-full text-left px-1.5 md:px-3 py-1.5 md:py-3 rounded-md hover:scale-[1.02] transition-all duration-200 group"
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "10",
                  color: state.currentTheme.colors.primary,
                }}
              >
                <div className="flex items-center space-x-1.5 md:space-x-3">
                  <div
                    className="p-2 md:p-1.5 rounded-md"
                    style={{
                      backgroundColor: state.currentTheme.colors.primary + "20",
                    }}
                  >
                    <Plus className="w-4 h-4 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-xs md:text-sm">
                      Criar Workspace
                    </span>
                    <div
                      className="text-xs mt-0.5 opacity-75 md:opacity-100"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      Organize projetos
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
