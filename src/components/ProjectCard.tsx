import { CheckCircle2, Edit, Eye, Folder, Target, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Project } from "../types";
import { MobileButton } from "./ui/mobile-button";
import { MobileCard } from "./ui/mobile-card";
import { useMobileSpacing } from "./ui/mobile-spacing";
import { ResponsiveText } from "./ui/responsive-text";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onView: (project: Project) => void;
  isDeleting?: boolean;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onView,
  isDeleting = false,
}: ProjectCardProps) {
  const { state } = useApp();
  const { spacing, touchTarget, isMobile } = useMobileSpacing();

  const completionPercentage =
    project.tasksTotalCount > 0
      ? Math.round(
          (project.tasksCompletedCount / project.tasksTotalCount) * 100
        )
      : 0;

  const handleEdit = () => {
    onEdit(project);
  };

  const handleDelete = () => {
    onDelete(project.id);
  };

  const handleView = () => {
    onView(project);
  };

  return (
    <MobileCard
      className="transition-all duration-200 hover:shadow-md"
      color={project.color}
      padding="md"
    >
      <div className="flex flex-col" style={{ gap: spacing.md }}>
        {/* Header */}
        <div className="flex items-start" style={{ gap: spacing.md }}>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
            style={{
              backgroundColor:
                project.color || state.currentTheme.colors.primary,
              background: `linear-gradient(135deg, ${
                project.color || state.currentTheme.colors.primary
              }, ${project.color || state.currentTheme.colors.primary}dd)`,
            }}
          >
            <Folder size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <ResponsiveText
              variant="h3"
              weight="semibold"
              className="mb-1"
              style={{ color: state.currentTheme.colors.text }}
            >
              {project.name}
            </ResponsiveText>

            {project.description && (
              <ResponsiveText
                variant="caption"
                color="secondary"
                className="line-clamp-2"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                {project.description}
              </ResponsiveText>
            )}
          </div>

          {/* Action Buttons - Desktop Only */}
          {!isMobile && (
            <div className="flex items-center" style={{ gap: spacing.xs }}>
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={handleView}
                style={{
                  minWidth: touchTarget,
                  minHeight: touchTarget,
                  padding: 0,
                  color: state.currentTheme.colors.primary,
                }}
              >
                <Eye className="w-5 h-5" />
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
              >
                <Trash2 className="w-5 h-5" />
              </MobileButton>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {project.tasksTotalCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center" style={{ gap: spacing.sm }}>
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor:
                      (project.color || state.currentTheme.colors.primary) +
                      "20",
                  }}
                >
                  <Target
                    size={12}
                    style={{
                      color: project.color || state.currentTheme.colors.primary,
                    }}
                  />
                </div>
                <ResponsiveText
                  variant="caption"
                  color="secondary"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {project.tasksCompletedCount}/{project.tasksTotalCount}{" "}
                  tarefas
                </ResponsiveText>
              </div>

              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor:
                    (project.color || state.currentTheme.colors.primary) + "20",
                  color: project.color || state.currentTheme.colors.primary,
                }}
              >
                {completionPercentage}%
              </div>
            </div>

            {/* Progress Bar */}
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
                    width: `${completionPercentage}%`,
                    background: `linear-gradient(90deg, ${
                      project.color || state.currentTheme.colors.primary
                    }, ${
                      project.color || state.currentTheme.colors.primary
                    }cc)`,
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

            {/* Completion Message */}
            {completionPercentage === 100 && (
              <div
                className="flex items-center gap-2 mt-4 p-3 rounded-xl"
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
                  Projeto concluído! 🎉
                </ResponsiveText>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons for Mobile */}
        {isMobile && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleView}
              className="flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "10",
                color: state.currentTheme.colors.primary,
                border: `1px solid ${state.currentTheme.colors.primary}30`,
                opacity: isDeleting ? 0.5 : 1,
              }}
              disabled={isDeleting}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              Visualizar
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
