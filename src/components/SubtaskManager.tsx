import { Check, Edit, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  useCompleteSubtask,
  useCreateSubtask,
  useDeleteSubtask,
  useSubtasks,
  useUpdateSubtask,
} from "../features/subtasks/useSubtasks";
import type { Task } from "../types";

interface SubtaskManagerProps {
  taskId: string;
  workspaceId: string;
}

export default function SubtaskManager({
  taskId,
  workspaceId,
}: SubtaskManagerProps) {
  const { state } = useApp();
  const { subtasks, isLoading } = useSubtasks(taskId);
  const createSubtaskMutation = useCreateSubtask();
  const updateSubtaskMutation = useUpdateSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const completeSubtaskMutation = useCompleteSubtask();

  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState("");

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    await createSubtaskMutation.mutateAsync({
      title: newSubtaskTitle.trim(),
      description: undefined,
      projectId: undefined,
      parentTaskId: taskId,
      subtasks: [],
      dueDate: undefined,
      priority: "P3",
      reminders: [],
      tags: [],
      attachments: [],
      isCompleted: false,
      completedAt: undefined,
      workspaceId,
    });

    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  const handleUpdateSubtask = async (subtaskId: string) => {
    if (!editingTitle.trim()) return;

    const subtask = subtasks?.find((s) => s.id === subtaskId);
    if (!subtask) return;

    await updateSubtaskMutation.mutateAsync({
      ...subtask,
      title: editingTitle.trim(),
    });

    setEditingSubtaskId(null);
    setEditingTitle("");
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta subtarefa?")) {
      await deleteSubtaskMutation.mutateAsync(subtaskId);
    }
  };

  const handleCompleteSubtask = async (subtaskId: string) => {
    await completeSubtaskMutation.mutateAsync(subtaskId);
  };

  const startEditing = (subtask: Task) => {
    setEditingSubtaskId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const cancelEditing = () => {
    setEditingSubtaskId(null);
    setEditingTitle("");
  };

  if (isLoading) {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-gray-500">Carregando subtarefas...</span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4
          className="text-sm font-medium"
          style={{ color: state.currentTheme.colors.text }}
        >
          Subtarefas ({subtasks?.length || 0})
        </h4>
        {!isAddingSubtask && (
          <button
            onClick={() => setIsAddingSubtask(true)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            <Plus size={12} />
            Adicionar
          </button>
        )}
      </div>

      {isAddingSubtask && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Nova subtarefa..."
            className="flex-1 text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask();
              if (e.key === "Escape") setIsAddingSubtask(false);
            }}
          />
          <button
            onClick={handleAddSubtask}
            disabled={
              !newSubtaskTitle.trim() || createSubtaskMutation.isPending
            }
            className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => setIsAddingSubtask(false)}
            className="p-1 text-gray-500 hover:bg-gray-200 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {subtasks && subtasks.length > 0 && (
        <div className="space-y-1">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                subtask.isCompleted
                  ? "bg-gray-50 opacity-60"
                  : "bg-white border"
              }`}
            >
              <button
                onClick={() => handleCompleteSubtask(subtask.id)}
                disabled={completeSubtaskMutation.isPending}
                className={`w-1.5 h-1.5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  subtask.isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-green-500"
                }`}
              >
                {subtask.isCompleted && (
                  <Check size={3} className="sm:w-2.5 sm:h-2.5" />
                )}
              </button>

              {editingSubtaskId === subtask.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-1 text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateSubtask(subtask.id);
                      if (e.key === "Escape") cancelEditing();
                    }}
                  />
                  <button
                    onClick={() => handleUpdateSubtask(subtask.id)}
                    disabled={
                      !editingTitle.trim() || updateSubtaskMutation.isPending
                    }
                    className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      subtask.isCompleted ? "line-through text-gray-500" : ""
                    }`}
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    {subtask.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditing(subtask)}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      disabled={deleteSubtaskMutation.isPending}
                      className="p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
