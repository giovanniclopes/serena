import { Filter, Grid, List, Search } from "lucide-react";
import { useState } from "react";
import FloatingActionButton from "../components/FloatingActionButton";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { useApp } from "../context/AppContext";
import {
  useCompleteAllTasks,
  useCompleteTask,
  useCreateTask,
  useTasks,
  useUpdateTask,
} from "../features/tasks/useTasks";
import type { Task } from "../types";
import { filterTasks, searchTasks } from "../utils";

export default function Tasks() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showCompleteAllModal, setShowCompleteAllModal] = useState(false);

  const { tasks, isLoading, error } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const completeTaskMutation = useCompleteTask();
  const completeAllTasksMutation = useCompleteAllTasks();

  const filteredTasks = filterTasks(searchTasks(tasks, searchQuery), {
    id: "default",
    name: "Filtro Padrão",
    workspaceId: state.activeWorkspaceId,
    isCompleted: showCompleted ? undefined : false,
  });

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="text-center"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Carregando tarefas...
        </div>
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

      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: state.currentTheme.colors.textSecondary }}
          />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          />
        </div>

        <button
          className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
          style={{
            backgroundColor: state.currentTheme.colors.primary + "20",
            color: state.currentTheme.colors.primary,
          }}
        >
          <Filter className="w-4 h-4" />
        </button>

        <div
          className="flex rounded-lg"
          style={{ backgroundColor: state.currentTheme.colors.surface }}
        >
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-l-lg transition-colors ${
              viewMode === "list" ? "bg-opacity-20" : ""
            }`}
            style={{
              backgroundColor:
                viewMode === "list"
                  ? state.currentTheme.colors.primary + "20"
                  : "transparent",
              color:
                viewMode === "list"
                  ? state.currentTheme.colors.primary
                  : state.currentTheme.colors.textSecondary,
            }}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-r-lg transition-colors ${
              viewMode === "grid" ? "bg-opacity-20" : ""
            }`}
            style={{
              backgroundColor:
                viewMode === "grid"
                  ? state.currentTheme.colors.primary + "20"
                  : "transparent",
              color:
                viewMode === "grid"
                  ? state.currentTheme.colors.primary
                  : state.currentTheme.colors.textSecondary,
            }}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-1.5 h-1.5 sm:w-4 sm:h-4 rounded"
            style={{ accentColor: state.currentTheme.colors.primary }}
          />
          <span
            className="text-sm"
            style={{ color: state.currentTheme.colors.text }}
          >
            Mostrar concluídas
          </span>
        </label>

        {filteredTasks.some((task) => !task.isCompleted) && (
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
        )}
      </div>

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
              onEdit={handleEditTask}
              showProject={true}
              showDate={true}
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

      <FloatingActionButton
        onClick={() => {
          setEditingTask(undefined);
          setIsTaskModalOpen(true);
        }}
      />
    </div>
  );
}
