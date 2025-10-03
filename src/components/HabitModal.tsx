import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { Habit } from "../types";
import ResponsiveModal from "./ResponsiveModal";

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

const commonTargets = [
  { value: 1, label: "1 vez" },
  { value: 2, label: "2 vezes" },
  { value: 3, label: "3 vezes" },
  { value: 5, label: "5 vezes" },
  { value: 10, label: "10 vezes" },
  { value: 15, label: "15 vezes" },
  { value: 20, label: "20 vezes" },
  { value: 30, label: "30 vezes" },
];

const commonUnits = [
  { value: "vez", label: "vez(es)" },
  { value: "minuto", label: "minuto(s)" },
  { value: "hora", label: "hora(s)" },
  { value: "copo", label: "copo(s)" },
  { value: "litro", label: "litro(s)" },
  { value: "página", label: "página(s)" },
  { value: "capítulo", label: "capítulo(s)" },
  { value: "quilômetro", label: "km" },
  { value: "caloria", label: "caloria(s)" },
  { value: "refeição", label: "refeição(ões)" },
  { value: "série", label: "série(s)" },
  { value: "repetição", label: "repetição(ões)" },
  { value: "passo", label: "passo(s)" },
  { value: "meditação", label: "sessão(ões)" },
  { value: "exercício", label: "exercício(s)" },
];

const habitCategories = [
  { value: "saude", label: "Saúde", icon: "💊" },
  { value: "fitness", label: "Fitness", icon: "💪" },
  { value: "mental", label: "Mental", icon: "🧠" },
  { value: "produtividade", label: "Produtividade", icon: "⚡" },
  { value: "aprendizado", label: "Aprendizado", icon: "📚" },
  { value: "social", label: "Social", icon: "👥" },
  { value: "criatividade", label: "Criatividade", icon: "🎨" },
  { value: "financeiro", label: "Financeiro", icon: "💰" },
  { value: "casa", label: "Casa", icon: "🏠" },
  { value: "outro", label: "Outro", icon: "📝" },
];

const habitTemplates = [
  {
    name: "Beber água",
    description: "Manter-se hidratado durante o dia",
    target: 8,
    unit: "copo",
    category: "saude",
    color: "#06b6d4",
  },
  {
    name: "Exercitar-se",
    description: "Praticar atividade física regular",
    target: 30,
    unit: "minuto",
    category: "fitness",
    color: "#10b981",
  },
  {
    name: "Meditar",
    description: "Praticar mindfulness e relaxamento",
    target: 10,
    unit: "minuto",
    category: "mental",
    color: "#8b5cf6",
  },
  {
    name: "Ler",
    description: "Dedicar tempo à leitura",
    target: 20,
    unit: "minuto",
    category: "aprendizado",
    color: "#3b82f6",
  },
  {
    name: "Caminhar",
    description: "Fazer caminhada diária",
    target: 30,
    unit: "minuto",
    category: "fitness",
    color: "#84cc16",
  },
  {
    name: "Dormir cedo",
    description: "Manter horário regular de sono",
    target: 1,
    unit: "vez",
    category: "saude",
    color: "#6366f1",
  },
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
    category: habit?.category || "outro",
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTarget, setCustomTarget] = useState(false);
  const [customUnit, setCustomUnit] = useState(false);

  const handleTemplateSelect = (template: (typeof habitTemplates)[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      target: template.target,
      unit: template.unit,
      color: template.color,
      category: template.category,
    });
    setShowTemplates(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const habitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      target: formData.target,
      unit: formData.unit.trim(),
      color: formData.color,
      category: formData.category,
      reminders: habit?.reminders || [],
      workspaceId: state.activeWorkspaceId,
    };

    onSave(habitData);
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? "Editar Hábito" : "Novo Hábito"}
      size="md"
      description=""
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!habit && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full px-4 py-2 rounded-lg border-2 border-dashed transition-colors text-sm font-medium"
              style={{
                backgroundColor: state.currentTheme.colors.surface,
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
              }}
            >
              📋 Usar Template
            </button>

            {showTemplates && (
              <div
                className="mt-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: state.currentTheme.colors.surface,
                  borderColor: state.currentTheme.colors.border,
                }}
              >
                <div
                  className="text-sm font-medium mb-2"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Escolha um template:
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {habitTemplates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-2 rounded border transition-colors hover:scale-[1.02]"
                      style={{
                        backgroundColor: state.currentTheme.colors.background,
                        borderColor: state.currentTheme.colors.border,
                        color: state.currentTheme.colors.text,
                      }}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs opacity-70">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
            Categoria
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          >
            {habitCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-sm font-medium"
                style={{ color: state.currentTheme.colors.text }}
              >
                Meta
              </label>
              <button
                type="button"
                onClick={() => setCustomTarget(!customTarget)}
                className="text-xs px-2 py-1 rounded border transition-colors"
                style={{
                  backgroundColor: customTarget
                    ? state.currentTheme.colors.primary
                    : state.currentTheme.colors.surface,
                  borderColor: state.currentTheme.colors.border,
                  color: customTarget
                    ? "white"
                    : state.currentTheme.colors.text,
                }}
              >
                {customTarget ? "Personalizado" : "Comum"}
              </button>
            </div>

            {customTarget ? (
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
            ) : (
              <select
                value={formData.target}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    target: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
              >
                {commonTargets.map((target) => (
                  <option key={target.value} value={target.value}>
                    {target.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-sm font-medium"
                style={{ color: state.currentTheme.colors.text }}
              >
                Unidade
              </label>
              <button
                type="button"
                onClick={() => setCustomUnit(!customUnit)}
                className="text-xs px-2 py-1 rounded border transition-colors"
                style={{
                  backgroundColor: customUnit
                    ? state.currentTheme.colors.primary
                    : state.currentTheme.colors.surface,
                  borderColor: state.currentTheme.colors.border,
                  color: customUnit ? "white" : state.currentTheme.colors.text,
                }}
              >
                {customUnit ? "Personalizado" : "Comum"}
              </button>
            </div>

            {customUnit ? (
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
            ) : (
              <select
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
              >
                {commonUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            )}
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

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors"
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
            className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors text-white"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
            }}
          >
            {habit ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
