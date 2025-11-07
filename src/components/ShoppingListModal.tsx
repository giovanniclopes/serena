import { Check, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  SHOPPING_LIST_COLORS,
  SHOPPING_LIST_ICONS,
} from "../constants/shoppingCategories";
import { useApp } from "../context/AppContext";
import type { ShoppingList } from "../types";
import ColorPicker from "./ColorPicker";

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
      description: description.trim() || undefined,
      category,
      color,
      icon,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-6 border-b sticky top-0 backdrop-blur-sm"
          style={{
            borderColor: state.currentTheme.colors.border,
            backgroundColor: state.currentTheme.colors.surface + "F0",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: color + "20" }}
            >
              <span className="text-lg">{icon}</span>
            </div>
            <div>
              <h2
                className="text-xl font-semibold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {list ? "Editar Lista" : "Nova Lista de Compras"}
              </h2>
              <p
                className="text-xs"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                {list
                  ? "Atualize os detalhes da sua lista"
                  : "Crie uma nova lista de compras"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
            style={{
              color: state.currentTheme.colors.textSecondary,
              backgroundColor: state.currentTheme.colors.textSecondary + "10",
            }}
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={
                {
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: name.trim()
                    ? state.currentTheme.colors.primary + "40"
                    : state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                  "--tw-ring-color": state.currentTheme.colors.primary,
                } as React.CSSProperties
              }
              autoFocus
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição opcional para sua lista..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
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

          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all cursor-pointer"
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

            <div className="relative">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                Ícone
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-all hover:shadow-md"
                  style={{
                    backgroundColor: state.currentTheme.colors.background,
                    borderColor: showIconPicker
                      ? state.currentTheme.colors.primary
                      : state.currentTheme.colors.border,
                    color: state.currentTheme.colors.text,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: color + "20" }}
                    >
                      <span className="text-lg">{icon}</span>
                    </div>
                    <span className="text-sm font-medium">Selecionar</span>
                  </div>
                  <Tag className="w-4 h-4" />
                </button>

                {showIconPicker && (
                  <div
                    className="absolute z-10 mt-2 w-full p-4 rounded-lg border grid grid-cols-6 gap-3 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg"
                    style={{
                      backgroundColor: state.currentTheme.colors.surface,
                      borderColor: state.currentTheme.colors.border,
                    }}
                  >
                    {SHOPPING_LIST_ICONS.map((iconOption) => (
                      <button
                        key={iconOption}
                        onClick={() => {
                          setIcon(iconOption);
                          setShowIconPicker(false);
                        }}
                        className={`relative w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center ${
                          icon === iconOption ? "scale-110 ring-2" : ""
                        }`}
                        style={{
                          backgroundColor:
                            icon === iconOption
                              ? color + "20"
                              : state.currentTheme.colors.background,
                          borderColor:
                            icon === iconOption
                              ? state.currentTheme.colors.primary
                              : state.currentTheme.colors.border,
                        }}
                        aria-label={`Selecionar ícone ${iconOption}`}
                      >
                        <span className="text-lg">{iconOption}</span>
                        {icon === iconOption && (
                          <div className="absolute -top-1 -right-1">
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  state.currentTheme.colors.primary,
                              }}
                            >
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ColorPicker
            value={color}
            onChange={setColor}
            predefinedColors={SHOPPING_LIST_COLORS}
            label="Cor"
          />
        </div>

        <div
          className="flex space-x-3 p-6 border-t sticky bottom-0 backdrop-blur-sm"
          style={{
            borderColor: state.currentTheme.colors.border,
            backgroundColor: state.currentTheme.colors.surface + "F0",
          }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:shadow-md"
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
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              backgroundColor: name.trim()
                ? state.currentTheme.colors.primary
                : state.currentTheme.colors.border,
              color: "white",
            }}
          >
            {list ? "Salvar Alterações" : "Criar Lista"}
          </button>
        </div>
      </div>
    </div>
  );
}
