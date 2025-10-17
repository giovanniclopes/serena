import { List } from "lucide-react";
import { useState } from "react";
import FilterControls from "../components/FilterControls";
import FloatingActionButton from "../components/FloatingActionButton";
import {
  TaskGridSkeleton,
  TaskListSkeleton,
} from "../components/skeletons/TaskSkeleton";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { useApp } from "../context/AppContext";
import {
  useBulkDeleteTasks,
  useCompleteAllTasks,
  useCompleteTask,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUncompleteTask,
  useUpdateTask,
} from "../features/tasks/useTasks";
import { useRecurringTasks } from "../hooks/useRecurringTasks";
import { useSkeletonLoading } from "../hooks/useSkeletonLoading";
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

  const { tasks, isLoading, error } = useTasks();
  const { showSkeleton } = useSkeletonLoading(isLoading);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();
  const deleteTaskMutation = useDeleteTask();
  const bulkDeleteTasksMutation = useBulkDeleteTasks();
  const completeAllTasksMutation = useCompleteAllTasks();
  const { markInstanceComplete } = useRecurringTasks();

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
    completeTaskMutation.mutate(taskId);
  };

  const handleUncompleteTask = (taskId: string) => {
    uncompleteTaskMutation.mutate(taskId);
  };

  const handleRecurringTaskToggle = (
    taskId: string,
    date: Date,
    isCompleted: boolean
  ) => {
    markInstanceComplete(taskId, date, isCompleted);

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

  const handleSaveTask = (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingTask) {
      updateTaskMutation.mutate({
        ...editingTask,
        ...taskData,
        updatedAt: new Date(),
      });
    } else {
      createTaskMutation.mutate({
        ...taskData,
        workspaceId: state.activeWorkspaceId,
      });
    }
    setIsTaskModalOpen(false);
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
            <TaskCard
              key={task.id}
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

      <FloatingActionButton
        onClick={() => {
          setEditingTask(undefined);
          setIsTaskModalOpen(true);
        }}
      />
    </div>
  );
}
