import { ChevronDown, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useUpdateWorkspace,
  useWorkspaces,
} from "../features/workspaces/useWorkspaces";
import type { Workspace } from "../types";
import WorkspaceModal from "./WorkspaceModal";

export default function WorkspaceSelector() {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<
    Workspace | undefined
  >(undefined);

  const { workspaces } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const activeWorkspace = workspaces?.find(
    (w) => w.id === state.activeWorkspaceId
  );

  const handleWorkspaceChange = (workspaceId: string) => {
    dispatch({ type: "SET_ACTIVE_WORKSPACE", payload: workspaceId });
    setIsOpen(false);
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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-opacity-10 transition-colors"
        style={{
          backgroundColor: state.currentTheme.colors.primary + "20",
          color: state.currentTheme.colors.primary,
        }}
      >
        <span className="font-medium">{activeWorkspace?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-lg border z-50"
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <div className="p-2">
            {workspaces?.map((workspace) => (
              <div
                key={workspace.id}
                className={`w-full px-3 py-2 rounded-lg transition-colors ${
                  workspace.id === state.activeWorkspaceId
                    ? "bg-opacity-20"
                    : "hover:bg-opacity-10"
                }`}
                style={{
                  backgroundColor:
                    workspace.id === state.activeWorkspaceId
                      ? state.currentTheme.colors.primary + "20"
                      : state.currentTheme.colors.primary + "10",
                }}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleWorkspaceChange(workspace.id)}
                    className="flex items-center space-x-3 flex-1 text-left"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: workspace.color }}
                    />
                    <div>
                      <div className="font-medium">{workspace.name}</div>
                      {workspace.description && (
                        <div
                          className="text-sm"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {workspace.description}
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditWorkspace(workspace)}
                      className="p-1 rounded hover:bg-opacity-10 transition-colors"
                      style={{
                        backgroundColor:
                          state.currentTheme.colors.primary + "20",
                        color: state.currentTheme.colors.primary,
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    {!workspace.isDefault && (
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        className="p-1 rounded hover:bg-opacity-10 transition-colors"
                        style={{
                          backgroundColor:
                            state.currentTheme.colors.error + "20",
                          color: state.currentTheme.colors.error,
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleCreateWorkspace}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-opacity-10 transition-colors mt-2"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "10",
                color: state.currentTheme.colors.primary,
              }}
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-4 h-4" />
                <span className="font-medium">Novo Espaço</span>
              </div>
            </button>
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
