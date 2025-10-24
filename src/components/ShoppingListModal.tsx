import { Palette, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  SHOPPING_LIST_COLORS,
  SHOPPING_LIST_ICONS,
} from "../constants/shoppingCategories";
import { useApp } from "../context/AppContext";
import type { ShoppingList } from "../types";

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list?: ShoppingList;
  onSave: (data: {
    name: string;
    description?: string;
    category: string;
    color: string;
    icon?: string;
  }) => void;
  categories: readonly { value: string; label: string; icon: string }[];
}

export default function ShoppingListModal({
  isOpen,
  onClose,
  list,
  onSave,
  categories,
}: ShoppingListModalProps) {
  const { state } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("geral");
  const [color, setColor] = useState("#ec4899");
  const [icon, setIcon] = useState("🛒");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (list) {
      setName(list.name);
      setDescription(list.description || "");
      setCategory(list.category);
      setColor(list.color);
      setIcon(list.icon || "🛒");
    } else {
      setName("");
      setDescription("");
      setCategory("geral");
      setColor("#ec4899");
      setIcon("🛒");
    }
  }, [list, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || null,
      category,
      color,
      icon,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: state.currentTheme.colors.text }}
          >
            {list ? "Editar Lista" : "Nova Lista de Compras"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-opacity-10"
            style={{
              color: state.currentTheme.colors.textSecondary,
              backgroundColor: state.currentTheme.colors.textSecondary + "10",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Nome */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Nome da Lista *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lista de Perfumaria"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
            />
          </div>

          {/* Descrição */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional da lista..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
            />
          </div>

          {/* Categoria */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cor */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Cor
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors hover:bg-opacity-10"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <Palette className="w-4 h-4" />
              </button>

              {showColorPicker && (
                <div className="flex flex-wrap gap-2">
                  {SHOPPING_LIST_COLORS.map((colorOption) => (
                    <button
                      key={colorOption}
                      onClick={() => {
                        setColor(colorOption);
                        setShowColorPicker(false);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === colorOption ? "scale-110" : ""
                      }`}
                      style={{
                        backgroundColor: colorOption,
                        borderColor:
                          color === colorOption
                            ? state.currentTheme.colors.text
                            : "transparent",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ícone */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Ícone
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors hover:bg-opacity-10"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
              >
                <span className="text-lg">{icon}</span>
                <Tag className="w-4 h-4" />
              </button>

              {showIconPicker && (
                <div className="flex flex-wrap gap-2">
                  {SHOPPING_LIST_ICONS.map((iconOption) => (
                    <button
                      key={iconOption}
                      onClick={() => {
                        setIcon(iconOption);
                        setShowIconPicker(false);
                      }}
                      className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                        icon === iconOption ? "scale-110" : ""
                      }`}
                      style={{
                        backgroundColor: state.currentTheme.colors.background,
                        borderColor:
                          icon === iconOption
                            ? state.currentTheme.colors.primary
                            : state.currentTheme.colors.border,
                      }}
                      aria-label={`Selecionar ícone ${iconOption}`}
                    >
                      <span className="text-sm">{iconOption}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex space-x-3 p-4 border-t"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              color: state.currentTheme.colors.textSecondary,
              border: `1px solid ${state.currentTheme.colors.border}`,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            {list ? "Salvar" : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}
