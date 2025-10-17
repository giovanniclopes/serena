import { Check, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  useDeleteShoppingListItem,
  useToggleShoppingListItem,
} from "../features/shopping-lists/useShoppingLists";
import type { ShoppingListItem } from "../types";

interface ShoppingListItemProps {
  item: ShoppingListItem;
  listColor: string;
  onEdit?: (item: ShoppingListItem) => void;
}

export default function ShoppingListItem({
  item,
  listColor,
  onEdit,
}: ShoppingListItemProps) {
  const { state } = useApp();
  const [showActions, setShowActions] = useState(false);

  const toggleItemMutation = useToggleShoppingListItem();
  const deleteItemMutation = useDeleteShoppingListItem();

  const handleTogglePurchased = () => {
    toggleItemMutation.mutate({
      id: item.id,
      isPurchased: !item.isPurchased,
    });
  };

  const handleDelete = () => {
    deleteItemMutation.mutate(item.id);
  };

  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        item.isPurchased ? "opacity-60" : ""
      }`}
      style={{
        backgroundColor: state.currentTheme.colors.background,
        border: `1px solid ${state.currentTheme.colors.border}`,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Checkbox */}
      <button
        onClick={handleTogglePurchased}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          item.isPurchased ? "border-transparent" : "border-gray-300"
        }`}
        style={{
          backgroundColor: item.isPurchased ? listColor : "transparent",
          borderColor: item.isPurchased
            ? listColor
            : state.currentTheme.colors.border,
        }}
        disabled={toggleItemMutation.isPending}
      >
        {item.isPurchased && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Conteúdo do Item */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span
            className={`font-medium ${item.isPurchased ? "line-through" : ""}`}
            style={{
              color: item.isPurchased
                ? state.currentTheme.colors.textSecondary
                : state.currentTheme.colors.text,
            }}
          >
            {item.name}
          </span>
          {item.quantity && item.quantity !== "1" && (
            <span
              className="text-sm px-2 py-1 rounded-full"
              style={{
                backgroundColor: state.currentTheme.colors.surface,
                color: state.currentTheme.colors.textSecondary,
              }}
            >
              {item.quantity}
            </span>
          )}
        </div>
        {item.notes && (
          <p
            className="text-sm mt-1"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            {item.notes}
          </p>
        )}
      </div>

      {/* Ações */}
      {showActions && (
        <div className="flex items-center space-x-1">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-1 rounded transition-colors hover:bg-opacity-10"
              style={{
                color: state.currentTheme.colors.textSecondary,
                backgroundColor: state.currentTheme.colors.textSecondary + "10",
              }}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 rounded transition-colors hover:bg-opacity-10"
            style={{
              color: state.currentTheme.colors.error,
              backgroundColor: state.currentTheme.colors.error + "10",
            }}
            disabled={deleteItemMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
