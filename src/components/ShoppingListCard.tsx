import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle, Edit, GripVertical, Share2, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import {
  useCreateShoppingListItem,
  useReorderShoppingListItems,
  useUpdateShoppingListItem,
} from "../features/shopping-lists/useShoppingLists";
import { useShoppingListPermissions } from "../hooks/useShoppingListPermissions";
import { getShoppingListOwner } from "../services/shoppingListSharing";
import type {
  ShoppingList,
  ShoppingListItem as ShoppingListItemType,
} from "../types";
import ShareShoppingListModal from "./ShareShoppingListModal";
import ShoppingListItem from "./ShoppingListItem";
import ShoppingListItemModal from "./ShoppingListItemModal";

interface SortableShoppingListItemProps {
  item: ShoppingListItemType;
  listColor: string;
  onEdit?: (item: ShoppingListItemType) => void;
  canEdit?: boolean;
}

function SortableShoppingListItem({
  item,
  listColor,
  onEdit,
  canEdit,
}: SortableShoppingListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2">
        {canEdit && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-opacity-10 transition-colors"
            style={{
              color: listColor,
              backgroundColor: listColor + "10",
            }}
            aria-label="Arrastar para reordenar"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1">
          <ShoppingListItem
            item={item}
            listColor={listColor}
            onEdit={onEdit}
            canEdit={canEdit}
          />
        </div>
      </div>
    </div>
  );
}

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    ShoppingListItemType | undefined
  >(undefined);

  const createItemMutation = useCreateShoppingListItem();
  const updateItemMutation = useUpdateShoppingListItem();
  const reorderItemsMutation = useReorderShoppingListItems();
  const { isOwner, canEdit } = useShoppingListPermissions(list.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [sharedBy, setSharedBy] = useState<{
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null>(null);

  useEffect(() => {
    const loadOwner = async () => {
      if (!isOwner && list.id) {
        try {
          const owner = await getShoppingListOwner(list.id);
          if (owner) {
            setSharedBy({
              username: owner.username,
              firstName: owner.firstName,
              lastName: owner.lastName,
            });
          }
        } catch (error) {
          console.error("Erro ao buscar proprietário:", error);
        }
      } else {
        setSharedBy(null);
      }
    };
    loadOwner();
  }, [isOwner, list.id]);

  const completedItems = list.items.filter((item) => item.isPurchased).length;
  const totalItems = list.items.length;
  const progressPercentage =
    totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

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
    links?: string[];
  }) => {
    if (editingItem) {
      updateItemMutation.mutate({
        id: editingItem.id,
        updates: {
          name: itemData.name,
          quantity: itemData.quantity,
          notes: itemData.notes,
          price: itemData.price,
          links: itemData.links,
        },
      });
    } else {
      createItemMutation.mutate({
        shoppingListId: list.id,
        name: itemData.name,
        quantity: itemData.quantity,
        notes: itemData.notes,
        price: itemData.price,
        workspaceId: list.workspaceId,
        links: itemData.links,
      });
    }
    setIsItemModalOpen(false);
    setEditingItem(undefined);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !list.items || list.items.length === 0) {
      return;
    }

    const oldIndex = list.items.findIndex((item) => item.id === active.id);
    const newIndex = list.items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedItems = arrayMove(list.items, oldIndex, newIndex);

    await reorderItemsMutation.mutateAsync(
      reorderedItems.map((item, index) => ({
        id: item.id,
        orderIndex: index,
      }))
    );
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
            {!isOwner && sharedBy && (
              <div
                className="px-2 py-1 rounded-md text-xs flex items-center gap-1"
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "15",
                  color: state.currentTheme.colors.primary,
                  border: `1px solid ${state.currentTheme.colors.primary}30`,
                }}
                title={`Compartilhado por ${sharedBy.firstName && sharedBy.lastName ? `${sharedBy.firstName} ${sharedBy.lastName}` : sharedBy.firstName || sharedBy.username || "usuário"}`}
              >
                <Share2 className="w-3 h-3" />
                <span>
                  Compartilhado por{" "}
                  {sharedBy.firstName && sharedBy.lastName
                    ? `${sharedBy.firstName} ${sharedBy.lastName}`
                    : sharedBy.firstName || sharedBy.username || "usuário"}
                </span>
              </div>
            )}
            {isOwner && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
                style={{
                  color: state.currentTheme.colors.primary,
                  backgroundColor: state.currentTheme.colors.primary + "10",
                }}
                aria-label="Compartilhar lista de compras"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => onEdit(list)}
                className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
                style={{
                  color: state.currentTheme.colors.textSecondary,
                  backgroundColor: state.currentTheme.colors.textSecondary + "10",
                }}
                aria-label="Editar lista de compras"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDelete(list.id)}
                className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
                style={{
                  color: state.currentTheme.colors.error,
                  backgroundColor: state.currentTheme.colors.error + "10",
                }}
                aria-label="Excluir lista de compras"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

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

        {isExpanded && (
          <div className="space-y-2 mb-3">
            {list.items.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={list.items
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {list.items
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((item) => (
                      <SortableShoppingListItem
                        key={item.id}
                        item={item}
                        listColor={list.color}
                        onEdit={canEdit ? handleEditItem : undefined}
                        canEdit={canEdit}
                      />
                    ))}
                </SortableContext>
              </DndContext>
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
            {isExpanded && canEdit && (
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

      <ShareShoppingListModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        list={list}
      />
    </>
  );
}
