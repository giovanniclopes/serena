import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Habit } from "../types";
import Modal from "./Modal";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit;
  onSave: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) => void;
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

export default function HabitModal({
  isOpen,
  onClose,
  habit,
  onSave,
}: HabitModalProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    name: habit?.name || "",
    description: habit?.description || "",
    target: habit?.target || 1,
    unit: habit?.unit || "vez",
    color: habit?.color || colors[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const habitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      target: formData.target,
      unit: formData.unit.trim(),
      color: formData.color,
      reminders: habit?.reminders || [],
      workspaceId: state.activeWorkspaceId,
    };

    onSave(habitData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? "Editar Hábito" : "Novo Hábito"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Nome *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
            placeholder="Ex: Beber água, Meditar, Exercitar-se"
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
            placeholder="Descrição do hábito (opcional)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Meta
            </label>
            <input
              type="number"
              min="1"
              value={formData.target}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  target: parseInt(e.target.value) || 1,
                }))
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
              Unidade
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
              }}
              placeholder="Ex: copos, minutos, páginas"
              required
            />
          </div>
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
            {habit ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
