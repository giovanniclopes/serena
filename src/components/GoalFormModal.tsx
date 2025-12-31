import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { ProjectGoal } from "../types";
import { calculateGoalProgress } from "../utils";
import { MobileButton } from "./ui/mobile-button";
import { useMobileSpacing } from "./ui/mobile-spacing";
import { ResponsiveText } from "./ui/responsive-text";

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<ProjectGoal, "id" | "createdAt" | "updatedAt">) => void;
  goal?: ProjectGoal;
  projectId: string;
  workspaceId: string;
}

export default function GoalFormModal({
  isOpen,
  onClose,
  onSave,
  goal,
  projectId,
  workspaceId,
}: GoalFormModalProps) {
  const { state } = useApp();
  const { spacing, touchTarget } = useMobileSpacing();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "pending" as "pending" | "in_progress" | "completed" | "cancelled",
    progress: 0,
    targetValue: "",
    currentValue: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setFormData({
          title: goal.title || "",
          description: goal.description || "",
          dueDate: goal.dueDate
            ? new Date(goal.dueDate).toISOString().slice(0, 16)
            : "",
          status: goal.status,
          progress: goal.progress || 0,
          targetValue: goal.targetValue?.toString() || "",
          currentValue: goal.currentValue || 0,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          status: "pending",
          progress: 0,
          targetValue: "",
          currentValue: 0,
        });
      }
    }
  }, [goal, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        status: "pending",
        progress: 0,
        targetValue: "",
        currentValue: 0,
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const goalData = {
      projectId,
      workspaceId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      dueDate: formData.dueDate
        ? new Date(formData.dueDate)
        : undefined,
      status: formData.status,
      progress: Math.min(Math.max(formData.progress, 0), 100),
      targetValue: formData.targetValue
        ? Number.parseFloat(formData.targetValue)
        : undefined,
      currentValue: formData.currentValue || 0,
    };

    onSave(goalData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: state.currentTheme.colors.background,
          border: `1px solid ${state.currentTheme.colors.border}`,
        }}
      >
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <ResponsiveText
            variant="h2"
            weight="bold"
            style={{ color: state.currentTheme.colors.text }}
          >
            {goal ? "Editar Meta" : "Nova Meta"}
          </ResponsiveText>

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

        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="flex flex-col" style={{ gap: spacing.lg }}>
              <div>
                <label
                  htmlFor="title"
                  className="block mb-2 font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Título <span style={{ color: state.currentTheme.colors.error }}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.surface,
                    borderColor: state.currentTheme.colors.border,
                    color: state.currentTheme.colors.text,
                  }}
                  placeholder="Ex: Lançar versão 1.0"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block mb-2 font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border transition-colors resize-none"
                  style={{
                    backgroundColor: state.currentTheme.colors.surface,
                    borderColor: state.currentTheme.colors.border,
                    color: state.currentTheme.colors.text,
                  }}
                  placeholder="Descreva a meta em detalhes..."
                />
              </div>

              <div>
                <label
                  htmlFor="dueDate"
                  className="block mb-2 font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Data de Vencimento
                </label>
                <input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.surface,
                    borderColor: state.currentTheme.colors.border,
                    color: state.currentTheme.colors.text,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="targetValue"
                    className="block mb-2 font-medium"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    Valor Alvo
                  </label>
                  <input
                    id="targetValue"
                    type="number"
                    step="0.01"
                    value={formData.targetValue}
                    onChange={(e) => {
                      const newTarget = e.target.value;
                      const newProgress = newTarget
                        ? calculateGoalProgress(
                            formData.currentValue,
                            Number.parseFloat(newTarget)
                          )
                        : formData.progress;
                      setFormData({
                        ...formData,
                        targetValue: newTarget,
                        progress: newProgress,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: state.currentTheme.colors.surface,
                      borderColor: state.currentTheme.colors.border,
                      color: state.currentTheme.colors.text,
                    }}
                    placeholder="Ex: 1000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currentValue"
                    className="block mb-2 font-medium"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    Valor Atual
                  </label>
                  <input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    value={formData.currentValue}
                    onChange={(e) => {
                      const newValue = Number.parseFloat(e.target.value) || 0;
                      const newProgress = formData.targetValue
                        ? calculateGoalProgress(
                            newValue,
                            Number.parseFloat(formData.targetValue)
                          )
                        : formData.progress;
                      setFormData({
                        ...formData,
                        currentValue: newValue,
                        progress: newProgress,
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: state.currentTheme.colors.surface,
                      borderColor: state.currentTheme.colors.border,
                      color: state.currentTheme.colors.text,
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="progress"
                  className="block mb-2 font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Progresso ({formData.progress}%)
                </label>
                <input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      progress: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block mb-2 font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as typeof formData.status,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.surface,
                    borderColor: state.currentTheme.colors.border,
                    color: state.currentTheme.colors.text,
                  }}
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-end gap-3 p-6 border-t"
            style={{ borderColor: state.currentTheme.colors.border }}
          >
            <MobileButton
              type="button"
              variant="ghost"
              onClick={onClose}
              style={{
                color: state.currentTheme.colors.textSecondary,
              }}
            >
              Cancelar
            </MobileButton>
            <MobileButton
              type="submit"
              style={{
                backgroundColor: state.currentTheme.colors.primary,
                color: "#ffffff",
              }}
            >
              {goal ? "Salvar" : "Criar"}
            </MobileButton>
          </div>
        </form>
      </div>
    </div>
  );
}

