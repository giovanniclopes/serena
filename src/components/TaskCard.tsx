import { Calendar, Check, Edit, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Task } from "../types";
import {
  formatDate,
  formatTime,
  getPriorityColor,
  getPriorityLabel,
} from "../utils";

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  showProject?: boolean;
  showDate?: boolean;
}

export default function TaskCard({
  task,
  onComplete,
  onEdit,
  showProject = true,
  showDate = true,
}: TaskCardProps) {
  const { state } = useApp();

  const project = state.projects.find((p) => p.id === task.projectId);
  const taskTags = state.tags.filter((tag) => task.tags.includes(tag.id));

  const handleComplete = () => {
    if (onComplete) {
      onComplete(task.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all duration-200 ${
        task.isCompleted ? "opacity-60" : "hover:shadow-md"
      }`}
      style={{
        backgroundColor: state.currentTheme.colors.surface,
        borderColor: state.currentTheme.colors.border,
      }}
    >
      <div className="flex items-start space-x-2">
        <button
          onClick={handleComplete}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.isCompleted
              ? "border-green-500 bg-green-500"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {task.isCompleted && <Check className="w-3 h-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3
              className={`font-medium text-sm ${
                task.isCompleted ? "line-through" : ""
              }`}
              style={{ color: state.currentTheme.colors.text }}
            >
              {task.title}
            </h3>

            <div className="flex items-center space-x-1 ml-2">
              <span
                className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: getPriorityColor(task.priority) + "20",
                  color: getPriorityColor(task.priority),
                }}
              >
                {getPriorityLabel(task.priority)}
              </span>
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-1 rounded hover:bg-opacity-10 transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.primary + "20",
                    color: state.currentTheme.colors.primary,
                  }}
                >
                  <Edit className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p
              className="mt-1 text-xs"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center space-x-3 mt-2">
            {showProject && project && (
              <div className="flex items-center space-x-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {project.name}
                </span>
              </div>
            )}

            {showDate && task.dueDate && (
              <div className="flex items-center space-x-1">
                <Calendar
                  className="w-3 h-3"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                />
                <span
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {formatDate(task.dueDate)}
                  {task.dueDate.getHours() !== 0 &&
                    ` às ${formatTime(task.dueDate)}`}
                </span>
              </div>
            )}

            {taskTags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Tag
                  className="w-3 h-3"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                />
                <div className="flex space-x-1">
                  {taskTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-1.5 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: tag.color + "20",
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: state.currentTheme.colors.primary,
                      width: `${
                        (task.subtasks.filter((st) => st.isCompleted).length /
                          task.subtasks.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {task.subtasks.filter((st) => st.isCompleted).length}/
                  {task.subtasks.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
