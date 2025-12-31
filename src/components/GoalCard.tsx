import { Calendar, CheckCircle2, Edit, Target, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { ProjectGoal } from "../types";
import { formatDate, getGoalStatusColor, getGoalStatusLabel } from "../utils";
import { Badge } from "./ui/badge";
import { MobileButton } from "./ui/mobile-button";
import { MobileCard } from "./ui/mobile-card";
import { useMobileSpacing } from "./ui/mobile-spacing";
import { ResponsiveText } from "./ui/responsive-text";

interface GoalCardProps {
  goal: ProjectGoal;
  onEdit: (goal: ProjectGoal) => void;
  onDelete: (goalId: string) => void;
  onComplete: (goalId: string) => void;
  onUncomplete: (goalId: string) => void;
  isDeleting?: boolean;
}

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onComplete,
  onUncomplete,
  isDeleting = false,
}: GoalCardProps) {
  const { state } = useApp();
  const { spacing, touchTarget, isMobile } = useMobileSpacing();

  const statusColor = getGoalStatusColor(goal.status);
  const statusLabel = getGoalStatusLabel(goal.status);

  const handleEdit = () => {
    onEdit(goal);
  };

  const handleDelete = () => {
    onDelete(goal.id);
  };

  const handleToggleComplete = () => {
    if (goal.status === "completed") {
      onUncomplete(goal.id);
    } else {
      onComplete(goal.id);
    }
  };

  return (
    <MobileCard
      className="transition-all duration-200 hover:shadow-md"
      padding="md"
    >
      <div className="flex flex-col" style={{ gap: spacing.md }}>
        <div className="flex items-start" style={{ gap: spacing.md }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
            style={{
              backgroundColor: statusColor,
              background: `linear-gradient(135deg, ${statusColor}, ${statusColor}dd)`,
            }}
          >
            <Target size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <ResponsiveText
                variant="h4"
                weight="semibold"
                className="mb-1"
                style={{ color: state.currentTheme.colors.text }}
              >
                {goal.title}
              </ResponsiveText>

              {!isMobile && (
                <div className="flex items-center" style={{ gap: spacing.xs }}>
                  <MobileButton
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleComplete}
                    style={{
                      minWidth: touchTarget,
                      minHeight: touchTarget,
                      padding: 0,
                      color:
                        goal.status === "completed"
                          ? state.currentTheme.colors.success
                          : state.currentTheme.colors.textSecondary,
                    }}
                    aria-label={
                      goal.status === "completed"
                        ? "Reabrir meta"
                        : "Concluir meta"
                    }
                  >
                    {goal.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Target className="w-5 h-5" />
                    )}
                  </MobileButton>

                  <MobileButton
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    style={{
                      minWidth: touchTarget,
                      minHeight: touchTarget,
                      padding: 0,
                      color: state.currentTheme.colors.textSecondary,
                    }}
                    aria-label="Editar meta"
                  >
                    <Edit className="w-5 h-5" />
                  </MobileButton>

                  <MobileButton
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    style={{
                      minWidth: touchTarget,
                      minHeight: touchTarget,
                      padding: 0,
                      color: state.currentTheme.colors.error,
                      opacity: isDeleting ? 0.5 : 1,
                    }}
                    aria-label="Excluir meta"
                  >
                    <Trash2 className="w-5 h-5" />
                  </MobileButton>
                </div>
              )}
            </div>

            {goal.description && (
              <ResponsiveText
                variant="caption"
                color="secondary"
                className="line-clamp-2"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                {goal.description}
              </ResponsiveText>
            )}

            <div
              className="flex items-center flex-wrap"
              style={{ gap: spacing.sm, marginTop: spacing.xs }}
            >
              <Badge
                variant="outline"
                style={{
                  backgroundColor: statusColor + "20",
                  color: statusColor,
                  borderColor: statusColor,
                  fontSize: isMobile ? "0.75rem" : "0.6875rem",
                  padding: isMobile ? "0.25rem 0.5rem" : "0.125rem 0.375rem",
                }}
              >
                {statusLabel}
              </Badge>

              {goal.dueDate && (
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
                    {formatDate(goal.dueDate)}
                  </ResponsiveText>
                </div>
              )}

              {goal.targetValue !== undefined && (
                <ResponsiveText
                  variant="caption"
                  color="secondary"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {goal.currentValue}/{goal.targetValue}
                </ResponsiveText>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <ResponsiveText
              variant="caption"
              color="secondary"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Progresso
            </ResponsiveText>
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: statusColor + "20",
                color: statusColor,
              }}
            >
              {goal.progress}%
            </div>
          </div>

          <div className="relative">
            <div
              className="w-full rounded-full h-3 overflow-hidden"
              style={{
                backgroundColor: state.currentTheme.colors.border + "40",
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out relative"
                style={{
                  width: `${goal.progress}%`,
                  background: `linear-gradient(90deg, ${statusColor}, ${statusColor}cc)`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "shimmer 2s infinite",
                  }}
                />
              </div>
            </div>
          </div>

          {goal.status === "completed" && (
            <div
              className="flex items-center gap-2 mt-3 p-3 rounded-xl"
              style={{
                backgroundColor: state.currentTheme.colors.success + "15",
              }}
            >
              <CheckCircle2
                className="w-5 h-5 flex-shrink-0"
                style={{ color: state.currentTheme.colors.success }}
              />
              <ResponsiveText
                variant="caption"
                weight="semibold"
                style={{ color: state.currentTheme.colors.success }}
              >
                Meta concluída! 🎉
              </ResponsiveText>
            </div>
          )}
        </div>

        {isMobile && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleToggleComplete}
              className="flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor:
                  goal.status === "completed"
                    ? state.currentTheme.colors.success + "10"
                    : statusColor + "10",
                color:
                  goal.status === "completed"
                    ? state.currentTheme.colors.success
                    : statusColor,
                border: `1px solid ${
                  goal.status === "completed"
                    ? state.currentTheme.colors.success
                    : statusColor
                }30`,
                opacity: isDeleting ? 0.5 : 1,
              }}
              disabled={isDeleting}
            >
              {goal.status === "completed" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Reabrir
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 inline mr-1" />
                  Concluir
                </>
              )}
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                color: state.currentTheme.colors.text,
                border: `1px solid ${state.currentTheme.colors.border}`,
                opacity: isDeleting ? 0.5 : 1,
              }}
              disabled={isDeleting}
            >
              ✏️ Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: state.currentTheme.colors.error + "10",
                color: state.currentTheme.colors.error,
                border: `1px solid ${state.currentTheme.colors.error}30`,
              }}
            >
              🗑️ Apagar
            </button>
          </div>
        )}
      </div>
    </MobileCard>
  );
}

