import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpDown,
  BarChart3,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarSkeleton } from "../components/skeletons/CalendarSkeleton";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { useApp } from "../context/AppContext";
import {
  useCompleteTask,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUncompleteTask,
  useUpdateTask,
} from "../features/tasks/useTasks";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useRecurringTasks } from "../hooks/useRecurringTasks";
import { useSkeletonLoading } from "../hooks/useSkeletonLoading";
import type { Task } from "../types";
import {
  filterTasks,
  getPriorityColor,
  getTasksForDate,
  sortTasksByPriority,
} from "../utils";

type ViewMode = "month" | "week" | "day";

export default function Calendar() {
  const { state, dispatch } = useApp();
  const { tasks, isLoading } = useTasks();
  const { showSkeleton } = useSkeletonLoading(isLoading);
  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { markInstanceComplete } = useRecurringTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handlePrevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId, {
      onSuccess: () => {
        dispatch({ type: "COMPLETE_TASK", payload: taskId });
      },
    });
  };

  const handleUncompleteTask = (taskId: string) => {
    uncompleteTaskMutation.mutate(taskId, {
      onSuccess: () => {
        dispatch({ type: "UNCOMPLETE_TASK", payload: taskId });
      },
    });
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

    setCurrentDate(new Date(currentDate));
    if (selectedDate && isSameDay(selectedDate, date)) {
      setSelectedDate(new Date(selectedDate));
    }
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
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

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    const workspaceTasks = tasks.filter(
      (task) =>
        !state.activeWorkspaceId || task.workspaceId === state.activeWorkspaceId
    );
    const dateTasks = getTasksForDate(workspaceTasks, selectedDate);
    const filteredTasks = filterTasks(
      dateTasks,
      {
        id: "default",
        name: "Filtro Padrão",
        workspaceId: state.activeWorkspaceId,
        isCompleted: showCompleted ? undefined : false,
      },
      false
    );

    if (sortByPriority) {
      return sortTasksByPriority(filteredTasks);
    } else {
      return filteredTasks.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  };

  const getDayTasks = (date: Date) => {
    const filteredTasks = tasks.filter(
      (task) =>
        !state.activeWorkspaceId || task.workspaceId === state.activeWorkspaceId
    );
    return getTasksForDate(filteredTasks, date);
  };

  const getWeekTasks = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const filteredTasks = tasks.filter(
      (task) =>
        !state.activeWorkspaceId || task.workspaceId === state.activeWorkspaceId
    );

    return weekDays.map((day) => ({
      date: day,
      tasks: getTasksForDate(filteredTasks, day),
    }));
  };

  const getCurrentDayTasks = () => {
    const filteredTasks = tasks.filter(
      (task) =>
        !state.activeWorkspaceId || task.workspaceId === state.activeWorkspaceId
    );
    return getTasksForDate(filteredTasks, currentDate);
  };

  const getProductivityStats = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

    const workspaceTasks = tasks.filter(
      (task) =>
        !state.activeWorkspaceId || task.workspaceId === state.activeWorkspaceId
    );

    const todayTasks = getTasksForDate(workspaceTasks, today);

    const weekTasks: Task[] = [];
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    weekDays.forEach((day) => {
      const dayTasks = getTasksForDate(workspaceTasks, day);
      weekTasks.push(...dayTasks);
    });

    const todayCompleted = todayTasks.filter((task) => task.isCompleted).length;
    const todayPending = todayTasks.filter((task) => !task.isCompleted).length;
    const weekCompleted = weekTasks.filter((task) => task.isCompleted).length;
    const weekTotal = weekTasks.length;
    const weekProductivity =
      weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    return {
      todayCompleted,
      todayPending,
      weekCompleted,
      weekTotal,
      weekProductivity,
    };
  };

  const renderWeekView = () => {
    const weekTasks = getWeekTasks();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-bold"
            style={{ color: state.currentTheme.colors.text }}
          >
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} -{" "}
            {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <div
            className={`flex items-center ${
              isMobile ? "space-x-1" : "space-x-2"
            }`}
          >
            <button
              onClick={handlePrevWeek}
              className={`${isMobile ? "p-3" : "p-2"} rounded-lg ${
                isMobile ? "active:scale-95" : "hover:bg-opacity-10"
              } transition-colors`}
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
            >
              <ChevronLeft className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />
            </button>
            <button
              onClick={handleNextWeek}
              className={`${isMobile ? "p-3" : "p-2"} rounded-lg ${
                isMobile ? "active:scale-95" : "hover:bg-opacity-10"
              } transition-colors`}
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
            >
              <ChevronRight className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-7 ${isMobile ? "gap-1" : "gap-2"}`}>
          {weekTasks.map((dayData, index) => {
            const isToday = isSameDay(dayData.date, new Date());
            const isSelected =
              selectedDate && isSameDay(dayData.date, selectedDate);

            return (
              <button
                key={dayData.date.toISOString()}
                onClick={() => handleDateClick(dayData.date)}
                className={`${
                  isMobile ? "p-2" : "p-3"
                } rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isMobile ? "" : "hover:scale-105"
                } ${isToday ? "ring-2 ring-blue-400" : ""} ${
                  isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
                style={{
                  backgroundColor: isSelected
                    ? state.currentTheme.colors.primary + "30"
                    : isToday
                    ? state.currentTheme.colors.primary + "10"
                    : state.currentTheme.colors.surface,
                  borderColor: isSelected
                    ? state.currentTheme.colors.primary
                    : isToday
                    ? state.currentTheme.colors.primary + "80"
                    : state.currentTheme.colors.primary + "20",
                }}
              >
                <div className="text-center mb-2">
                  <div
                    className={`${
                      isMobile ? "text-xs" : "text-xs"
                    } font-medium mb-1`}
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][index]}
                  </div>
                  <div
                    className={`${
                      isMobile ? "text-base" : "text-lg"
                    } font-bold ${
                      isSelected ? "" : isToday ? "text-blue-600" : ""
                    }`}
                    style={{
                      color: isSelected
                        ? state.currentTheme.colors.primary
                        : isToday
                        ? state.currentTheme.colors.primary
                        : state.currentTheme.colors.text,
                    }}
                  >
                    {format(dayData.date, "d")}
                  </div>
                </div>

                <div className="space-y-1">
                  {isMobile ? (
                    <>
                      {dayData.tasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-center p-1 rounded"
                          style={{
                            backgroundColor: task.projectId
                              ? state.currentTheme.colors.primary + "20"
                              : getPriorityColor(task.priority) + "20",
                          }}
                        >
                          {task.isCompleted ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : task.projectId ? (
                            <CalendarIcon
                              className="w-3 h-3"
                              style={{
                                color: state.currentTheme.colors.primary,
                              }}
                            />
                          ) : (
                            <Clock
                              className="w-3 h-3"
                              style={{ color: getPriorityColor(task.priority) }}
                            />
                          )}
                        </div>
                      ))}
                      {dayData.tasks.length > 2 && (
                        <div
                          className="text-xs font-medium text-center"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          +{dayData.tasks.length - 2}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {dayData.tasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="text-xs p-1 rounded truncate flex items-center space-x-1"
                          style={{
                            backgroundColor: task.projectId
                              ? state.currentTheme.colors.primary + "20"
                              : getPriorityColor(task.priority) + "20",
                            color: task.projectId
                              ? state.currentTheme.colors.primary
                              : getPriorityColor(task.priority),
                            borderLeft: `3px solid ${
                              task.projectId
                                ? state.currentTheme.colors.primary
                                : getPriorityColor(task.priority)
                            }`,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: task.isCompleted
                                ? "#10b981"
                                : task.projectId
                                ? state.currentTheme.colors.primary
                                : getPriorityColor(task.priority),
                            }}
                          />
                          <span
                            className={
                              task.isCompleted ? "line-through opacity-70" : ""
                            }
                          >
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {dayData.tasks.length > 3 && (
                        <div
                          className="text-xs font-medium text-center"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          +{dayData.tasks.length - 3} tarefas
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayTasks = getCurrentDayTasks();
    const isToday = isSameDay(currentDate, new Date());

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-bold"
            style={{ color: state.currentTheme.colors.text }}
          >
            {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
            {isToday && (
              <span className="ml-2 text-sm font-normal text-blue-600">
                (Hoje)
              </span>
            )}
          </h2>
          <div
            className={`flex items-center ${
              isMobile ? "space-x-1" : "space-x-2"
            }`}
          >
            <button
              onClick={handlePrevDay}
              className={`${isMobile ? "p-3" : "p-2"} rounded-lg ${
                isMobile ? "active:scale-95" : "hover:bg-opacity-10"
              } transition-colors`}
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
            >
              <ChevronLeft className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />
            </button>
            <button
              onClick={handleNextDay}
              className={`${isMobile ? "p-3" : "p-2"} rounded-lg ${
                isMobile ? "active:scale-95" : "hover:bg-opacity-10"
              } transition-colors`}
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
            >
              <ChevronRight className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />
            </button>
          </div>
        </div>

        <div
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: isToday
              ? state.currentTheme.colors.primary + "80"
              : state.currentTheme.colors.primary + "20",
          }}
        >
          {dayTasks.length > 0 ? (
            <div className="space-y-2">
              {dayTasks.map((task) => {
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleCompleteTask}
                    onUncomplete={handleUncompleteTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onRecurringToggle={handleRecurringTaskToggle}
                    showProject={true}
                    showDate={false}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p
                className="text-base"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Nenhuma tarefa para este dia
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMonthView = () => (
    <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-bold"
          style={{ color: state.currentTheme.colors.text }}
        >
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div
          className={`flex items-center ${
            isMobile ? "space-x-1" : "space-x-2"
          }`}
        >
          <button
            onClick={handlePrevMonth}
            className={`${
              isMobile ? "p-3" : "p-2"
            } rounded-lg transition-all duration-200 ${
              isMobile ? "active:scale-95" : "hover:scale-110"
            } hover:shadow-md`}
            style={{
              background: `linear-gradient(135deg, ${state.currentTheme.colors.primary}25, ${state.currentTheme.colors.primary}15)`,
              color: state.currentTheme.colors.primary,
              boxShadow: `0 1px 3px ${state.currentTheme.colors.primary}20`,
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.primary}35, ${state.currentTheme.colors.primary}25)`;
                e.currentTarget.style.boxShadow = `0 2px 6px ${state.currentTheme.colors.primary}30`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.primary}25, ${state.currentTheme.colors.primary}15)`;
                e.currentTarget.style.boxShadow = `0 1px 3px ${state.currentTheme.colors.primary}20`;
              }
            }}
          >
            <ChevronLeft className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />
          </button>
          <button
            onClick={handleNextMonth}
            className={`${
              isMobile ? "p-3" : "p-2"
            } rounded-lg transition-all duration-200 ${
              isMobile ? "active:scale-95" : "hover:scale-110"
            } hover:shadow-md`}
            style={{
              background: `linear-gradient(135deg, ${state.currentTheme.colors.primary}25, ${state.currentTheme.colors.primary}15)`,
              color: state.currentTheme.colors.primary,
              boxShadow: `0 1px 3px ${state.currentTheme.colors.primary}20`,
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.primary}35, ${state.currentTheme.colors.primary}25)`;
                e.currentTarget.style.boxShadow = `0 2px 6px ${state.currentTheme.colors.primary}30`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.primary}25, ${state.currentTheme.colors.primary}15)`;
                e.currentTarget.style.boxShadow = `0 1px 3px ${state.currentTheme.colors.primary}20`;
              }
            }}
          >
            <ChevronRight className={`${isMobile ? "w-5 h-5" : "w-4 h-4"}`} />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-7 ${isMobile ? "gap-0.5" : "gap-1"}`}>
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className={`${isMobile ? "p-1" : "p-2"} text-center font-medium ${
              isMobile ? "text-xs" : "text-xs"
            }`}
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            {isMobile ? day.charAt(0) : day}
          </div>
        ))}

        {calendarDays.map((day) => {
          const dayTasks = getDayTasks(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isPastDay = day < new Date() && !isToday;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={`${isMobile ? "p-1" : "p-2"} ${
                isMobile ? "min-h-[50px]" : "min-h-[70px]"
              } text-left rounded-lg transition-all duration-300 cursor-pointer ${
                isMobile ? "" : "hover:scale-105"
              } ${!isCurrentMonth ? "opacity-30" : ""} ${
                isPastDay ? "opacity-60" : ""
              } ${isToday ? "ring-2 ring-blue-400" : ""} ${
                isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
              }`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${state.currentTheme.colors.primary}30, ${state.currentTheme.colors.primary}20)`
                  : isToday
                  ? `linear-gradient(135deg, ${state.currentTheme.colors.primary}15, ${state.currentTheme.colors.primary}08)`
                  : isWeekend
                  ? `linear-gradient(135deg, ${state.currentTheme.colors.surface}, ${state.currentTheme.colors.border}20)`
                  : state.currentTheme.colors.surface,
                color: isCurrentMonth
                  ? state.currentTheme.colors.text
                  : state.currentTheme.colors.textSecondary,
                border: isSelected
                  ? `2px solid ${state.currentTheme.colors.primary}`
                  : isToday
                  ? `2px solid ${state.currentTheme.colors.primary}80`
                  : isWeekend
                  ? `1px solid ${state.currentTheme.colors.border}40`
                  : "2px solid transparent",
                transform: isSelected ? "scale(1.02)" : "scale(1)",
                boxShadow: isSelected
                  ? `0 4px 12px ${state.currentTheme.colors.primary}30`
                  : isWeekend
                  ? `0 1px 3px ${state.currentTheme.colors.border}20`
                  : "none",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isMobile && !isSelected && isCurrentMonth) {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.primary}20, ${state.currentTheme.colors.primary}10)`;
                  e.currentTarget.style.borderColor =
                    state.currentTheme.colors.primary + "40";
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile && !isSelected && isCurrentMonth) {
                  e.currentTarget.style.background = isWeekend
                    ? `linear-gradient(135deg, ${state.currentTheme.colors.surface}, ${state.currentTheme.colors.border}20)`
                    : state.currentTheme.colors.surface;
                  e.currentTarget.style.borderColor = isWeekend
                    ? `${state.currentTheme.colors.border}40`
                    : "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <div
                className={`font-semibold ${isMobile ? "mb-0.5" : "mb-1"} ${
                  isMobile ? "text-xs" : "text-sm"
                } ${isSelected ? "" : isToday ? "text-blue-600" : ""}`}
                style={{
                  color: isSelected
                    ? state.currentTheme.colors.primary
                    : isToday
                    ? state.currentTheme.colors.primary
                    : isCurrentMonth
                    ? state.currentTheme.colors.text
                    : state.currentTheme.colors.textSecondary,
                }}
              >
                {format(day, "d")}
              </div>

              {dayTasks.length > 0 && (
                <div className={`${isMobile ? "space-y-0" : "space-y-0.5"}`}>
                  {isMobile ? (
                    <>
                      {dayTasks.slice(0, 1).map((task, index) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-center p-0.5 rounded transition-all duration-200 hover:scale-110"
                          style={{
                            background: task.projectId
                              ? `linear-gradient(135deg, ${state.currentTheme.colors.primary}25, ${state.currentTheme.colors.primary}15)`
                              : `linear-gradient(135deg, ${getPriorityColor(
                                  task.priority
                                )}25, ${getPriorityColor(task.priority)}15)`,
                            boxShadow: `0 1px 3px ${
                              task.projectId
                                ? state.currentTheme.colors.primary
                                : getPriorityColor(task.priority)
                            }20`,
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          {task.isCompleted ? (
                            <CheckCircle className="w-2.5 h-2.5 text-green-500 animate-pulse" />
                          ) : task.projectId ? (
                            <CalendarIcon
                              className="w-2.5 h-2.5 transition-colors duration-200"
                              style={{
                                color: state.currentTheme.colors.primary,
                              }}
                            />
                          ) : (
                            <Clock
                              className="w-2.5 h-2.5 transition-colors duration-200"
                              style={{ color: getPriorityColor(task.priority) }}
                            />
                          )}
                        </div>
                      ))}
                      {dayTasks.length > 1 && (
                        <div
                          className="text-xs font-medium text-center transition-all duration-200 hover:scale-105"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          +{dayTasks.length - 1}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {dayTasks.slice(0, 2).map((task, index) => (
                        <div
                          key={task.id}
                          className="text-xs p-1 rounded truncate flex items-center space-x-1 transition-all duration-200 hover:scale-105 hover:shadow-md"
                          style={{
                            background: task.projectId
                              ? `linear-gradient(135deg, ${state.currentTheme.colors.primary}25, ${state.currentTheme.colors.primary}15)`
                              : `linear-gradient(135deg, ${getPriorityColor(
                                  task.priority
                                )}25, ${getPriorityColor(task.priority)}15)`,
                            color: task.projectId
                              ? state.currentTheme.colors.primary
                              : getPriorityColor(task.priority),
                            borderLeft: `3px solid ${
                              task.projectId
                                ? state.currentTheme.colors.primary
                                : getPriorityColor(task.priority)
                            }`,
                            boxShadow: `0 1px 3px ${
                              task.projectId
                                ? state.currentTheme.colors.primary
                                : getPriorityColor(task.priority)
                            }20`,
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                            style={{
                              backgroundColor: task.isCompleted
                                ? "#10b981"
                                : task.projectId
                                ? state.currentTheme.colors.primary
                                : getPriorityColor(task.priority),
                              boxShadow: task.isCompleted
                                ? "0 0 4px #10b981"
                                : `0 0 4px ${
                                    task.projectId
                                      ? state.currentTheme.colors.primary
                                      : getPriorityColor(task.priority)
                                  }40`,
                            }}
                          />
                          <span
                            className={`transition-all duration-200 ${
                              task.isCompleted ? "line-through opacity-70" : ""
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div
                          className="text-xs font-medium transition-all duration-200 hover:scale-105"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          +{dayTasks.length - 2} tarefas
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (showSkeleton) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: state.currentTheme.colors.text }}
        >
          Calendário
        </h1>
        <button
          onClick={handleCreateTask}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${state.currentTheme.colors.primary}, ${state.currentTheme.colors.primary}dd)`,
            color: "white",
            boxShadow: `0 2px 8px ${state.currentTheme.colors.primary}30`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.primary}ee, ${state.currentTheme.colors.primary}cc)`;
            e.currentTarget.style.boxShadow = `0 4px 12px ${state.currentTheme.colors.primary}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.primary}, ${state.currentTheme.colors.primary}dd)`;
            e.currentTarget.style.boxShadow = `0 2px 8px ${state.currentTheme.colors.primary}30`;
          }}
        >
          <Plus className="w-4 h-4 transition-transform duration-200" />
          <span className="hidden sm:inline">Nova Tarefa</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div
          className="flex items-center space-x-2 border p-2 rounded-lg"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <CheckCircle
            className="w-4 h-4"
            style={{ color: state.currentTheme.colors.primary }}
          />
          <span style={{ color: state.currentTheme.colors.textSecondary }}>
            Hoje:
          </span>
          <span className="font-medium text-black">
            {getProductivityStats().todayCompleted} concluídas
          </span>
        </div>
        <div
          className="flex items-center space-x-2 border p-2 rounded-lg"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <Clock
            className="w-4 h-4"
            style={{ color: state.currentTheme.colors.primary }}
          />
          <span style={{ color: state.currentTheme.colors.textSecondary }}>
            Pendentes:
          </span>
          <span className="font-medium text-black">
            {getProductivityStats().todayPending}
          </span>
        </div>
        <div
          className="flex items-center space-x-2 border p-2 rounded-lg"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <TrendingUp
            className="w-4 h-4"
            style={{ color: state.currentTheme.colors.primary }}
          />
          <span style={{ color: state.currentTheme.colors.textSecondary }}>
            Semana:
          </span>
          <span className="font-medium text-black">
            {getProductivityStats().weekProductivity}% produtividade
          </span>
        </div>
        <div
          className="flex items-center space-x-2 border p-2 rounded-lg"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <BarChart3
            className="w-4 h-4"
            style={{ color: state.currentTheme.colors.primary }}
          />
          <span style={{ color: state.currentTheme.colors.textSecondary }}>
            Total:
          </span>
          <span
            className="font-medium"
            style={{ color: state.currentTheme.colors.text }}
          >
            {getProductivityStats().weekTotal} tarefas
          </span>
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
      </div>

      <div className="flex items-center justify-center">
        <div
          className={`flex ${
            isMobile ? "space-x-1" : "space-x-1"
          } p-1 rounded-xl border-2 relative overflow-hidden`}
          style={{
            borderColor: state.currentTheme.colors.border,
            backgroundColor: state.currentTheme.colors.surface + "50",
          }}
        >
          <div className="absolute bottom-0 left-0 h-1 rounded-full transition-all duration-500" />
          {(["month", "week", "day"] as ViewMode[]).map((mode) => {
            const isActive = viewMode === mode;
            const modeLabels = {
              month: { label: "Mês" },
              week: { label: "Semana" },
              day: { label: "Dia" },
            };

            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`relative flex items-center space-x-2 ${
                  isMobile ? "px-3 py-2" : "px-4 py-2.5"
                } rounded-lg font-medium transition-all duration-300 ${
                  isMobile ? "text-xs" : "text-sm"
                } ${
                  isMobile ? "active:scale-95" : "hover:scale-105"
                } overflow-hidden`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${state.currentTheme.colors.primary}, ${state.currentTheme.colors.primary}dd)`
                    : `linear-gradient(135deg, ${state.currentTheme.colors.surface}, ${state.currentTheme.colors.surface}dd)`,
                  color: isActive ? "white" : state.currentTheme.colors.text,
                  boxShadow: isActive
                    ? `0 2px 8px ${state.currentTheme.colors.primary}30`
                    : `0 1px 3px ${state.currentTheme.colors.border}20`,
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  zIndex: isActive ? 10 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isMobile && !isActive) {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.primary}15, ${state.currentTheme.colors.primary}08)`;
                    e.currentTarget.style.boxShadow = `0 2px 6px ${state.currentTheme.colors.primary}20`;
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile && !isActive) {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${state.currentTheme.colors.surface}, ${state.currentTheme.colors.surface}dd)`;
                    e.currentTarget.style.boxShadow = `0 1px 3px ${state.currentTheme.colors.border}20`;
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                {/* Indicador de ativo */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-lg opacity-20"
                    style={{
                      background: `linear-gradient(45deg, transparent 30%, ${state.currentTheme.colors.primary}20 50%, transparent 70%)`,
                      animation: "shimmer 2s infinite",
                    }}
                  />
                )}

                {/* Ícone */}
                <span className="text-sm">
                  {
                    (
                      modeLabels[mode as keyof typeof modeLabels] as {
                        label: string;
                        icon: string;
                      }
                    ).icon
                  }
                </span>

                {/* Label */}
                <span className="font-semibold">
                  {modeLabels[mode as keyof typeof modeLabels].label}
                </span>

                {isActive && (
                  <div
                    className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold animate-in fade-in-0 zoom-in-50 duration-300"
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      color: "white",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {mode === "month"
                      ? calendarDays.reduce(
                          (acc, day) => acc + getDayTasks(day).length,
                          0
                        )
                      : mode === "week"
                      ? calendarDays
                          .slice(0, 7)
                          .reduce(
                            (acc, day) => acc + getDayTasks(day).length,
                            0
                          )
                      : getDayTasks(currentDate).length}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}

      {selectedDate && (viewMode === "month" || viewMode === "week") ? (
        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.primary + "30",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-semibold"
              style={{ color: state.currentTheme.colors.text }}
            >
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortByPriority(!sortByPriority)}
                className="flex items-center gap-1 text-sm px-3 py-1 rounded-full transition-colors"
                style={{
                  backgroundColor: sortByPriority
                    ? state.currentTheme.colors.primary + "20"
                    : state.currentTheme.colors.surface + "50",
                  color: sortByPriority
                    ? state.currentTheme.colors.primary
                    : state.currentTheme.colors.textSecondary,
                }}
                title={
                  sortByPriority
                    ? "Ordenar por data de criação"
                    : "Ordenar por prioridade"
                }
              >
                <ArrowUpDown size={14} />
                {sortByPriority ? "Prioridade" : "Data"}
              </button>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm px-3 py-1 rounded-full transition-colors"
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "20",
                  color: state.currentTheme.colors.primary,
                }}
              >
                Fechar
              </button>
            </div>
          </div>

          {getTasksForSelectedDate().length > 0 ? (
            <div className="space-y-2">
              {getTasksForSelectedDate().map((task) => {
                return (
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
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p
                className="text-base"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Nenhuma tarefa para este dia
              </p>
            </div>
          )}
        </div>
      ) : viewMode === "month" ? (
        <div
          className="mt-6 p-4 rounded-lg text-center"
          style={{
            backgroundColor: state.currentTheme.colors.surface + "50",
          }}
        >
          <p
            className="text-base"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Clique em um dia para ver as tarefas
          </p>
        </div>
      ) : viewMode === "week" ? (
        <div
          className="mt-6 p-4 rounded-lg text-center"
          style={{
            backgroundColor: state.currentTheme.colors.surface + "50",
          }}
        >
          <p
            className="text-base"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Clique em um dia para ver as tarefas
          </p>
        </div>
      ) : null}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
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
    </div>
  );
}
