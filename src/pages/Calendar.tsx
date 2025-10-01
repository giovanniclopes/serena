import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import TaskCard from "../components/TaskCard";
import { useApp } from "../context/AppContext";
import { useTasks } from "../features/tasks/useTasks";
import { getPriorityColor, getTasksForDate } from "../utils";

type ViewMode = "month" | "week" | "day";

export default function Calendar() {
  const { state, dispatch } = useApp();
  const { tasks, isLoading } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getTasksForSelectedDate = () => {
    if (!selectedDate) return [];
    const filteredTasks = tasks.filter(
      (task) =>
        !state.activeWorkspaceId || task.workspaceId === state.activeWorkspaceId
    );
    return getTasksForDate(filteredTasks, selectedDate);
  };

  const getDayTasks = (date: Date) => {
    const filteredTasks = tasks.filter(
      (task) =>
        !state.activeWorkspaceId || task.workspaceId === state.activeWorkspaceId
    );
    return getTasksForDate(filteredTasks, date);
  };

  const renderMonthView = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-bold"
          style={{ color: state.currentTheme.colors.text }}
        >
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "20",
              color: state.currentTheme.colors.primary,
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "20",
              color: state.currentTheme.colors.primary,
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="p-2 text-center font-medium text-xs"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            {day}
          </div>
        ))}

        {monthDays.map((day) => {
          const dayTasks = getDayTasks(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={`p-2 min-h-[70px] text-left rounded-lg transition-colors ${
                !isCurrentMonth ? "opacity-30" : ""
              } ${isToday ? "ring-2" : ""} ${isSelected ? "ring-2" : ""}`}
              style={{
                backgroundColor: isSelected
                  ? state.currentTheme.colors.primary + "20"
                  : state.currentTheme.colors.surface,
                color: isCurrentMonth
                  ? state.currentTheme.colors.text
                  : state.currentTheme.colors.textSecondary,
                ...(isToday || isSelected
                  ? {
                      borderColor: state.currentTheme.colors.primary,
                    }
                  : {}),
              }}
            >
              <div className="font-medium mb-1 text-sm">{format(day, "d")}</div>

              {dayTasks.length > 0 && (
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 2).map((task) => (
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
                  {dayTasks.length > 2 && (
                    <div
                      className="text-xs font-medium"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      +{dayTasks.length - 2} tarefas
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="text-lg"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Carregando calendário...
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
          Calendário
        </h1>
        <button
          className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          style={{
            backgroundColor: state.currentTheme.colors.primary,
            color: "white",
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      <div className="flex space-x-2">
        {(["month", "week", "day"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              viewMode === mode ? "text-white" : ""
            }`}
            style={{
              backgroundColor:
                viewMode === mode
                  ? state.currentTheme.colors.primary
                  : state.currentTheme.colors.surface,
              color:
                viewMode === mode ? "white" : state.currentTheme.colors.text,
            }}
          >
            {mode === "month" ? "Mês" : mode === "week" ? "Semana" : "Dia"}
          </button>
        ))}
      </div>

      {viewMode === "month" && renderMonthView()}

      {selectedDate && (
        <div className="mt-4">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: state.currentTheme.colors.text }}
          >
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>

          {getTasksForSelectedDate().length > 0 ? (
            <div className="space-y-2">
              {getTasksForSelectedDate().map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={(taskId) =>
                    dispatch({ type: "COMPLETE_TASK", payload: taskId })
                  }
                  showProject={true}
                  showDate={true}
                />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-6 rounded-lg"
              style={{ backgroundColor: state.currentTheme.colors.surface }}
            >
              <p
                className="text-base"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Nenhuma tarefa para este dia
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
