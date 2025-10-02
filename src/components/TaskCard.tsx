import { Calendar, Edit, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Task } from "../types";
import {
  formatDate,
  formatTime,
  getPriorityColor,
  getPriorityLabel,
} from "../utils";
import SubtaskManager from "./SubtaskManager";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

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
    <Card
      className={`transition-all duration-200 ${
        task.isCompleted ? "opacity-60" : "hover:shadow-md"
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-2">
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={handleComplete}
            className="flex-shrink-0"
          />

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
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: getPriorityColor(task.priority) + "20",
                    color: getPriorityColor(task.priority),
                    borderColor: getPriorityColor(task.priority),
                  }}
                >
                  {getPriorityLabel(task.priority)}
                </Badge>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    className="h-6 w-6"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
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
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: tag.color + "20",
                          color: tag.color,
                          borderColor: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <SubtaskManager taskId={task.id} workspaceId={task.workspaceId} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
