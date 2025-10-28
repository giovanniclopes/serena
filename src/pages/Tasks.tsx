import { List, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AITaskConfirmModal from "../components/AITaskConfirmModal";
import AITaskInput from "../components/AITaskInput";
import ConfettiEffect from "../components/ConfettiEffect";
import FilterControls from "../components/FilterControls";
import FloatingActionButton from "../components/FloatingActionButton";
import {
  TaskGridSkeleton,
  TaskListSkeleton,
} from "../components/skeletons/TaskSkeleton";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { FEATURES } from "../config/features";
import { useApp } from "../context/AppContext";
import { useProjects } from "../features/projects/useProjects";
import {
  useBulkDeleteTasks,
  useCompleteAllTasks,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "../features/tasks/useTasks";
import { useParseTaskInput } from "../hooks/useParseTaskInput";
import { useRecurringTasks } from "../hooks/useRecurringTasks";
import { useSkeletonLoading } from "../hooks/useSkeletonLoading";
import { useTaskCompletionWithConfetti } from "../hooks/useTaskCompletionWithConfetti";
import type { Priority, Task } from "../types";
import { filterTasks, searchTasks } from "../utils";

export default function Tasks() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showCompleteAllModal, setShowCompleteAllModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "recent" | "dueDate">(
    "priority"
  );

  const [isAIInputOpen, setIsAIInputOpen] = useState(false);
  const [aiInputValue, setAiInputValue] = useState("");
  const [showAIConfirmModal, setShowAIConfirmModal] = useState(false);
  const [createdTaskData, setCreatedTaskData] = useState<Task | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    null
  );

  const { tasks: rawTasks, isLoading, error } = useTasks();
  const { showSkeleton } = useSkeletonLoading(isLoading);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const { completeTask, uncompleteTask, confettiActive, stopConfetti } =
    useTaskCompletionWithConfetti();
  const deleteTaskMutation = useDeleteTask();
  const bulkDeleteTasksMutation = useBulkDeleteTasks();
  const completeAllTasksMutation = useCompleteAllTasks();
  const { markInstanceComplete, getInstancesForDate } = useRecurringTasks();
  const parseTaskMutation = useParseTaskInput();
  const { projects } = useProjects();

  const [refreshKey, setRefreshKey] = React.useState(0);

  useEffect(() => {
    const handleOpenAIInput = () => {
      setIsAIInputOpen(true);
    };

    window.addEventListener("openAIInput", handleOpenAIInput);
    return () => window.removeEventListener("openAIInput", handleOpenAIInput);
  }, []);

  const handleAITaskCreation = async () => {
    if (!aiInputValue.trim()) return;

    try {
      const result = await parseTaskMutation.mutateAsync(aiInputValue);

      if (result.success && result.data) {
        const taskData = {
          title: result.data.title,
          description: result.data.description || undefined,
          projectId: result.data.projectName
            ? projects?.find((p) =>
                p.name
                  .toLowerCase()
                  .includes(result.data!.projectName!.toLowerCase())
              )?.id || undefined
            : undefined,
          dueDate: result.data.dueDate
            ? new Date(result.data.dueDate)
            : undefined,
          priority: result.data.priority || "P3",
          tags: [],
          attachments: [],
          recurrence: undefined,
          subtasks: [],
          reminders: [],
          isCompleted: false,
          completedAt: undefined,
          workspaceId: state.activeWorkspaceId,
          order: 0,
          timeEntries: [],
          totalTimeSpent: 0,
          isTimerRunning: false,
          currentSessionStart: undefined,
        };

        const createdTask = await createTaskMutation.mutateAsync(taskData);

        setCreatedTaskData(createdTask);
        setAiInputValue("");
        setIsAIInputOpen(false);
        setShowAIConfirmModal(true);

        toast.success("Tarefa criada com sucesso!");
      } else {
        if (result.error) {
          toast.error(result.error);
        }
        if (result.suggestions && result.suggestions.length > 0) {
          toast.info(result.suggestions[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao criar tarefa via IA:", error);
      toast.error("Falha ao criar tarefa. Tente novamente.");
    }
  };

  const handleConfirmAndEdit = () => {
    if (createdTaskData) {
      setEditingTask(createdTaskData);
      setIsTaskModalOpen(true);
    }
    setShowAIConfirmModal(false);
    setCreatedTaskData(null);
  };

  const highlightTask = (taskId: string) => {
    setHighlightedTaskId(taskId);

    setTimeout(() => {
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedTaskId(null);
    }, 3000);
  };

  const tasks = React.useMemo(() => {
    if (!rawTasks) return [];

    const today = new Date();
    const nonRecurringTasks = rawTasks.filter((task) => !task.recurrence);
    const recurringInstances = getInstancesForDate(rawTasks, today);

    return [...nonRecurringTasks, ...recurringInstances];
  }, [rawTasks, getInstancesForDate, refreshKey]);

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "priority": {
          const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredTasks = sortTasks(
    filterTasks(
      searchTasks(tasks, searchQuery),
      {
        id: "default",
        name: "Filtro Padrão",
        workspaceId: state.activeWorkspaceId,
        isCompleted: showCompleted ? undefined : false,
        priorities:
          selectedPriorities.length > 0 ? selectedPriorities : undefined,
      },
      false
    )
  );

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  const handleUncompleteTask = (taskId: string) => {
    uncompleteTask(taskId);
  };

  const handleRecurringTaskToggle = (
    taskId: string,
    date: Date,
    isCompleted: boolean
  ) => {
    markInstanceComplete(taskId, date, isCompleted);
    setRefreshKey((prev) => prev + 1);

    if (isCompleted) {
      toast.success("Tarefa recorrente concluída com sucesso!");
    } else {
      toast.success("Tarefa recorrente marcada como não concluída!");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete);
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  const handleBulkDeleteToggle = () => {
    setIsBulkDeleteMode(!isBulkDeleteMode);
    if (isBulkDeleteMode) {
      setSelectedTasks(new Set());
    }
  };

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedTasks.size > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const confirmBulkDelete = () => {
    const taskIds = Array.from(selectedTasks);
    bulkDeleteTasksMutation.mutate(taskIds);
    setShowBulkDeleteModal(false);
    setSelectedTasks(new Set());
    setIsBulkDeleteMode(false);
  };

  const handleSaveTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> => {
    if (editingTask) {
      return new Promise((resolve, reject) => {
        updateTaskMutation.mutate(
          {
            ...editingTask,
            ...taskData,
            updatedAt: new Date(),
          },
          {
            onSuccess: (data) => {
              setIsTaskModalOpen(false);
              setEditingTask(undefined);
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    } else {
      return new Promise((resolve, reject) => {
        createTaskMutation.mutate(
          {
            ...taskData,
            workspaceId: state.activeWorkspaceId,
          },
          {
            onSuccess: (data) => {
              setIsTaskModalOpen(false);
              if (data && data.id) {
                highlightTask(data.id);
              }
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    }
  };

  const handleCompleteAllTasks = () => {
    const incompleteTasks = filteredTasks.filter((task) => !task.isCompleted);
    if (incompleteTasks.length > 0) {
      const taskIds = incompleteTasks.map((task) => task.id);
      completeAllTasksMutation.mutate(taskIds);
    }
    setShowCompleteAllModal(false);
  };

  if (showSkeleton) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        {viewMode === "grid" ? (
          <TaskGridSkeleton count={6} />
        ) : (
          <TaskListSkeleton count={5} />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div
          className="text-red-500 mb-2"
          style={{ color: state.currentTheme.colors.error }}
        >
          Erro ao carregar tarefas
        </div>
        <div
          className="text-sm"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Tente recarregar a página
        </div>
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
          Tarefas
        </h1>
      </div>

      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        selectedPriorities={selectedPriorities}
        onPrioritiesChange={setSelectedPriorities}
        searchPlaceholder="Buscar tarefas..."
        showCompletedLabel="Mostrar concluídas"
        isBulkDeleteMode={isBulkDeleteMode}
        onBulkDeleteToggle={handleBulkDeleteToggle}
        selectedTasksCount={selectedTasks.size}
        sortBy={sortBy}
        onSortChange={(sort) => {
          if (sort === "priority" || sort === "recent" || sort === "dueDate") {
            setSortBy(sort);
          }
        }}
      />

      {!isBulkDeleteMode && filteredTasks.some((task) => !task.isCompleted) && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCompleteAllModal(true)}
            className="px-4 py-2 border rounded-lg font-medium transition-colors text-sm"
            style={{
              borderColor: state.currentTheme.colors.primary,
              color: state.currentTheme.colors.primary,
            }}
          >
            Concluir todas
          </button>
        </div>
      )}

      {isBulkDeleteMode && selectedTasks.size > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.error,
              color: "white",
            }}
          >
            Excluir {selectedTasks.size} tarefa
            {selectedTasks.size !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {filteredTasks.length > 0 ? (
        <div
          className={`space-y-2 ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              : ""
          }`}
        >
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              data-task-id={task.id}
              className={`transition-all duration-500 ${
                highlightedTaskId === task.id
                  ? "ring-2 ring-blue-400 ring-opacity-75 shadow-lg scale-105"
                  : ""
              }`}
            >
              <TaskCard
                task={task}
                onComplete={handleCompleteTask}
                onUncomplete={handleUncompleteTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onRecurringToggle={handleRecurringTaskToggle}
                showProject={true}
                showDate={true}
                isBulkDeleteMode={isBulkDeleteMode}
                isSelected={selectedTasks.has(task.id)}
                onSelectionChange={handleTaskSelection}
              />
            </div>
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
            <List
              className="w-6 h-6"
              style={{ color: state.currentTheme.colors.primary }}
            />
          </div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: state.currentTheme.colors.text }}
          >
            Nenhuma tarefa encontrada
          </h3>
          <p
            className="text-sm"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            {searchQuery
              ? "Tente ajustar sua busca ou filtros"
              : "Que tal criar sua primeira tarefa?"}
          </p>
        </div>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
      />

      {showCompleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: state.currentTheme.colors.surface }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: state.currentTheme.colors.text }}
            >
              Confirmar ação
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Tem certeza que deseja concluir todas as tarefas pendentes? Esta
              ação não pode ser desfeita.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowCompleteAllModal(false)}
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
                onClick={handleCompleteAllTasks}
                disabled={completeAllTasksMutation.isPending}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                style={{
                  backgroundColor: state.currentTheme.colors.primary,
                  color: "white",
                }}
              >
                {completeAllTasksMutation.isPending
                  ? "Concluindo..."
                  : "Concluir todas"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              Excluir tarefa
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTaskToDelete(null);
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
                onClick={confirmDeleteTask}
                disabled={deleteTaskMutation.isPending}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                style={{
                  backgroundColor: state.currentTheme.colors.error,
                  color: "white",
                }}
              >
                {deleteTaskMutation.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: state.currentTheme.colors.surface }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: state.currentTheme.colors.text }}
            >
              Excluir tarefas
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Tem certeza que deseja excluir {selectedTasks.size} tarefa
              {selectedTasks.size !== 1 ? "s" : ""}? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
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
                onClick={confirmBulkDelete}
                disabled={bulkDeleteTasksMutation.isPending}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                style={{
                  backgroundColor: state.currentTheme.colors.error,
                  color: "white",
                }}
              >
                {bulkDeleteTasksMutation.isPending
                  ? "Excluindo..."
                  : "Excluir todas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {FEATURES.AI_ENABLED && (
        <button
          onClick={() => setIsAIInputOpen(true)}
          className="fixed bottom-32 right-4 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 border-0 flex items-center justify-center"
          style={{
            border: `1px solid ${state.currentTheme.colors.primary}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              state.currentTheme.colors.primary + "60";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Criar tarefa com IA"
        >
          <Sparkles
            className="w-6 h-6 hover:text-white"
            style={{
              color: state.currentTheme.colors.primary,
              transition: "color 0.2s ease-in-out",
            }}
          />
        </button>
      )}

      {isAIInputOpen && (
        <AITaskInput
          value={aiInputValue}
          onChange={setAiInputValue}
          onSubmit={handleAITaskCreation}
          onClose={() => {
            setIsAIInputOpen(false);
            setAiInputValue("");
          }}
          isProcessing={parseTaskMutation.isPending}
        />
      )}

      <AITaskConfirmModal
        isOpen={showAIConfirmModal}
        onClose={() => {
          setShowAIConfirmModal(false);
          setCreatedTaskData(null);
          if (createdTaskData) {
            highlightTask(createdTaskData.id);
          }
        }}
        task={createdTaskData}
        onEdit={handleConfirmAndEdit}
      />

      <FloatingActionButton
        onClick={() => {
          setEditingTask(undefined);
          setIsTaskModalOpen(true);
        }}
      />

      <ConfettiEffect
        isActive={confettiActive}
        onComplete={stopConfetti}
        numberOfPieces={150}
        colors={[
          "#ff6b6b",
          "#4ecdc4",
          "#45b7d1",
          "#96ceb4",
          "#feca57",
          "#ff9ff3",
          "#54a0ff",
          "#5f27cd",
        ]}
        gravity={0.3}
        wind={0.05}
      />
    </div>
  );
}
