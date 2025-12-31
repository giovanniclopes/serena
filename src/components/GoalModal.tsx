import { Plus, Target, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  useCompleteGoal,
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUncompleteGoal,
  useUpdateGoal,
} from "../features/projects/useGoals";
import type { Project, ProjectGoal } from "../types";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import GoalCard from "./GoalCard";
import GoalFormModal from "./GoalFormModal";
import { MobileButton } from "./ui/mobile-button";
import { useMobileSpacing } from "./ui/mobile-spacing";
import { ResponsiveText } from "./ui/responsive-text";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

type GoalFilter = "all" | "pending" | "in_progress" | "completed" | "cancelled";

export default function GoalModal({
  isOpen,
  onClose,
  project,
}: GoalModalProps) {
  const { state } = useApp();
  const { spacing, touchTarget } = useMobileSpacing();
  const [filter, setFilter] = useState<GoalFilter>("all");
  const [isGoalFormModalOpen, setIsGoalFormModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ProjectGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { goals, isLoading } = useGoals(project?.id);
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const completeGoalMutation = useCompleteGoal();
  const uncompleteGoalMutation = useUncompleteGoal();

  if (!isOpen || !project) return null;

  const filteredGoals = goals?.filter((goal) => {
    if (filter === "all") return true;
    return goal.status === filter;
  }) || [];

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setIsGoalFormModalOpen(true);
  };

  const handleOpenEditModal = (goal: ProjectGoal) => {
    setEditingGoal(goal);
    setIsGoalFormModalOpen(true);
  };

  const handleSaveGoal = (
    goalData: Omit<ProjectGoal, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.id,
        updates: goalData,
      });
    } else {
      createGoalMutation.mutate(goalData);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoalToDelete(goalId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (goalToDelete) {
      deleteGoalMutation.mutate(goalToDelete);
      setGoalToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleCompleteGoal = (goalId: string) => {
    completeGoalMutation.mutate(goalId);
  };

  const handleUncompleteGoal = (goalId: string) => {
    uncompleteGoalMutation.mutate(goalId);
  };

  const filterOptions: { value: GoalFilter; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "pending", label: "Pendentes" },
    { value: "in_progress", label: "Em Progresso" },
    { value: "completed", label: "Concluídas" },
    { value: "cancelled", label: "Canceladas" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

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
            <div className="flex items-center" style={{ gap: spacing.md }}>
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
                <ResponsiveText
                  variant="h2"
                  weight="bold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Metas do Projeto
                </ResponsiveText>
                <ResponsiveText
                  variant="caption"
                  color="secondary"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {project.name}
                </ResponsiveText>
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

          <div className="p-6">
            <div
              className="flex items-center justify-between mb-6"
              style={{ gap: spacing.md }}
            >
              <div className="flex items-center flex-wrap" style={{ gap: spacing.sm }}>
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className="px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200"
                    style={{
                      backgroundColor:
                        filter === option.value
                          ? state.currentTheme.colors.primary + "20"
                          : state.currentTheme.colors.surface,
                      color:
                        filter === option.value
                          ? state.currentTheme.colors.primary
                          : state.currentTheme.colors.text,
                      border: `1px solid ${
                        filter === option.value
                          ? state.currentTheme.colors.primary
                          : state.currentTheme.colors.border
                      }`,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <MobileButton
                onClick={handleOpenCreateModal}
                style={{
                  backgroundColor: state.currentTheme.colors.primary,
                  color: "#ffffff",
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </MobileButton>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-280px)]">
              {isLoading ? (
                <div className="text-center py-8">
                  <ResponsiveText
                    variant="body"
                    color="secondary"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    Carregando metas...
                  </ResponsiveText>
                </div>
              ) : filteredGoals.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title={
                    filter === "all"
                      ? "Nenhuma meta criada"
                      : `Nenhuma meta ${filterOptions.find((o) => o.value === filter)?.label.toLowerCase()}`
                  }
                  description={
                    filter === "all"
                      ? "Crie metas para acompanhar o progresso do seu projeto."
                      : "Não há metas com este status no momento."
                  }
                  actionLabel={filter === "all" ? "Criar Primeira Meta" : undefined}
                  onAction={filter === "all" ? handleOpenCreateModal : undefined}
                />
              ) : (
                <div className="space-y-4">
                  {filteredGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteGoal}
                      onComplete={handleCompleteGoal}
                      onUncomplete={handleUncompleteGoal}
                      isDeleting={deleteGoalMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isGoalFormModalOpen && (
        <GoalFormModal
          isOpen={isGoalFormModalOpen}
          onClose={() => {
            setIsGoalFormModalOpen(false);
            setEditingGoal(null);
          }}
          onSave={handleSaveGoal}
          goal={editingGoal || undefined}
          projectId={project.id}
          workspaceId={project.workspaceId}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setGoalToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Meta"
        message="Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </>
  );
}

