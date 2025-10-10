import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Habit, HabitFrequency, HabitRecurrenceType } from "../types";
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

const frequencyOptions = [
  { value: "day" as HabitFrequency, label: "por dia" },
  { value: "week" as HabitFrequency, label: "por semana" },
  { value: "month" as HabitFrequency, label: "por mês" },
];

const recurrenceTypeOptions = [
  {
    value: "infinite" as HabitRecurrenceType,
    label: "♾️ Infinito (sempre)",
    icon: "♾️",
  },
  {
    value: "duration" as HabitRecurrenceType,
    label: "⏱️ Por período",
    icon: "⏱️",
  },
  {
    value: "until_date" as HabitRecurrenceType,
    label: "📅 Até data",
    icon: "📅",
  },
];

const durationUnitOptions = [
  { value: "days", label: "dia(s)" },
  { value: "weeks", label: "semana(s)" },
  { value: "months", label: "mês(es)" },
];

const habitTemplates = [
  {
    name: "Beber água",
    description: "Manter-se hidratado durante o dia",
    target: 8,
    unit: "copo",
    category: "saude",
    color: "#06b6d4",
    frequency: "day" as HabitFrequency,
    recurrenceType: "infinite" as HabitRecurrenceType,
  },
  {
    name: "Exercitar-se",
    description: "Praticar atividade física regular",
    target: 30,
    unit: "minuto",
    category: "fitness",
    color: "#10b981",
    frequency: "day" as HabitFrequency,
    recurrenceType: "infinite" as HabitRecurrenceType,
  },
  {
    name: "Meditar",
    description: "Praticar mindfulness e relaxamento",
    target: 10,
    unit: "minuto",
    category: "mental",
    color: "#8b5cf6",
    frequency: "day" as HabitFrequency,
    recurrenceType: "infinite" as HabitRecurrenceType,
  },
  {
    name: "Ler",
    description: "Dedicar tempo à leitura",
    target: 20,
    unit: "minuto",
    category: "aprendizado",
    color: "#3b82f6",
    frequency: "day" as HabitFrequency,
    recurrenceType: "infinite" as HabitRecurrenceType,
  },
  {
    name: "Caminhar",
    description: "Fazer caminhada diária",
    target: 30,
    unit: "minuto",
    category: "fitness",
    color: "#84cc16",
    frequency: "day" as HabitFrequency,
    recurrenceType: "infinite" as HabitRecurrenceType,
  },
  {
    name: "Dormir cedo",
    description: "Manter horário regular de sono",
    target: 1,
    unit: "vez",
    category: "saude",
    color: "#6366f1",
    frequency: "day" as HabitFrequency,
    recurrenceType: "infinite" as HabitRecurrenceType,
  },
  {
    name: "Tomar antibiótico",
    description: "Medicação temporária",
    target: 2,
    unit: "vez",
    category: "saude",
    color: "#ec4899",
    frequency: "day" as HabitFrequency,
    recurrenceType: "duration" as HabitRecurrenceType,
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
    frequency: (habit?.frequency || "day") as HabitFrequency,
    recurrenceType: (habit?.recurrenceType ||
      "infinite") as HabitRecurrenceType,
    recurrenceDuration: habit?.recurrenceDuration,
    recurrenceDurationUnit: habit?.recurrenceDurationUnit || "days",
    recurrenceEndDate: habit?.recurrenceEndDate,
    color: habit?.color || colors[0],
    category: habit?.category || "outro",
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTarget, setCustomTarget] = useState(false);
  const [customUnit, setCustomUnit] = useState(false);

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || "",
        description: habit.description || "",
        target: habit.target || 1,
        unit: habit.unit || "vez",
        frequency: habit.frequency || "day",
        recurrenceType: habit.recurrenceType || "infinite",
        recurrenceDuration: habit.recurrenceDuration,
        recurrenceDurationUnit: habit.recurrenceDurationUnit || "days",
        recurrenceEndDate: habit.recurrenceEndDate,
        color: habit.color || colors[0],
        category: habit.category || "outro",
      });

      const isCustomTarget = !commonTargets.some(
        (t) => t.value === habit.target
      );
      const isCustomUnit = !commonUnits.some((u) => u.value === habit.unit);
      setCustomTarget(isCustomTarget);
      setCustomUnit(isCustomUnit);
    } else {
      setFormData({
        name: "",
        description: "",
        target: 1,
        unit: "vez",
        frequency: "day",
        recurrenceType: "infinite",
        recurrenceDuration: undefined,
        recurrenceDurationUnit: "days",
        recurrenceEndDate: undefined,
        color: colors[0],
        category: "outro",
      });
      setCustomTarget(false);
      setCustomUnit(false);
    }
  }, [habit]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        target: 1,
        unit: "vez",
        frequency: "day",
        recurrenceType: "infinite",
        recurrenceDuration: undefined,
        recurrenceDurationUnit: "days",
        recurrenceEndDate: undefined,
        color: colors[0],
        category: "outro",
      });
      setCustomTarget(false);
      setCustomUnit(false);
      setShowTemplates(false);
    }
  }, [isOpen]);

  const handleTemplateSelect = (template: (typeof habitTemplates)[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      target: template.target,
      unit: template.unit,
      frequency: template.frequency,
      recurrenceType: template.recurrenceType,
      recurrenceDuration: undefined,
      recurrenceDurationUnit: "days",
      recurrenceEndDate: undefined,
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
      frequency: formData.frequency,
      recurrenceType: formData.recurrenceType,
      recurrenceDuration:
        formData.recurrenceType === "duration"
          ? formData.recurrenceDuration
          : undefined,
      recurrenceDurationUnit:
        formData.recurrenceType === "duration"
          ? formData.recurrenceDurationUnit
          : undefined,
      recurrenceEndDate:
        formData.recurrenceType === "until_date"
          ? formData.recurrenceEndDate
          : undefined,
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
              className="w-full px-4 py-2 rounded-lg border-2 border-dashed transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: state.currentTheme.colors.surface,
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
              }}
              aria-label="Usar template de hábito"
              aria-expanded={showTemplates}
              aria-controls="templates-list"
            >
              📋 Usar Template
            </button>

            {showTemplates && (
              <div
                id="templates-list"
                className="mt-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: state.currentTheme.colors.surface,
                  borderColor: state.currentTheme.colors.border,
                }}
                role="region"
                aria-label="Lista de templates de hábitos"
              >
                <div
                  className="text-sm font-medium mb-2"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Escolha um template:
                </div>
                <div
                  className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto"
                  role="list"
                >
                  {habitTemplates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-2 rounded border transition-colors hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{
                        backgroundColor: state.currentTheme.colors.background,
                        borderColor: state.currentTheme.colors.border,
                        color: state.currentTheme.colors.text,
                      }}
                      aria-label={`Usar template: ${template.name} - ${template.description}`}
                      role="listitem"
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
                className="text-xs px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  backgroundColor: customTarget
                    ? state.currentTheme.colors.primary
                    : state.currentTheme.colors.surface,
                  borderColor: state.currentTheme.colors.border,
                  color: customTarget
                    ? "white"
                    : state.currentTheme.colors.text,
                }}
                aria-label={`Alternar para ${
                  customTarget ? "valores comuns" : "valor personalizado"
                } para meta`}
                aria-pressed={customTarget}
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
                className="text-xs px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  backgroundColor: customUnit
                    ? state.currentTheme.colors.primary
                    : state.currentTheme.colors.surface,
                  borderColor: state.currentTheme.colors.border,
                  color: customUnit ? "white" : state.currentTheme.colors.text,
                }}
                aria-label={`Alternar para ${
                  customUnit ? "unidades comuns" : "unidade personalizada"
                }`}
                aria-pressed={customUnit}
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
            Frequência
          </label>
          <select
            value={formData.frequency}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                frequency: e.target.value as HabitFrequency,
              }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          >
            {frequencyOptions.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Recorrência
            </label>
            <div className="grid grid-cols-1 gap-2">
              {recurrenceTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      recurrenceType: option.value,
                    }))
                  }
                  className={`p-3 rounded-lg border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    formData.recurrenceType === option.value
                      ? "scale-[1.02]"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      formData.recurrenceType === option.value
                        ? state.currentTheme.colors.primary + "20"
                        : state.currentTheme.colors.background,
                    borderColor:
                      formData.recurrenceType === option.value
                        ? state.currentTheme.colors.primary
                        : state.currentTheme.colors.border,
                    color: state.currentTheme.colors.text,
                  }}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {formData.recurrenceType === "duration" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.recurrenceDuration || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurrenceDuration: parseInt(e.target.value) || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.background,
                    borderColor: state.currentTheme.colors.border,
                    color: state.currentTheme.colors.text,
                  }}
                  placeholder="Ex: 7"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Unidade
                </label>
                <select
                  value={formData.recurrenceDurationUnit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurrenceDurationUnit: e.target.value as
                        | "days"
                        | "weeks"
                        | "months",
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.background,
                    borderColor: state.currentTheme.colors.border,
                    color: state.currentTheme.colors.text,
                  }}
                >
                  {durationUnitOptions.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {formData.recurrenceType === "until_date" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Data Final
              </label>
              <input
                type="date"
                value={
                  formData.recurrenceEndDate
                    ? new Date(formData.recurrenceEndDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recurrenceEndDate: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
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
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Cor
          </label>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Escolher cor do hábito"
          >
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  formData.color === color ? "scale-110" : ""
                }`}
                style={{
                  backgroundColor: color,
                  borderColor:
                    formData.color === color
                      ? state.currentTheme.colors.text
                      : "transparent",
                }}
                aria-label={`Escolher cor ${color}`}
                aria-pressed={formData.color === color}
                role="radio"
                aria-checked={formData.color === color}
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
