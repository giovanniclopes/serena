import {
  Calendar,
  Edit,
  MoreVertical,
  Paperclip,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Task } from "../types";
import { formatDate, getPriorityColor, getPriorityLabel } from "../utils";
import { extractOriginalTaskId } from "../utils/taskUtils";
import ActionsMenu from "./ActionsMenu";
import SubtaskManager from "./SubtaskManager";
import TaskTimer from "./TaskTimer";
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
  onDelete?: (task: Task) => void;
  onExport?: (task: Task) => void;
  onShare?: (task: Task) => void;
  onGeneratePrompt?: (task: Task) => void;
  onAddToGoogleCalendar?: (task: Task) => void;
  showProject?: boolean;
  showDate?: boolean;
  isBulkDeleteMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (taskId: string, selected: boolean) => void;
  onRecurringToggle?: (
    taskId: string,
    date: Date,
    isCompleted: boolean,
  ) => void;
  viewMode?: "list" | "grid";
}

export default function TaskCard({
  task,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
  onExport,
  onShare,
  onGeneratePrompt,
  onAddToGoogleCalendar,
  showProject = true,
  showDate = true,
  isBulkDeleteMode = false,
  isSelected = false,
  onSelectionChange,
  onRecurringToggle,
  viewMode = "list",
}: TaskCardProps) {
  const { state } = useApp();
  const { spacing, touchTarget, isMobile } = useMobileSpacing();

  const project = state.projects.find((p) => p.id === task.projectId);
  const taskTags = state.tags.filter((tag) => task.tags.includes(tag.id));

  const handleToggleComplete = () => {
    const isRecurringTask = task.recurrence !== undefined;

    if (isRecurringTask && onRecurringToggle && task.dueDate) {
      const originalTaskId = extractOriginalTaskId(task.id);
      onRecurringToggle(originalTaskId, task.dueDate, !task.isCompleted);
    } else if (task.isCompleted) {
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
      onDelete(task);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(task);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(task);
    }
  };

  const handleGeneratePrompt = () => {
    if (onGeneratePrompt) {
      onGeneratePrompt(task);
    }
  };

  const handleAddToGoogleCalendar = () => {
    if (onAddToGoogleCalendar) {
      onAddToGoogleCalendar(task);
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
      padding="lg"
      onDoubleClick={(e) => {
        if (
          (e.target as HTMLElement).closest("button") ||
          (e.target as HTMLElement).closest("input") ||
          (e.target as HTMLElement).closest('[role="button"]')
        ) {
          return;
        }
        if (!isBulkDeleteMode && onEdit) {
          handleEdit();
        }
      }}
    >
      <div className="space-y-4">
        {/* Header: Checkbox + Título */}
        <div className="flex items-start gap-3">
          {isBulkDeleteMode ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectionChange}
              className="flex-shrink-0 mt-0.5"
              style={{
                minWidth: touchTarget,
                minHeight: touchTarget,
              }}
            />
          ) : (
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={handleToggleComplete}
              className="flex-shrink-0 mt-0.5"
              style={{
                minWidth: touchTarget,
                minHeight: touchTarget,
              }}
            />
          )}

          <div className="flex-1 min-w-0">
            <ResponsiveText
              variant="h3"
              weight="medium"
              className={`leading-relaxed break-words ${
                task.isCompleted ? "line-through" : ""
              }`}
              style={{ color: state.currentTheme.colors.text }}
            >
              {task.title}
            </ResponsiveText>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            style={{
              backgroundColor: getPriorityColor(task.priority) + "20",
              color: getPriorityColor(task.priority),
              borderColor: getPriorityColor(task.priority),
              fontSize: isMobile ? "0.75rem" : "0.6875rem",
              padding: isMobile ? "0.3rem 0.6rem" : "0.125rem 0.375rem",
            }}
          >
            {getPriorityLabel(task.priority)}
          </Badge>

          <div className="flex items-center gap-1">
            {!isBulkDeleteMode && onEdit && (
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                style={{
                  minWidth: touchTarget,
                  minHeight: touchTarget,
                  padding: spacing.xs,
                }}
                aria-label="Editar tarefa"
              >
                <Edit className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
              </MobileButton>
            )}
            {!isBulkDeleteMode &&
              (onExport || onShare || onAddToGoogleCalendar) && (
                <ActionsMenu
                  task={task}
                  onExport={handleExport}
                  onShare={handleShare}
                  onGeneratePrompt={
                    onGeneratePrompt ? handleGeneratePrompt : undefined
                  }
                  onAddToGoogleCalendar={handleAddToGoogleCalendar}
                >
                  <MobileButton
                    variant="ghost"
                    size="sm"
                    style={{
                      minWidth: touchTarget,
                      minHeight: touchTarget,
                      padding: spacing.xs,
                    }}
                    aria-label="Ações"
                    aria-haspopup="menu"
                  >
                    <MoreVertical
                      className={isMobile ? "w-5 h-5" : "w-4 h-4"}
                    />
                  </MobileButton>
                </ActionsMenu>
              )}
            {!isBulkDeleteMode && onDelete && (
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                style={{
                  minWidth: touchTarget,
                  minHeight: touchTarget,
                  padding: spacing.xs,
                  color: state.currentTheme.colors.error,
                }}
                aria-label="Excluir tarefa"
              >
                <Trash2 className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
              </MobileButton>
            )}
          </div>
        </div>

        {/* Descrição */}
        {task.description && (
          <div
            className="pt-2 border-t"
            style={{ borderColor: state.currentTheme.colors.border + "40" }}
          >
            <ResponsiveText
              variant="caption"
              color="secondary"
              className="break-words leading-relaxed"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              {task.description}
            </ResponsiveText>
          </div>
        )}

        {/* Metadados */}
        <div className="flex flex-wrap items-center gap-3">
          {showProject && project && (
            <div className="flex items-center gap-2">
              <div
                className="rounded-full"
                style={{
                  backgroundColor: project.color,
                  width: isMobile ? "10px" : "8px",
                  height: isMobile ? "10px" : "8px",
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

          {showDate && (task.dueDate || task.recurrence?.startDate) && (
            <div className="flex items-center gap-2">
              <Calendar
                className={isMobile ? "w-4 h-4" : "w-3.5 h-3.5"}
                style={{
                  color: state.currentTheme.colors.textSecondary,
                }}
              />
              <ResponsiveText
                variant="caption"
                color="secondary"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                {task.recurrence
                  ? `Início: ${formatDate(
                      task.recurrence.startDate
                        ? new Date(
                            task.recurrence.startDate as unknown as string,
                          )
                        : (task.dueDate as Date),
                    )}`
                  : formatDate(task.dueDate as Date)}
              </ResponsiveText>
            </div>
          )}

          {!task.isCompleted && !isBulkDeleteMode && (
            <TaskTimer task={task} variant="compact" />
          )}
        </div>

        {/* Tags */}
        {taskTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {taskTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{
                  backgroundColor: tag.color + "20",
                  color: tag.color,
                  borderColor: tag.color,
                  fontSize: isMobile ? "0.75rem" : "0.6875rem",
                  padding: isMobile ? "0.3rem 0.6rem" : "0.125rem 0.375rem",
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Anexos e recorrência */}
        {(task.attachments.length > 0 || task.recurrence) && (
          <div className="flex items-center flex-wrap gap-3">
            {task.attachments.length > 0 && (
              <div className="flex items-center gap-2">
                <Paperclip
                  className={isMobile ? "w-4 h-4" : "w-3.5 h-3.5"}
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
              <div className="flex items-center gap-2">
                <RotateCcw
                  className={isMobile ? "w-4 h-4" : "w-3.5 h-3.5"}
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

        {/* Subtarefas */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div
            className="pt-3 border-t"
            style={{ borderColor: state.currentTheme.colors.border + "40" }}
          >
            <SubtaskManager
              taskId={task.id}
              workspaceId={task.workspaceId}
              parentTask={task}
              viewMode={viewMode}
              collapsible={true}
              defaultExpanded={true}
            />
          </div>
        )}
      </div>
    </MobileCard>
  );
}
