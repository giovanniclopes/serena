import {
  Calendar,
  Edit,
  Paperclip,
  RotateCcw,
  Tag,
  Trash2,
} from "lucide-react";
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
import { Checkbox } from "./ui/checkbox";
import { MobileButton } from "./ui/mobile-button";
import { MobileCard } from "./ui/mobile-card";
import { useMobileSpacing } from "./ui/mobile-spacing";
import { ResponsiveText } from "./ui/responsive-text";

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onUncomplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  showProject?: boolean;
  showDate?: boolean;
  isBulkDeleteMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (taskId: string, selected: boolean) => void;
}

export default function TaskCard({
  task,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
  showProject = true,
  showDate = true,
  isBulkDeleteMode = false,
  isSelected = false,
  onSelectionChange,
}: TaskCardProps) {
  const { state } = useApp();
  const { spacing, touchTarget, isMobile } = useMobileSpacing();

  const project = state.projects.find((p) => p.id === task.projectId);
  const taskTags = state.tags.filter((tag) => task.tags.includes(tag.id));

  const handleToggleComplete = () => {
    if (task.isCompleted) {
      if (onUncomplete) {
        onUncomplete(task.id);
      }
    } else {
      if (onComplete) {
        onComplete(task.id);
      }
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleSelectionChange = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(task.id, checked);
    }
  };

  return (
    <MobileCard
      className={`transition-all duration-200 ${
        task.isCompleted ? "opacity-60" : "hover:shadow-md"
      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      padding="md"
    >
      <div
        className="flex flex-col md:items-start md:flex-row"
        style={{ gap: spacing.sm }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start md:gap-3 justify-between">
            {isBulkDeleteMode ? (
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelectionChange}
                className="flex-shrink-0"
                style={{
                  minWidth: touchTarget,
                  minHeight: touchTarget,
                }}
              />
            ) : (
              <Checkbox
                checked={task.isCompleted}
                onCheckedChange={handleToggleComplete}
                className="flex-shrink-0"
                style={{
                  minWidth: touchTarget,
                  minHeight: touchTarget,
                }}
              />
            )}
            <ResponsiveText
              variant="h4"
              weight="medium"
              className={`flex-1 ${task.isCompleted ? "line-through" : ""}`}
              style={{ color: state.currentTheme.colors.text }}
            >
              {task.title}
            </ResponsiveText>

            <div
              className="flex items-center"
              style={{ gap: spacing.xs, marginLeft: spacing.sm }}
            >
              <div className="hidden md:block">
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: getPriorityColor(task.priority) + "20",
                    color: getPriorityColor(task.priority),
                    borderColor: getPriorityColor(task.priority),
                    fontSize: isMobile ? "0.75rem" : "0.6875rem",
                    padding: isMobile ? "0.25rem 0.5rem" : "0.125rem 0.375rem",
                  }}
                >
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
              {!isBulkDeleteMode && onEdit && (
                <MobileButton
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  style={{
                    minWidth: touchTarget,
                    minHeight: touchTarget,
                    padding: 0,
                  }}
                >
                  <Edit className={isMobile ? "w-4 h-4" : "w-3 h-3"} />
                </MobileButton>
              )}
              {!isBulkDeleteMode && onDelete && (
                <MobileButton
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  style={{
                    minWidth: touchTarget,
                    minHeight: touchTarget,
                    padding: 0,
                    color: state.currentTheme.colors.error,
                  }}
                >
                  <Trash2 className={isMobile ? "w-4 h-4" : "w-3 h-3"} />
                </MobileButton>
              )}
            </div>
          </div>

          {task.description && (
            <ResponsiveText
              variant="caption"
              color="secondary"
              className="mt-1"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              {task.description}
            </ResponsiveText>
          )}

          <div
            className="flex items-center flex-wrap"
            style={{ gap: spacing.md, marginTop: spacing.sm }}
          >
            {showProject && project && (
              <div className="flex items-center" style={{ gap: spacing.xs }}>
                <div
                  className="rounded-full"
                  style={{
                    backgroundColor: project.color,
                    width: isMobile ? "8px" : "6px",
                    height: isMobile ? "8px" : "6px",
                  }}
                />
                <ResponsiveText
                  variant="caption"
                  color="secondary"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {project.name}
                </ResponsiveText>
              </div>
            )}

            <div className="block md:hidden">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: getPriorityColor(task.priority) + "20",
                  color: getPriorityColor(task.priority),
                  borderColor: getPriorityColor(task.priority),
                  fontSize: isMobile ? "0.75rem" : "0.6875rem",
                  padding: isMobile ? "0.25rem 0.5rem" : "0.125rem 0.375rem",
                }}
              >
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>

            {showDate && task.dueDate && (
              <div className="flex items-center" style={{ gap: spacing.xs }}>
                <Calendar
                  className={isMobile ? "w-4 h-4" : "w-3 h-3"}
                  style={{ color: state.currentTheme.colors.textSecondary }}
                />
                <ResponsiveText
                  variant="caption"
                  color="secondary"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {formatDate(task.dueDate)}
                  {task.dueDate.getHours() !== 0 &&
                    ` às ${formatTime(task.dueDate)}`}
                </ResponsiveText>
              </div>
            )}

            {taskTags.length > 0 && (
              <div className="flex items-center" style={{ gap: spacing.xs }}>
                <Tag
                  className={isMobile ? "w-4 h-4" : "w-3 h-3"}
                  style={{ color: state.currentTheme.colors.textSecondary }}
                />
                <div className="flex flex-wrap" style={{ gap: spacing.xs }}>
                  {taskTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{
                        backgroundColor: tag.color + "20",
                        color: tag.color,
                        borderColor: tag.color,
                        fontSize: isMobile ? "0.75rem" : "0.6875rem",
                        padding: isMobile
                          ? "0.25rem 0.5rem"
                          : "0.125rem 0.375rem",
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(task.attachments.length > 0 || task.recurrence) && (
            <div
              className="flex items-center flex-wrap"
              style={{ gap: spacing.md, marginTop: spacing.sm }}
            >
              {task.attachments.length > 0 && (
                <div className="flex items-center" style={{ gap: spacing.xs }}>
                  <Paperclip
                    className={isMobile ? "w-4 h-4" : "w-3 h-3"}
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  />
                  <ResponsiveText
                    variant="caption"
                    color="secondary"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {task.attachments.length} anexo
                    {task.attachments.length !== 1 ? "s" : ""}
                  </ResponsiveText>
                </div>
              )}

              {task.recurrence && (
                <div className="flex items-center" style={{ gap: spacing.xs }}>
                  <RotateCcw
                    className={isMobile ? "w-4 h-4" : "w-3 h-3"}
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  />
                  <ResponsiveText
                    variant="caption"
                    color="secondary"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    Repetir
                  </ResponsiveText>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: spacing.sm }}>
            <SubtaskManager taskId={task.id} workspaceId={task.workspaceId} />
          </div>
        </div>
      </div>
    </MobileCard>
  );
}
