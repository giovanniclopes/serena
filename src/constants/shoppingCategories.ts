export const SHOPPING_CATEGORIES = [
  { value: "geral", label: "Geral", icon: "🛒", color: "#ec4899" },
  { value: "perfumaria", label: "Perfumaria", icon: "💄", color: "#f97316" },
  {
    value: "supermercado",
    label: "Supermercado",
    icon: "🛍️",
    color: "#22c55e",
  },
  { value: "farmacia", label: "Farmácia", icon: "💊", color: "#06b6d4" },
  { value: "casa", label: "Casa", icon: "🏠", color: "#3b82f6" },
  { value: "roupas", label: "Roupas", icon: "👕", color: "#8b5cf6" },
  { value: "eletronicos", label: "Eletrônicos", icon: "📱", color: "#ef4444" },
  { value: "livros", label: "Livros", icon: "📚", color: "#f59e0b" },
  { value: "outros", label: "Outros", icon: "📦", color: "#10b981" },
] as const;

export const SHOPPING_LIST_COLORS = [
  "#ec4899",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ec4899",
] as const;

export const SHOPPING_LIST_ICONS = [
  "🛒",
  "💄",
  "🛍️",
  "💊",
  "🏠",
  "👕",
  "📱",
  "📚",
  "🍎",
  "🥛",
  "🍞",
  "🧴",
  "🧽",
  "🧼",
  "📦",
  "🎁",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number]["value"];
export type ShoppingListColor = (typeof SHOPPING_LIST_COLORS)[number];
export type ShoppingListIcon = (typeof SHOPPING_LIST_ICONS)[number];
