import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Countdown } from "../types";
import Modal from "./Modal";

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdown?: Countdown;
  onSave: (
    countdown: Omit<Countdown, "id" | "createdAt" | "updatedAt">
  ) => void;
}

const colors = [
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

export default function CountdownModal({
  isOpen,
  onClose,
  countdown,
  onSave,
}: CountdownModalProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    title: countdown?.title || "",
    description: countdown?.description || "",
    targetDate: countdown?.targetDate
      ? countdown.targetDate.toISOString().slice(0, 16)
      : "",
    color: countdown?.color || colors[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.targetDate) return;

    const countdownData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      targetDate: new Date(formData.targetDate),
      color: formData.color,
      workspaceId: state.activeWorkspaceId,
    };

    onSave(countdownData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        countdown ? "Editar Contagem Regressiva" : "Nova Contagem Regressiva"
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Título *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
            placeholder="Ex: Viagem para o Japão, Aniversário, Prova"
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
            placeholder="Descrição do evento (opcional)"
            rows={3}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Data e Hora *
          </label>
          <input
            type="datetime-local"
            value={formData.targetDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, targetDate: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Cor
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color ? "scale-110" : ""
                }`}
                style={{
                  backgroundColor: color,
                  borderColor:
                    formData.color === color
                      ? state.currentTheme.colors.text
                      : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              color: state.currentTheme.colors.text,
              borderColor: state.currentTheme.colors.border,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg font-medium transition-colors text-white"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
            }}
          >
            {countdown ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
