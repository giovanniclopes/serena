import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Edit, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  useCompleteSubtask,
  useCreateSubtask,
  useDeleteSubtask,
  useReorderSubtasks,
  useSubtasks,
  useUpdateSubtask,
} from "../features/subtasks/useSubtasks";
import type { Task, Theme } from "../types";

interface SubtaskManagerProps {
  taskId: string;
  workspaceId: string;
}

interface SortableSubtaskItemProps {
  subtask: Task;
  isEditing: boolean;
  editingTitle: string;
  onStartEditing: (subtask: Task) => void;
  onUpdateSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onCompleteSubtask: (subtaskId: string) => void;
  onCancelEditing: () => void;
  onEditingTitleChange: (title: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isCompleting: boolean;
  theme: Theme;
}

function SortableSubtaskItem({
  subtask,
  isEditing,
  editingTitle,
  onStartEditing,
  onUpdateSubtask,
  onDeleteSubtask,
  onCompleteSubtask,
  onCancelEditing,
  onEditingTitleChange,
  isUpdating,
  isDeleting,
  isCompleting,
  theme,
}: SortableSubtaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 sm:gap-2 p-3 sm:p-2 rounded-md transition-colors ${
        subtask.isCompleted ? "bg-gray-50 opacity-60" : "bg-white border"
      } ${isDragging ? "shadow-lg" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="p-2 sm:p-1 cursor-grab hover:bg-gray-100 rounded transition-colors touch-none select-none min-h-[44px] min-w-[44px] flex items-center justify-center"
        style={{
          color: theme.colors.textSecondary,
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <GripVertical size={16} className="sm:w-3.5 sm:h-3.5" />
      </div>

      <button
        onClick={() => onCompleteSubtask(subtask.id)}
        disabled={isCompleting}
        className={`p-3 sm:p-0 rounded border-2 flex items-center justify-center transition-colors subtask-checkbox sm:scale-100 min-h-[44px] min-w-[44px] sm:min-h-5 sm:min-w-5 ${
          subtask.isCompleted
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 hover:border-green-500"
        }`}
      >
        {subtask.isCompleted && (
          <Check size={16} className="sm:w-2.5 sm:h-2.5" />
        )}
      </button>

      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            className="flex-1 text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onUpdateSubtask(subtask.id);
              if (e.key === "Escape") onCancelEditing();
            }}
          />
          <button
            onClick={() => onUpdateSubtask(subtask.id)}
            disabled={!editingTitle.trim() || isUpdating}
            className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
          >
            <Check size={14} />
          </button>
          <button
            onClick={onCancelEditing}
            className="p-1 text-gray-500 hover:bg-gray-200 rounded"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <span
            className={`flex-1 text-sm sm:text-sm py-1 ${
              subtask.isCompleted ? "line-through text-gray-500" : ""
            }`}
            style={{ color: theme.colors.text }}
          >
            {subtask.title}
          </span>
          <div className="flex items-center gap-0">
            <button
              onClick={() => onStartEditing(subtask)}
              className="p-2 sm:p-1 text-gray-500 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            >
              <Edit size={16} className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteSubtask(subtask.id)}
              disabled={isDeleting}
              className="p-2 sm:p-1 text-red-500 hover:bg-red-100 rounded disabled:opacity-50 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            >
              <Trash2 size={16} className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
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
  const reorderSubtasksMutation = useReorderSubtasks();

  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    const nextOrder =
      subtasks && subtasks.length > 0
        ? Math.max(...subtasks.map((s) => s.order || 0)) + 1
        : 0;

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
      order: nextOrder,
      timeEntries: [],
      totalTimeSpent: 0,
      isTimerRunning: false,
      currentSessionStart: undefined,
    });

    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !subtasks) {
      return;
    }

    const oldIndex = subtasks.findIndex((item) => item.id === active.id);
    const newIndex = subtasks.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedSubtasks = arrayMove(subtasks, oldIndex, newIndex);

    await reorderSubtasksMutation.mutateAsync({
      taskId,
      subtasks: reorderedSubtasks,
    });
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
    <div className="mt-3 space-y-3 sm:space-y-2">
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
            className="flex items-center gap-1 text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md hover:bg-gray-100 transition-colors min-h-[44px] sm:min-h-0"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            <Plus size={14} className="sm:w-3 sm:h-3" />
            Adicionar
          </button>
        )}
      </div>

      {isAddingSubtask && (
        <div className="flex items-center gap-2 p-3 sm:p-2 bg-gray-50 rounded-md">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Nova subtarefa..."
            className="flex-1 text-sm px-3 py-2 sm:px-2 sm:py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
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
            className="p-2 sm:p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
          >
            <Check size={16} className="sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            onClick={() => setIsAddingSubtask(false)}
            className="p-2 sm:p-1 text-gray-500 hover:bg-gray-200 rounded min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
          >
            <X size={16} className="sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      )}

      {subtasks && subtasks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={subtasks.map((subtask) => subtask.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className="space-y-2 sm:space-y-1"
              style={{ touchAction: "pan-y" }}
            >
              {subtasks
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((subtask) => (
                  <SortableSubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    isEditing={editingSubtaskId === subtask.id}
                    editingTitle={editingTitle}
                    onStartEditing={startEditing}
                    onUpdateSubtask={handleUpdateSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onCompleteSubtask={handleCompleteSubtask}
                    onCancelEditing={cancelEditing}
                    onEditingTitleChange={setEditingTitle}
                    isUpdating={updateSubtaskMutation.isPending}
                    isDeleting={deleteSubtaskMutation.isPending}
                    isCompleting={completeSubtaskMutation.isPending}
                    theme={state.currentTheme}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
