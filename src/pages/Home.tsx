import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle, Clock, Target } from "lucide-react";
import { useState } from "react";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { useApp } from "../context/AppContext";
import type { Task } from "../types";
import { getOverdueTasks, getTodayTasks, getUpcomingTasks } from "../utils";

export default function Home() {
  const { state, dispatch, loading, error } = useApp();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

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

  const todayTasks = getTodayTasks(state.tasks);
  const overdueTasks = getOverdueTasks(state.tasks);
  const upcomingTasks = getUpcomingTasks(state.tasks, 7);

  const handleCompleteTask = (taskId: string) => {
    dispatch({ type: "COMPLETE_TASK", payload: taskId });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingTask) {
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          ...editingTask,
          ...taskData,
          updatedAt: new Date(),
        },
      });
    } else {
      dispatch({
        type: "ADD_TASK",
        payload: {
          ...taskData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
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
      value: state.habits.length,
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
    <div className="space-y-4">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: state.currentTheme.colors.text }}
        >
          Olá! 👋
        </h1>
        <p
          className="text-base"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-3 rounded-lg"
            style={{ backgroundColor: state.currentTheme.colors.surface }}
          >
            <div className="flex items-center space-x-2">
              <div
                className="p-1.5 rounded-md"
                style={{ backgroundColor: stat.color + "20" }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs"
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
          <h2
            className="text-lg font-semibold mb-3"
            style={{ color: state.currentTheme.colors.error }}
          >
            ⚠️ Tarefas Atrasadas
          </h2>
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
        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: state.currentTheme.colors.text }}
        >
          📅 Tarefas de Hoje
        </h2>
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
          <div
            className="text-center py-6 rounded-lg"
            style={{ backgroundColor: state.currentTheme.colors.surface }}
          >
            <p
              className="text-base"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              🎉 Nenhuma tarefa para hoje!
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Que tal aproveitar para relaxar ou planejar o futuro?
            </p>
          </div>
        )}
      </div>

      {upcomingTasks.length > 0 && (
        <div>
          <h2
            className="text-lg font-semibold mb-3"
            style={{ color: state.currentTheme.colors.text }}
          >
            🔮 Próximos 7 dias
          </h2>
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

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}
