import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useApp } from "../context/AppContext";
import { useTasks } from "../features/tasks/useTasks";
import { getOverdueTasks } from "../utils";

interface TaskOverviewProps {
  className?: string;
}

export default function TaskOverview({ className = "" }: TaskOverviewProps) {
  const { state } = useApp();
  const { tasks } = useTasks();

  const filteredTasks = tasks.filter(
    (task) => task.workspaceId === state.activeWorkspaceId
  );

  const overdueTasks = getOverdueTasks(filteredTasks);

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (task) => task.isCompleted
  ).length;
  const pendingTasks = filteredTasks.filter((task) => !task.isCompleted).length;

  const chartData = [
    { name: "Concluídas", value: completedTasks, color: "#f97316" },
    { name: "Pendentes", value: pendingTasks, color: "#fb923c" },
    { name: "Atrasadas", value: overdueTasks.length, color: "#f3f4f6" },
  ].filter((item) => item.value > 0);

  // Se não há dados, mostrar um estado vazio
  const hasData = chartData.length > 0;

  const totalUniqueTasks = totalTasks;

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}
    >
      <h3
        className="text-lg font-semibold mb-6"
        style={{ color: state.currentTheme.colors.text }}
      >
        Visão Geral das Tarefas
      </h3>

      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          {hasData ? (
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-[120px] h-[120px] flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="text-2xl text-gray-400">📊</div>
              </div>
            </div>
          )}
          <div className="text-center mt-2">
            <div
              className="text-2xl font-bold"
              style={{ color: state.currentTheme.colors.text }}
            >
              {totalUniqueTasks}
            </div>
            <div className="text-xs text-gray-500">Tarefas Únicas</div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500 mb-1">Total de Tarefas</div>
              <div
                className="text-lg font-bold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {totalTasks}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-orange-300 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500 mb-1">Total Devidas</div>
              <div
                className="text-lg font-bold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {pendingTasks}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500 mb-1">Concluídas</div>
              <div
                className="text-lg font-bold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {completedTasks}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
