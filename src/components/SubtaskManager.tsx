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
import {
  Calendar,
  Check,
  CheckCircle2,
  Edit,
  GripVertical,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { FEATURES } from "../config/features";
import { useApp } from "../context/AppContext";
import {
  useCompleteAllSubtasks,
  useCompleteSubtask,
  useCreateSubtask,
  useDeleteSubtask,
  useReorderSubtasks,
  useSubtasks,
  useUncompleteSubtask,
  useUpdateSubtask,
} from "../features/subtasks/useSubtasks";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useSuggestSubtasks } from "../hooks/useSuggestSubtasks";
import type { Task, Theme } from "../types";
import { formatDate, formatTime } from "../utils";
import InlineLoadingSpinner from "./InlineLoadingSpinner";
import SubtaskModal from "./SubtaskModal";
import Accordion from "./ui/accordion";

interface SubtaskManagerProps {
  taskId: string;
  workspaceId: string;
  parentTask?: Task;
  viewMode?: "list" | "grid";
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface SortableSubtaskItemProps {
  subtask: Task;
  isEditing: boolean;
  editingTitle: string;
  onStartEditing: (subtask: Task) => void;
  onUpdateSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onCancelEditing: () => void;
  onEditingTitleChange: (title: string) => void;
  onOpenAdvancedEdit: (subtask: Task) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isToggling: boolean;
  theme: Theme;
}

function SortableSubtaskItem({
  subtask,
  isEditing,
  editingTitle,
  onStartEditing,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  onCancelEditing,
  onEditingTitleChange,
  onOpenAdvancedEdit,
  isUpdating,
  isDeleting,
  isToggling,
  theme,
}: SortableSubtaskItemProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
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

  const borderRadius = isMobile ? "rounded-2xl" : "rounded-md";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${borderRadius} md:pt-5 transition-colors ${
        subtask.isCompleted
          ? "bg-gray-50 border border-gray-200 opacity-60"
          : "bg-white border"
      } ${isDragging ? "shadow-lg" : ""} ${isMobile ? "p-4" : "p-2"}`}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onUpdateSubtask(subtask.id);
              if (e.key === "Escape") onCancelEditing();
            }}
          />
          <button
            onClick={() => onUpdateSubtask(subtask.id)}
            disabled={!editingTitle.trim() || isUpdating}
            className="p-2 text-green-600 hover:bg-green-100 rounded-lg disabled:opacity-50 min-h-2 min-w-2"
            aria-label="Salvar alterações"
          >
            <Check size={18} />
          </button>
          <button
            onClick={onCancelEditing}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg min-h-2 min-w-2"
            aria-label="Cancelar edição"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header: Drag + Checkbox + Título */}
          <div className="flex items-start gap-3">
            {/* Drag handle - apenas no desktop */}
            {!isMobile && (
              <div
                {...attributes}
                {...listeners}
                className="p-1 cursor-grab hover:bg-gray-100 rounded transition-colors touch-none select-none flex items-center justify-center"
                style={{
                  color: theme.colors.textSecondary,
                  touchAction: "none",
                  userSelect: "none",
                }}
              >
                <GripVertical size={14} />
              </div>
            )}

            {/* Checkbox */}
            <button
              onClick={() => onToggleSubtask(subtask.id)}
              disabled={isToggling}
              className={`flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
                isMobile ? "min-h-2 min-w-2 p-3" : "min-h-7 min-w-7"
              } ${
                subtask.isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 hover:border-green-500"
              }`}
              aria-label={
                subtask.isCompleted
                  ? "Marcar como não concluída"
                  : "Marcar como concluída"
              }
            >
              {subtask.isCompleted && <Check size={isMobile ? 14 : 12} />}
            </button>

            {/* Título */}
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm block break-words cursor-pointer select-none leading-relaxed ${
                  subtask.isCompleted ? "line-through text-gray-600" : ""
                }`}
                style={{ color: theme.colors.text }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onOpenAdvancedEdit(subtask);
                }}
              >
                {subtask.title}
              </span>

              {/* Data */}
              {subtask.dueDate && (
                <div className="flex items-center mt-2 gap-1.5">
                  <Calendar
                    className={isMobile ? "w-3.5 h-3.5" : "w-3 h-3"}
                    style={{ color: theme.colors.textSecondary }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {formatDate(subtask.dueDate)}
                    {subtask.dueDate.getHours() !== 0 &&
                      ` às ${formatTime(subtask.dueDate)}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-end gap-2">
            {!isMobile && (
              <button
                onClick={() => onOpenAdvancedEdit(subtask)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Editar detalhes"
              >
                <Settings size={16} />
              </button>
            )}
            <button
              onClick={() =>
                isMobile ? onOpenAdvancedEdit(subtask) : onStartEditing(subtask)
              }
              className={`text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
                isMobile ? "p-2 min-h-2 min-w-2" : "p-2"
              }`}
              title={isMobile ? "Editar subtarefa" : "Editar título"}
            >
              <Edit size={isMobile ? 18 : 16} />
            </button>
            <button
              onClick={() => onDeleteSubtask(subtask.id)}
              disabled={isDeleting}
              className={`text-red-500 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors ${
                isMobile ? "p-2 min-h-2 min-w-2" : "p-2"
              }`}
              title="Excluir"
            >
              <Trash2 size={isMobile ? 18 : 16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubtaskManager({
  taskId,
  workspaceId,
  parentTask,
  viewMode = "list",
  collapsible = false,
  defaultExpanded = true,
}: SubtaskManagerProps) {
  const { state } = useApp();
  const { subtasks, isLoading } = useSubtasks(taskId);
  const createSubtaskMutation = useCreateSubtask();
  const updateSubtaskMutation = useUpdateSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const completeSubtaskMutation = useCompleteSubtask();
  const uncompleteSubtaskMutation = useUncompleteSubtask();
  const reorderSubtasksMutation = useReorderSubtasks();
  const completeAllSubtasksMutation = useCompleteAllSubtasks();
  const suggestSubtasksMutation = useSuggestSubtasks();

  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Task | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtaskToDelete(subtaskId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSubtask = async () => {
    if (subtaskToDelete) {
      await deleteSubtaskMutation.mutateAsync(subtaskToDelete);
      setShowDeleteModal(false);
      setSubtaskToDelete(null);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    const subtask = subtasks?.find((s) => s.id === subtaskId);
    if (!subtask) return;

    if (subtask.isCompleted) {
      await uncompleteSubtaskMutation.mutateAsync(subtaskId);
    } else {
      await completeSubtaskMutation.mutateAsync(subtaskId);
    }
  };

  const startEditing = (subtask: Task) => {
    setEditingSubtaskId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const cancelEditing = () => {
    setEditingSubtaskId(null);
    setEditingTitle("");
  };

  const openAdvancedEdit = (subtask: Task) => {
    setEditingSubtask(subtask);
    setIsSubtaskModalOpen(true);
  };

  const handleSubtaskSave = async (
    subtaskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (editingSubtask) {
      await updateSubtaskMutation.mutateAsync({
        ...editingSubtask,
        ...subtaskData,
      });
    } else {
      const nextOrder =
        subtasks && subtasks.length > 0
          ? Math.max(...subtasks.map((s) => s.order || 0)) + 1
          : 0;

      await createSubtaskMutation.mutateAsync({
        ...subtaskData,
        parentTaskId: taskId,
        workspaceId,
        order: nextOrder,
        subtasks: [],
        reminders: [],
        tags: [],
        attachments: [],
        isCompleted: false,
        completedAt: undefined,
        timeEntries: [],
        totalTimeSpent: 0,
        isTimerRunning: false,
        currentSessionStart: undefined,
      });
    }
    setIsSubtaskModalOpen(false);
    setEditingSubtask(undefined);
  };

  const closeSubtaskModal = () => {
    setIsSubtaskModalOpen(false);
    setEditingSubtask(undefined);
  };

  const handleSuggestSubtasks = async () => {
    if (!parentTask) {
      console.error(
        "Dados da tarefa pai não disponíveis para sugerir subtarefas",
      );
      return;
    }

    try {
      await suggestSubtasksMutation.mutateAsync({
        taskTitle: parentTask.title,
        taskDescription: parentTask.description,
        taskId,
        workspaceId,
      });
    } catch (error) {
      console.error("Erro ao sugerir subtarefas:", error);
    }
  };

  const handleCompleteAllSubtasks = async () => {
    try {
      await completeAllSubtasksMutation.mutateAsync(taskId);
    } catch (error) {
      console.error("Erro ao completar todas as subtarefas:", error);
    }
  };

  const pendingSubtasksCount =
    subtasks?.filter((subtask) => !subtask.isCompleted).length || 0;
  const hasPendingSubtasks = pendingSubtasksCount > 0;

  if (isLoading) {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-gray-600">Carregando subtarefas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {collapsible ? (
        <Accordion
          title="Subtarefas"
          badge={subtasks?.length || 0}
          defaultExpanded={defaultExpanded}
          theme={state.currentTheme}
        >
          <div
            className={`flex ${
              viewMode === "grid"
                ? "flex-col"
                : "flex-col md:flex-row md:items-center"
            } gap-3`}
          >
            <h4
              className="text-sm font-medium"
              style={{ color: state.currentTheme.colors.text }}
            >
              <span
                style={{
                  border: `1px solid ${state.currentTheme.colors.text}`,
                  borderRadius: "6px",
                  padding: "2px 8px",
                  display: "inline-block",
                  marginRight: 8,
                  color: state.currentTheme.colors.text,
                }}
              >
                {subtasks?.length || 0} subtarefa
                {subtasks?.length !== 1 ? "s" : ""} (
                {subtasks?.filter((subtask) => !subtask.isCompleted).length ||
                  0}{" "}
                não completada
                {subtasks?.filter((subtask) => !subtask.isCompleted).length !==
                1
                  ? "s"
                  : ""}
                )
              </span>
            </h4>
            {!isAddingSubtask && (
              <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-2 mt-3">
                {hasPendingSubtasks && (
                  <button
                    onClick={handleCompleteAllSubtasks}
                    disabled={completeAllSubtasksMutation.isPending}
                    className="flex items-center justify-center gap-1.5 md:gap-1 text-xs md:text-xs px-3 md:px-3 py-3 md:py-2 rounded-lg md:rounded-md border border-gray-200 hover:bg-green-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                    style={{
                      color: completeAllSubtasksMutation.isPending
                        ? state.currentTheme.colors.textSecondary
                        : "#16a34a",
                    }}
                    aria-label={`Completar todas as ${pendingSubtasksCount} subtarefa${pendingSubtasksCount !== 1 ? "s" : ""} pendente${pendingSubtasksCount !== 1 ? "s" : ""}`}
                    aria-busy={completeAllSubtasksMutation.isPending}
                  >
                    {completeAllSubtasksMutation.isPending ? (
                      <InlineLoadingSpinner
                        size={16}
                        className="md:w-3 md:h-3"
                      />
                    ) : (
                      <CheckCircle2
                        size={16}
                        className="md:w-3 md:h-3 flex-shrink-0"
                      />
                    )}
                    <span>
                      {completeAllSubtasksMutation.isPending
                        ? "Completando..."
                        : "Completar todas"}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setIsAddingSubtask(true)}
                  className="hidden md:flex items-center justify-center gap-1.5 md:gap-1 text-xs md:text-xs px-3 md:px-3 py-3 md:py-2 rounded-lg md:rounded-md border border-gray-200 hover:bg-gray-100 transition-colors whitespace-nowrap"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  <Plus size={16} className="md:w-3 md:h-3 flex-shrink-0" />
                  <span>Rápido</span>
                </button>
                <button
                  onClick={() => {
                    setEditingSubtask(undefined);
                    setIsSubtaskModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 md:gap-1 text-xs md:text-xs px-3 md:px-3 py-3 md:py-2 rounded-lg md:rounded-md border border-gray-200 hover:bg-gray-100 transition-colors whitespace-nowrap"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  <Settings size={16} className="md:w-3 md:h-3 flex-shrink-0" />
                  <span>Detalhado</span>
                </button>
                {FEATURES.AI_ENABLED && (
                  <button
                    onClick={handleSuggestSubtasks}
                    disabled={suggestSubtasksMutation.isPending}
                    className="flex items-center justify-center gap-1.5 md:gap-1 text-xs md:text-xs px-3 md:px-3 py-3 md:py-2 rounded-lg md:rounded-md border border-gray-200 hover:bg-purple-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                    style={{
                      color: suggestSubtasksMutation.isPending
                        ? state.currentTheme.colors.textSecondary
                        : "#7c3aed",
                    }}
                  >
                    {suggestSubtasksMutation.isPending ? (
                      <InlineLoadingSpinner
                        size={16}
                        className="md:w-3 md:h-3"
                      />
                    ) : (
                      <Sparkles
                        size={16}
                        className="md:w-3 md:h-3 flex-shrink-0"
                      />
                    )}
                    <span>
                      {suggestSubtasksMutation.isPending
                        ? "Gerando..."
                        : "Sugerir com IA"}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {isAddingSubtask && (
            <div className="flex items-center gap-2 p-4 sm:p-3 bg-gray-50 rounded-2xl sm:rounded-xl mt-3 sm:mt-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Nova subtarefa..."
                className="flex-1 text-sm px-3 py-2 sm:px-2 sm:py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-2 sm:min-h-0"
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
                className="p-2 sm:p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 min-h-2 min-w-2 sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                aria-label="Adicionar subtarefa"
              >
                <Check size={16} className="sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                onClick={() => setIsAddingSubtask(false)}
                className="p-2 sm:p-1 text-gray-600 hover:bg-gray-200 rounded min-h-2 min-w-2 sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                aria-label="Cancelar adição de subtarefa"
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
                  className="space-y-3 sm:space-y-2 mt-3 sm:mt-2"
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
                        onToggleSubtask={handleToggleSubtask}
                        onCancelEditing={cancelEditing}
                        onEditingTitleChange={setEditingTitle}
                        onOpenAdvancedEdit={openAdvancedEdit}
                        isUpdating={updateSubtaskMutation.isPending}
                        isDeleting={deleteSubtaskMutation.isPending}
                        isToggling={
                          completeSubtaskMutation.isPending ||
                          uncompleteSubtaskMutation.isPending
                        }
                        theme={state.currentTheme}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </Accordion>
      ) : (
        <>
          <div
            className={`flex ${viewMode === "grid" ? "flex-col" : "flex-col md:flex-row md:items-center"} gap-3`}
          >
            <h4
              className="text-sm font-medium"
              style={{ color: state.currentTheme.colors.text }}
            >
              <span
                style={{
                  border: `1px solid ${state.currentTheme.colors.text}`,
                  borderRadius: "6px",
                  padding: "2px 8px",
                  display: "inline-block",
                  marginRight: 8,
                  color: state.currentTheme.colors.text,
                }}
              >
                Subtarefas: {subtasks?.length || 0} (
                {subtasks?.filter((subtask) => !subtask.isCompleted).length ||
                  0}{" "}
                não completadas)
              </span>
            </h4>
            {!isAddingSubtask && (
              <div className="flex flex-wrap items-center gap-2">
                {hasPendingSubtasks && (
                  <button
                    onClick={handleCompleteAllSubtasks}
                    disabled={completeAllSubtasksMutation.isPending}
                    className="flex items-center gap-1.5 text-xs px-4 py-2.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-md hover:bg-green-100 transition-colors min-h-2 sm:min-h-0 disabled:opacity-50"
                    style={{
                      color: completeAllSubtasksMutation.isPending
                        ? state.currentTheme.colors.textSecondary
                        : "#16a34a",
                    }}
                    aria-label={`Completar todas as ${pendingSubtasksCount} subtarefa${pendingSubtasksCount !== 1 ? "s" : ""} pendente${pendingSubtasksCount !== 1 ? "s" : ""}`}
                    aria-busy={completeAllSubtasksMutation.isPending}
                  >
                    {completeAllSubtasksMutation.isPending ? (
                      <InlineLoadingSpinner
                        size={16}
                        className="sm:w-3.5 sm:h-3.5"
                      />
                    ) : (
                      <CheckCircle2 size={16} className="sm:w-3.5 sm:h-3.5" />
                    )}
                    {completeAllSubtasksMutation.isPending
                      ? "Completando..."
                      : "Completar todas"}
                  </button>
                )}
                <button
                  onClick={() => setIsAddingSubtask(true)}
                  className="flex items-center gap-1.5 text-xs px-4 py-2.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-md hover:bg-gray-100 transition-colors min-h-2 sm:min-h-0"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  <Plus size={16} className="sm:w-3.5 sm:h-3.5" />
                  Rápido
                </button>
                <button
                  onClick={() => {
                    setEditingSubtask(undefined);
                    setIsSubtaskModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs px-4 py-2.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-md hover:bg-gray-100 transition-colors min-h-2 sm:min-h-0"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  <Settings size={16} className="sm:w-3.5 sm:h-3.5" />
                  Detalhado
                </button>
                {FEATURES.AI_ENABLED && (
                  <button
                    onClick={handleSuggestSubtasks}
                    disabled={suggestSubtasksMutation.isPending}
                    className="flex items-center gap-1.5 text-xs px-4 py-2.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-md hover:bg-purple-100 transition-colors min-h-2 sm:min-h-0 disabled:opacity-50"
                    style={{
                      color: suggestSubtasksMutation.isPending
                        ? state.currentTheme.colors.textSecondary
                        : "#7c3aed",
                    }}
                  >
                    {suggestSubtasksMutation.isPending ? (
                      <InlineLoadingSpinner
                        size={14}
                        className="sm:w-3 sm:h-3"
                      />
                    ) : (
                      <Sparkles size={14} className="sm:w-3 sm:h-3" />
                    )}
                    {suggestSubtasksMutation.isPending
                      ? "Gerando..."
                      : "Sugerir com IA"}
                  </button>
                )}
              </div>
            )}
          </div>

          {isAddingSubtask && (
            <div className="flex items-center gap-2 p-4 sm:p-3 bg-gray-50 rounded-2xl sm:rounded-xl">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Nova subtarefa..."
                className="flex-1 text-sm px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-0"
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
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg disabled:opacity-50 min-h-2 min-w-2 sm:min-h-0 sm:min-w-0 flex items-center justify-center transition-colors"
                aria-label="Adicionar subtarefa"
              >
                <Check size={18} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setIsAddingSubtask(false)}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg min-h-2 min-w-2 sm:min-h-0 sm:min-w-0 flex items-center justify-center transition-colors"
                aria-label="Cancelar adição de subtarefa"
              >
                <X size={18} className="sm:w-4 sm:h-4" />
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
                        onToggleSubtask={handleToggleSubtask}
                        onCancelEditing={cancelEditing}
                        onEditingTitleChange={setEditingTitle}
                        onOpenAdvancedEdit={openAdvancedEdit}
                        isUpdating={updateSubtaskMutation.isPending}
                        isDeleting={deleteSubtaskMutation.isPending}
                        isToggling={
                          completeSubtaskMutation.isPending ||
                          uncompleteSubtaskMutation.isPending
                        }
                        theme={state.currentTheme}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      <SubtaskModal
        isOpen={isSubtaskModalOpen}
        onClose={closeSubtaskModal}
        subtask={editingSubtask}
        onSave={handleSubtaskSave}
      />

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: state.currentTheme.colors.surface }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: state.currentTheme.colors.text }}
            >
              Excluir subtarefa
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Tem certeza que deseja excluir esta subtarefa? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSubtaskToDelete(null);
                }}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                style={{
                  backgroundColor: state.currentTheme.colors.surface,
                  color: state.currentTheme.colors.textSecondary,
                  border: `1px solid ${state.currentTheme.colors.border}`,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteSubtask}
                disabled={deleteSubtaskMutation.isPending}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                style={{
                  backgroundColor: state.currentTheme.colors.error,
                  color: "white",
                }}
              >
                {deleteSubtaskMutation.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
