import { Check, Edit, ExternalLink, Trash2 } from "lucide-react";
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
  canEdit?: boolean;
}

export default function ShoppingListItem({
  item,
  listColor,
  onEdit,
  canEdit = true,
}: ShoppingListItemProps) {
  const { state } = useApp();
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleItemMutation = useToggleShoppingListItem();
  const deleteItemMutation = useDeleteShoppingListItem();

  const handleTogglePurchased = () => {
    toggleItemMutation.mutate({
      id: item.id,
      isPurchased: !item.isPurchased,
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteItemMutation.mutate(item.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
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
        disabled={toggleItemMutation.isPending || !canEdit}
        aria-label={
          item.isPurchased ? "Marcar como não comprado" : "Marcar como comprado"
        }
      >
        {item.isPurchased && <Check className="w-3 h-3 text-white" />}
      </button>

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
          {item.notes && (
            <p
              className="text-sm mt-1"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              {item.notes}
            </p>
          )}
          {item.price && (
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{
                backgroundColor: "#fce7f3",
                color: "#be185d",
              }}
            >
              R$ {item.price.toFixed(2)}
            </span>
          )}
        </div>
        {item.links && item.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {item.links.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-opacity-10"
                style={{
                  color: state.currentTheme.colors.primary,
                  backgroundColor: state.currentTheme.colors.primary + "10",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{link}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {showActions && canEdit && (
        <div className="flex items-center space-x-1">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-1 rounded transition-colors hover:bg-opacity-10"
              style={{
                color: state.currentTheme.colors.textSecondary,
                backgroundColor: state.currentTheme.colors.textSecondary + "10",
              }}
              aria-label="Editar item"
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
            aria-label="Excluir item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg w-full max-w-sm"
            style={{ backgroundColor: state.currentTheme.colors.surface }}
          >
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: state.currentTheme.colors.border }}
            >
              <h3
                className="text-lg font-semibold"
                style={{ color: state.currentTheme.colors.text }}
              >
                Confirmar Exclusão
              </h3>
            </div>

            <div className="p-4">
              <p
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Tem certeza que deseja excluir o item{" "}
                <strong>"{item.name}"</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div
              className="flex space-x-3 p-4 border-t"
              style={{ borderColor: state.currentTheme.colors.border }}
            >
              <button
                onClick={cancelDelete}
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
                onClick={confirmDelete}
                disabled={deleteItemMutation.isPending}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: state.currentTheme.colors.error,
                  color: "white",
                }}
              >
                {deleteItemMutation.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
