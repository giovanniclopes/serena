import { Clock, Play, Square } from "lucide-react";
import { useTaskTimer } from "../hooks/useTaskTimer";
import type { Task } from "../types";

interface TaskTimerProps {
  task: Task;
  variant?: "compact" | "full";
  showTotal?: boolean;
}

export default function TaskTimer({
  task,
  variant = "compact",
  showTotal = true,
}: TaskTimerProps) {
  const {
    isRunning,
    elapsedTime,
    totalTimeSpent,
    handleStart,
    handleStop,
    formatTime,
    formatTotalTime,
    isStarting,
    isStopping,
  } = useTaskTimer(task);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        {showTotal && totalTimeSpent > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{formatTotalTime(totalTimeSpent)}</span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isRunning) {
              handleStop();
            } else {
              handleStart();
            }
          }}
          disabled={isStarting || isStopping}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-200
            ${
              isRunning
                ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
                : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={isRunning ? "Parar cronômetro" : "Iniciar cronômetro"}
        >
          {isRunning ? (
            <>
              <Square className="h-3 w-3" />
              <span>{formatTime(elapsedTime)}</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              <span>Timer</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Tempo de Execução
          </h3>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isRunning) {
              handleStop();
            } else {
              handleStart();
            }
          }}
          disabled={isStarting || isStopping}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-all duration-200
            ${
              isRunning
                ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isRunning ? (
            <>
              <Square className="h-4 w-4" />
              <span>Parar</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Iniciar</span>
            </>
          )}
        </button>
      </div>

      {isRunning && (
        <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Tempo da Sessão Atual
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatTime(elapsedTime)}
            </p>
          </div>
        </div>
      )}

      {totalTimeSpent > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Tempo Total Gasto
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatTotalTime(totalTimeSpent)}
          </span>
        </div>
      )}

      {task.timeEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Histórico de Sessões ({task.timeEntries.length})
          </h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {task.timeEntries
              .slice()
              .reverse()
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(entry.startedAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {entry.endedAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        até{" "}
                        {new Date(entry.endedAt).toLocaleString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTotalTime(entry.duration)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
