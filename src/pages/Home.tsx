import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle, Clock, Target } from "lucide-react";
import { useState } from "react";
import FloatingActionButton from "../components/FloatingActionButton";
import NextEventAlert from "../components/NextEventAlert";
import PullToRefreshIndicator from "../components/PullToRefreshIndicator";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { useApp } from "../context/AppContext";
import { useProfile } from "../features/profile/useProfile";
import {
  useCompleteTask,
  useCreateTask,
  useTasks,
  useUpdateTask,
} from "../features/tasks/useTasks";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import type { Task } from "../types";
import { getOverdueTasks, getTodayTasks, getUpcomingTasks } from "../utils";

export default function Home() {
  const { state, loading, error } = useApp();
  const { triggerHaptic, triggerSuccess } = useHapticFeedback();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const { tasks } = useTasks();
  const { profile } = useProfile();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const completeTaskMutation = useCompleteTask();

  const { elementRef, isRefreshing, pullDistance, progress } = usePullToRefresh(
    {
      onRefresh: async () => {
        // Simular refresh - em uma implementação real, você chamaria as APIs
        await new Promise((resolve) => setTimeout(resolve, 1000));
        triggerSuccess();
      },
    }
  );

  const filteredTasks = tasks.filter(
    (task) => task.workspaceId === state.activeWorkspaceId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const todayTasks = getTodayTasks(filteredTasks);
  const overdueTasks = getOverdueTasks(filteredTasks);
  const upcomingTasks = getUpcomingTasks(filteredTasks, 7);

  const handleCompleteTask = (taskId: string) => {
    triggerHaptic("light");
    completeTaskMutation.mutate(taskId);
  };

  const handleEditTask = (task: Task) => {
    triggerHaptic("light");
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
    setEditingTask(undefined);
  };

  const stats = [
    {
      icon: CheckCircle,
      label: "Concluídas Hoje",
      value: todayTasks.filter((t) => t.isCompleted).length,
      color: state.currentTheme.colors.success,
    },
    {
      icon: Clock,
      label: "Pendentes",
      value: todayTasks.filter((t) => !t.isCompleted).length,
      color: state.currentTheme.colors.warning,
    },
    {
      icon: Target,
      label: "Hábitos Ativos",
      value: state.habits.filter(
        (habit) => habit.workspaceId === state.activeWorkspaceId
      ).length,
      color: state.currentTheme.colors.primary,
    },
    {
      icon: Calendar,
      label: "Próximos 7 dias",
      value: upcomingTasks.length,
      color: state.currentTheme.colors.secondary,
    },
  ];

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className="min-h-screen bg-gray-50 pb-20"
      style={{ backgroundColor: state.currentTheme.colors.background }}
    >
      <PullToRefreshIndicator
        progress={progress}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
      />
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: state.currentTheme.colors.text }}
            >
              Olá
              {profile?.firstName && profile?.lastName
                ? `, ${profile.firstName} ${profile.lastName}`
                : ""}
              ! 👋
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      <NextEventAlert />

      <div className="px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: stat.color + "15" }}
                >
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs font-medium"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {overdueTasks.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-1 h-6 bg-red-500 rounded-full"></div>
              <h2
                className="text-lg font-semibold"
                style={{ color: state.currentTheme.colors.text }}
              >
                Tarefas Atrasadas
              </h2>
            </div>
            <div className="space-y-2">
              {overdueTasks.map((task) => (
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
          </div>
        )}

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2
              className="text-lg font-semibold"
              style={{ color: state.currentTheme.colors.text }}
            >
              Tarefas de Hoje
            </h2>
          </div>
          {todayTasks.length > 0 ? (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onEdit={handleEditTask}
                  showProject={true}
                  showDate={false}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">🎉</div>
              <p
                className="text-base font-medium mb-1"
                style={{ color: state.currentTheme.colors.text }}
              >
                Nenhuma tarefa para hoje!
              </p>
              <p
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Que tal aproveitar para relaxar ou planejar o futuro?
              </p>
            </div>
          )}
        </div>

        {upcomingTasks.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2
                className="text-lg font-semibold"
                style={{ color: state.currentTheme.colors.text }}
              >
                Próximos 7 dias
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingTasks.slice(0, 5).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onEdit={handleEditTask}
                  showProject={true}
                  showDate={true}
                />
              ))}
              {upcomingTasks.length > 5 && (
                <p
                  className="text-center text-sm py-1"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  E mais {upcomingTasks.length - 5} tarefas...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => setIsTaskModalOpen(true)} />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
      />

      <FloatingActionButton
        onClick={() => {
          setEditingTask(undefined);
          setIsTaskModalOpen(true);
        }}
      />
    </div>
  );
}
