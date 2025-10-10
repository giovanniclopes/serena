import { Calendar, Paperclip, RotateCcw, Tag, Target, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useCompleteTask, useUncompleteTask } from "../features/tasks/useTasks";
import type { Project, Task } from "../types";
import {
  formatDate,
  formatTime,
  getPriorityColor,
  getPriorityLabel,
} from "../utils";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { MobileButton } from "./ui/mobile-button";
import { MobileCard } from "./ui/mobile-card";
import { useMobileSpacing } from "./ui/mobile-spacing";
import { ResponsiveText } from "./ui/responsive-text";

interface ProjectTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function ProjectTasksModal({
  isOpen,
  onClose,
  project,
}: ProjectTasksModalProps) {
  const { state, dispatch } = useApp();
  const { spacing, touchTarget, isMobile } = useMobileSpacing();
  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();

  if (!isOpen || !project) return null;

  const projectTasks = state.tasks.filter(
    (task) =>
      task.projectId === project.id &&
      task.workspaceId === state.activeWorkspaceId
  );

  const completedTasks = projectTasks.filter((task) => task.isCompleted);
  const pendingTasks = projectTasks.filter((task) => !task.isCompleted);

  const handleToggleComplete = (task: Task) => {
    if (task.isCompleted) {
      dispatch({ type: "UNCOMPLETE_TASK", payload: task.id });
      uncompleteTaskMutation.mutate(task.id);
    } else {
      dispatch({ type: "COMPLETE_TASK", payload: task.id });
      completeTaskMutation.mutate(task.id);
    }
  };

  const renderTask = (task: Task) => {
    const taskTags = state.tags.filter((tag) => task.tags.includes(tag.id));

    return (
      <MobileCard
        key={task.id}
        className={`transition-all duration-200 ${
          task.isCompleted ? "opacity-60" : "hover:shadow-md"
        }`}
        padding="md"
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={() => handleToggleComplete(task)}
            className="flex-shrink-0 mt-1"
            style={{
              minWidth: touchTarget,
              minHeight: touchTarget,
            }}
          />

          <div className="flex-1 min-w-0">
            <ResponsiveText
              variant="h4"
              weight="medium"
              className={`${task.isCompleted ? "line-through" : ""}`}
              style={{ color: state.currentTheme.colors.text }}
            >
              {task.title}
            </ResponsiveText>

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

              {task.dueDate && (
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
          </div>
        </div>
      </MobileCard>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: state.currentTheme.colors.background,
          border: `1px solid ${state.currentTheme.colors.border}`,
        }}
      >
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{
                backgroundColor:
                  project.color || state.currentTheme.colors.primary,
                background: `linear-gradient(135deg, ${
                  project.color || state.currentTheme.colors.primary
                }, ${project.color || state.currentTheme.colors.primary}dd)`,
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {project.name}
              </h2>
              <p
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                {projectTasks.length} tarefa
                {projectTasks.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <MobileButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{
              minWidth: touchTarget,
              minHeight: touchTarget,
              padding: 0,
            }}
          >
            <X className="w-5 h-5" />
          </MobileButton>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {projectTasks.length === 0 ? (
            <div className="text-center py-8">
              <div
                className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "20",
                }}
              >
                <Target
                  className="w-6 h-6"
                  style={{ color: state.currentTheme.colors.primary }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: state.currentTheme.colors.text }}
              >
                Nenhuma tarefa encontrada
              </h3>
              <p
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Este projeto ainda não possui tarefas
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingTasks.length > 0 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    Tarefas Pendentes ({pendingTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingTasks.map(renderTask)}
                  </div>
                </div>
              )}

              {completedTasks.length > 0 && (
                <div>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    Tarefas Concluídas ({completedTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {completedTasks.map(renderTask)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
