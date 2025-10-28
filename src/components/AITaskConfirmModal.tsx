import { Calendar, Edit, Flag, Folder, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Task } from "../types";
import ResponsiveModal from "./ResponsiveModal";
import { Button } from "./ui/button";

interface AITaskConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: () => void;
}

export default function AITaskConfirmModal({
  isOpen,
  onClose,
  task,
  onEdit,
}: AITaskConfirmModalProps) {
  const { state } = useApp();

  if (!task) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      P1: "Urgente",
      P2: "Alta",
      P3: "Média",
      P4: "Baixa",
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      P1: "#ef4444",
      P2: "#f97316",
      P3: "#eab308",
      P4: "#22c55e",
    };
    return colors[priority as keyof typeof colors] || "#6b7280";
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tarefa criada com sucesso!"
      size="md"
      description="A IA processou sua solicitação e criou a tarefa automaticamente."
    >
      <div className="space-y-4">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: state.currentTheme.colors.background,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
              }}
            >
              <Sparkles
                className="w-5 h-5"
                style={{ color: state.currentTheme.colors.primary }}
              />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Flag
                    className="w-4 h-4"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: getPriorityColor(task.priority) }}
                  >
                    Prioridade {getPriorityLabel(task.priority)}
                  </span>
                </div>

                {task.projectId && (
                  <div className="flex items-center gap-2">
                    <Folder
                      className="w-4 h-4"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      Projeto vinculado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.textSecondary,
            }}
          >
            Fechar
          </Button>
          <Button
            onClick={onEdit}
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar tarefa
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
