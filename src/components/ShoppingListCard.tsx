import { CheckCircle, Edit, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  useCreateShoppingListItem,
  useUpdateShoppingListItem,
} from "../features/shopping-lists/useShoppingLists";
import type {
  ShoppingList,
  ShoppingListItem as ShoppingListItemType,
} from "../types";
import ShoppingListItem from "./ShoppingListItem";
import ShoppingListItemModal from "./ShoppingListItemModal";

interface ShoppingListCardProps {
  list: ShoppingList;
  onEdit: (list: ShoppingList) => void;
  onDelete: (listId: string) => void;
}

export default function ShoppingListCard({
  list,
  onEdit,
  onDelete,
}: ShoppingListCardProps) {
  const { state } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    ShoppingListItemType | undefined
  >(undefined);

  const createItemMutation = useCreateShoppingListItem();
  const updateItemMutation = useUpdateShoppingListItem();

  const completedItems = list.items.filter((item) => item.isPurchased).length;
  const totalItems = list.items.length;
  const progressPercentage =
    totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Calcular total dos itens com preço
  const totalPrice = list.items.reduce((sum, item) => {
    return sum + (item.price || 0);
  }, 0);

  const handleAddItem = () => {
    setEditingItem(undefined);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: ShoppingListItemType) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (itemData: {
    name: string;
    quantity?: string;
    notes?: string;
    price?: number;
  }) => {
    if (editingItem) {
      // Atualizar item existente
      updateItemMutation.mutate({
        id: editingItem.id,
        updates: {
          name: itemData.name,
          quantity: itemData.quantity,
          notes: itemData.notes,
          price: itemData.price,
        },
      });
    } else {
      // Criar novo item
      createItemMutation.mutate({
        shoppingListId: list.id,
        name: itemData.name,
        quantity: itemData.quantity,
        notes: itemData.notes,
        price: itemData.price,
        workspaceId: list.workspaceId,
      });
    }
    setIsItemModalOpen(false);
    setEditingItem(undefined);
  };

  return (
    <>
      <div
        className="rounded-lg border p-4 transition-all duration-200 hover:shadow-md"
        style={{
          backgroundColor: state.currentTheme.colors.surface,
          borderColor: state.currentTheme.colors.border,
        }}
      >
        {/* Header da Lista */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: list.color + "20" }}
            >
              {list.icon ? (
                <span className="text-lg">{list.icon}</span>
              ) : (
                <ShoppingCart
                  className="w-5 h-5"
                  style={{ color: list.color }}
                />
              )}
            </div>
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: state.currentTheme.colors.text }}
              >
                {list.name}
              </h3>
              {list.description && (
                <p
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {list.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {list.isCompleted && (
              <CheckCircle
                className="w-5 h-5"
                style={{ color: state.currentTheme.colors.success }}
              />
            )}
            <button
              onClick={() => onEdit(list)}
              className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
              style={{
                color: state.currentTheme.colors.textSecondary,
                backgroundColor: state.currentTheme.colors.textSecondary + "10",
              }}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(list.id)}
              className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
              style={{
                color: state.currentTheme.colors.error,
                backgroundColor: state.currentTheme.colors.error + "10",
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Total */}
        {totalPrice > 0 && (
          <div className="mb-3">
            <div
              className="inline-block py-1 px-3 rounded-lg"
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: "#212529" }}
              >
                Total: R$ {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: state.currentTheme.colors.textSecondary }}>
                {completedItems} de {totalItems} itens
              </span>
              <span style={{ color: state.currentTheme.colors.textSecondary }}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full"
              style={{ backgroundColor: state.currentTheme.colors.border }}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: list.color,
                }}
              />
            </div>
          </div>
        )}

        {/* Lista de Itens (Expandida) */}
        {isExpanded && (
          <div className="space-y-2 mb-3">
            {list.items.length > 0 ? (
              list.items
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((item) => (
                  <ShoppingListItem
                    key={item.id}
                    item={item}
                    listColor={list.color}
                    onEdit={handleEditItem}
                  />
                ))
            ) : (
              <div
                className="text-center py-4 rounded-lg"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Nenhum item nesta lista
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-medium transition-colors"
              style={{
                color: state.currentTheme.colors.primary,
              }}
            >
              {isExpanded ? "Recolher" : "Ver itens"} ({totalItems})
            </button>
            {isExpanded && (
              <button
                onClick={handleAddItem}
                className="text-sm font-medium transition-colors"
                style={{
                  color: state.currentTheme.colors.primary,
                }}
              >
                + Adicionar item
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span style={{ color: state.currentTheme.colors.textSecondary }}>
              {list.category}
            </span>
            {list.completedAt && (
              <span style={{ color: state.currentTheme.colors.textSecondary }}>
                • {new Date(list.completedAt).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Item */}
      <ShoppingListItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(undefined);
        }}
        onSave={handleSaveItem}
        listId={list.id}
        item={editingItem}
      />
    </>
  );
}
