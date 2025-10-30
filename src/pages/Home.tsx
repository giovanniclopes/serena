import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AchievementModal from "../components/AchievementModal";
import AITaskConfirmModal from "../components/AITaskConfirmModal";
import AITaskInput from "../components/AITaskInput";
import ConfettiEffect from "../components/ConfettiEffect";
import FloatingActionButton from "../components/FloatingActionButton";
import NextEventAlert from "../components/NextEventAlert";
import PullToRefreshIndicator from "../components/PullToRefreshIndicator";
import { HomeSkeleton } from "../components/skeletons/HomeSkeleton";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { FEATURES } from "../config/features";
import { useApp } from "../context/AppContext";
import { useProfile } from "../features/profile/useProfile";
import { useProjects } from "../features/projects/useProjects";
import {
  useCreateTask,
  useTasks,
  useUpdateTask,
} from "../features/tasks/useTasks";
import { useAchievements } from "../hooks/useAchievements";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { useParseTaskInput } from "../hooks/useParseTaskInput";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { useRecurringTasks } from "../hooks/useRecurringTasks";
import { useSkeletonLoading } from "../hooks/useSkeletonLoading";
import { useTaskCompletionWithConfetti } from "../hooks/useTaskCompletionWithConfetti";
import type { Task } from "../types";
import { getOverdueTasks, getTodayTasks, getUpcomingTasks } from "../utils";
import { adjustColorBrightness } from "../utils/colorUtils";

export default function Home() {
  const { state, loading, error } = useApp();
  const { triggerHaptic, triggerSuccess } = useHapticFeedback();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const { showSkeleton } = useSkeletonLoading(loading);

  const { tasks } = useTasks();
  const { profile } = useProfile();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const { completeTask, uncompleteTask, confettiActive, stopConfetti } =
    useTaskCompletionWithConfetti();
  const { markInstanceComplete } = useRecurringTasks();
  const { getUnlockedAchievements, getTotalXP } = useAchievements();
  const { projects } = useProjects();
  const [isAIInputOpen, setIsAIInputOpen] = useState(false);
  const [aiInputValue, setAiInputValue] = useState("");
  const [showAIConfirmModal, setShowAIConfirmModal] = useState(false);
  const [createdTaskData, setCreatedTaskData] = useState<Task | null>(null);
  const parseTaskMutation = useParseTaskInput({ availableProjects: projects });

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
          <p className="text-gray-700 mb-4">{error}</p>
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
    completeTask(taskId);
  };

  const handleUncompleteTask = (taskId: string) => {
    triggerHaptic("light");
    uncompleteTask(taskId);
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

  const handleAITaskCreation = async () => {
    if (!aiInputValue.trim()) return;

    try {
      const result = await parseTaskMutation.mutateAsync(aiInputValue);

      if (result.success && result.data) {
        const taskData = {
          title: result.data.title,
          description: result.data.description || undefined,
          projectId: result.data.projectName
            ? projects?.find((p) => {
                const projectName = p.name.toLowerCase().trim();
                const searchName = result
                  .data!.projectName!.toLowerCase()
                  .trim();
                if (projectName === searchName) return true;

                const projectWords = projectName
                  .split(/\s+/)
                  .filter(
                    (word) =>
                      ![
                        "de",
                        "da",
                        "do",
                        "das",
                        "dos",
                        "em",
                        "na",
                        "no",
                        "nas",
                        "nos",
                      ].includes(word)
                  );
                const searchWords = searchName
                  .split(/\s+/)
                  .filter(
                    (word) =>
                      ![
                        "de",
                        "da",
                        "do",
                        "das",
                        "dos",
                        "em",
                        "na",
                        "no",
                        "nas",
                        "nos",
                      ].includes(word)
                  );

                return searchWords.every((searchWord) =>
                  projectWords.some(
                    (projectWord) =>
                      projectWord.includes(searchWord) ||
                      searchWord.includes(projectWord)
                  )
                );
              })?.id || undefined
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
        } as Omit<Task, "id" | "createdAt" | "updatedAt">;

        const createdTask = await createTaskMutation.mutateAsync(taskData);

        setCreatedTaskData(createdTask);
        setAiInputValue("");
        setIsAIInputOpen(false);
        setShowAIConfirmModal(true);
        toast.success("Tarefa criada com sucesso!");
      } else if (result.partialData) {
        const taskData = {
          title: result.partialData.title || aiInputValue,
          description: result.partialData.description || undefined,
          projectId: result.partialData.projectName
            ? projects?.find((p) => {
                const projectName = p.name.toLowerCase().trim();
                const searchName = result
                  .partialData!.projectName!.toLowerCase()
                  .trim();
                if (projectName === searchName) return true;

                const projectWords = projectName
                  .split(/\s+/)
                  .filter(
                    (word) =>
                      ![
                        "de",
                        "da",
                        "do",
                        "das",
                        "dos",
                        "em",
                        "na",
                        "no",
                        "nas",
                        "nos",
                      ].includes(word)
                  );
                const searchWords = searchName
                  .split(/\s+/)
                  .filter(
                    (word) =>
                      ![
                        "de",
                        "da",
                        "do",
                        "das",
                        "dos",
                        "em",
                        "na",
                        "no",
                        "nas",
                        "nos",
                      ].includes(word)
                  );

                return searchWords.every((searchWord) =>
                  projectWords.some(
                    (projectWord) =>
                      projectWord.includes(searchWord) ||
                      searchWord.includes(projectWord)
                  )
                );
              })?.id || undefined
            : undefined,
          dueDate: result.partialData.dueDate
            ? new Date(result.partialData.dueDate)
            : undefined,
          priority: result.partialData.priority || "P3",
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
        } as Omit<Task, "id" | "createdAt" | "updatedAt">;

        const createdTask = await createTaskMutation.mutateAsync(taskData);

        setCreatedTaskData(createdTask);
        setAiInputValue("");
        setIsAIInputOpen(false);
        setShowAIConfirmModal(true);
        toast.success("Tarefa criada com dados parciais!");
        if (result.suggestions && result.suggestions.length > 0) {
          toast.info(result.suggestions[0]);
        }
      } else {
        if (result.error) toast.error(result.error);
        if (result.suggestions && result.suggestions.length > 0) {
          toast.info(result.suggestions[0]);
        }
      }
    } catch {
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
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })} às{" "}
              {format(new Date(), "HH:mm", { locale: ptBR })}.
            </p>
          </div>
          <button
            onClick={() => setIsAchievementModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors hover:scale-105"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "15",
              color: state.currentTheme.colors.primary,
            }}
          >
            <Trophy className="w-5 h-5" />
            <div className="text-right">
              <div className="text-sm font-bold">
                {getUnlockedAchievements().length}
              </div>
              <div className="text-xs opacity-75">{getTotalXP()} XP</div>
            </div>
          </button>
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
        }}
        task={createdTaskData}
        onEdit={handleConfirmAndEdit}
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

      <AchievementModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
      />
    </div>
  );
}
