import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle, Clock, Target, Timer } from "lucide-react";
import { useState } from "react";
import FloatingActionButton from "../components/FloatingActionButton";
import NextEventAlert from "../components/NextEventAlert";
import PullToRefreshIndicator from "../components/PullToRefreshIndicator";
import { HomeSkeleton } from "../components/skeletons/HomeSkeleton";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { useApp } from "../context/AppContext";
import { useProfile } from "../features/profile/useProfile";
import {
  useCompleteTask,
  useCreateTask,
  useTasks,
  useUncompleteTask,
  useUpdateTask,
} from "../features/tasks/useTasks";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useRecurringTasks } from "../hooks/useRecurringTasks";
import { useSkeletonLoading } from "../hooks/useSkeletonLoading";
import type { Task } from "../types";
import { getOverdueTasks, getTodayTasks, getUpcomingTasks } from "../utils";
import { adjustColorBrightness } from "../utils/colorUtils";

export default function Home() {
  const { state, loading, error } = useApp();
  const { triggerHaptic, triggerSuccess } = useHapticFeedback();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const { showSkeleton } = useSkeletonLoading(loading);

  const { tasks } = useTasks();
  const { profile } = useProfile();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();
  const { markInstanceComplete } = useRecurringTasks();

  const { elementRef, isRefreshing, pullDistance, progress } = usePullToRefresh(
    {
      onRefresh: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        triggerSuccess();
      },
    }
  );

  const filteredTasks = tasks.filter(
    (task) => task.workspaceId === state.activeWorkspaceId
  );

  if (showSkeleton) {
    return <HomeSkeleton />;
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
            className="px-4 py-2 text-white rounded-lg"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = adjustColorBrightness(
                state.currentTheme.colors.primary,
                0.8
              );
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                state.currentTheme.colors.primary;
            }}
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

  const handleUncompleteTask = (taskId: string) => {
    triggerHaptic("light");
    uncompleteTaskMutation.mutate(taskId);
  };

  const handleRecurringTaskToggle = (
    taskId: string,
    date: Date,
    isCompleted: boolean
  ) => {
    triggerHaptic("light");
    markInstanceComplete(taskId, date, isCompleted);

    if (isCompleted) {
      toast.success("Tarefa recorrente concluída com sucesso!");
    } else {
      toast.success("Tarefa recorrente marcada como não concluída!");
    }
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

  const totalTimeToday = filteredTasks.reduce(
    (sum, task) => sum + (task.totalTimeSpent || 0),
    0
  );

  const formatTimeDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const stats = [
    {
      icon: CheckCircle,
      label: "Concluídas Hoje",
      value: todayTasks.filter((t) => t.isCompleted).length,
      color: state.currentTheme.colors.success,
      displayValue: undefined,
    },
    {
      icon: Clock,
      label: "Pendentes",
      value: todayTasks.filter((t) => !t.isCompleted).length,
      color: state.currentTheme.colors.warning,
      displayValue: undefined,
    },
    {
      icon: Timer,
      label: "Tempo Total",
      value: totalTimeToday,
      color: "#3b82f6",
      displayValue: formatTimeDisplay(totalTimeToday),
    },
    {
      icon: Target,
      label: "Hábitos Ativos",
      value: state.habits.filter(
        (habit) => habit.workspaceId === state.activeWorkspaceId
      ).length,
      color: state.currentTheme.colors.primary,
      displayValue: undefined,
    },
    {
      icon: Calendar,
      label: "Próximos 7 dias",
      value: upcomingTasks.length,
      color: state.currentTheme.colors.secondary,
      displayValue: undefined,
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
                    className={`font-bold ${
                      stat.displayValue ? "text-xl" : "text-2xl"
                    }`}
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    {stat.displayValue || stat.value}
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
                  onUncomplete={handleUncompleteTask}
                  onEdit={handleEditTask}
                  onRecurringToggle={handleRecurringTaskToggle}
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
                  onUncomplete={handleUncompleteTask}
                  onEdit={handleEditTask}
                  onRecurringToggle={handleRecurringTaskToggle}
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
                  onUncomplete={handleUncompleteTask}
                  onEdit={handleEditTask}
                  onRecurringToggle={handleRecurringTaskToggle}
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
