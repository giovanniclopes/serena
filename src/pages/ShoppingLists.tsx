import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import FilterControls from "../components/FilterControls";
import FloatingActionButton from "../components/FloatingActionButton";
import ShoppingListCard from "../components/ShoppingListCard";
import ShoppingListModal from "../components/ShoppingListModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { SHOPPING_CATEGORIES } from "../constants/shoppingCategories";
import { useApp } from "../context/AppContext";
import {
  useCreateShoppingList,
  useDeleteShoppingList,
  useShoppingLists,
} from "../features/shopping-lists/useShoppingLists";
import type { ShoppingList } from "../types";
import { filterShoppingLists, searchShoppingLists } from "../utils";

export default function ShoppingLists() {
  const { state } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | undefined>(
    undefined
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  const {
    data: shoppingLists,
    isLoading,
    error,
  } = useShoppingLists(state.activeWorkspaceId);
  const createListMutation = useCreateShoppingList();
  const deleteListMutation = useDeleteShoppingList();

  const filteredLists = filterShoppingLists(
    searchShoppingLists(shoppingLists || [], searchQuery),
    showCompleted
  ).filter((list) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "completed") return list.isCompleted;
    if (selectedCategory === "pending") return !list.isCompleted;
    return list.category === selectedCategory;
  });

  const handleCreateList = () => {
    setEditingList(undefined);
    setIsModalOpen(true);
  };

  const handleEditList = (list: ShoppingList) => {
    setEditingList(list);
    setIsModalOpen(true);
  };

  const handleDeleteList = (listId: string) => {
    setListToDelete(listId);
    setShowDeleteModal(true);
  };

  const confirmDeleteList = () => {
    if (listToDelete) {
      deleteListMutation.mutate(listToDelete);
      setShowDeleteModal(false);
      setListToDelete(null);
    }
  };

  const handleSaveList = (listData: {
    name: string;
    description?: string;
    category: string;
    color: string;
    icon?: string;
  }) => {
    if (editingList) {
      console.log("Update list:", editingList.id, listData);
    } else {
      createListMutation.mutate({
        ...listData,
        workspaceId: state.activeWorkspaceId,
      });
    }
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div
          className="text-red-500 mb-2"
          style={{ color: state.currentTheme.colors.error }}
        >
          Erro ao carregar listas de compras
        </div>
        <div
          className="text-sm"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Tente recarregar a página
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: state.currentTheme.colors.text }}
        >
          Listas de Compras
        </h1>
      </div>

      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        searchPlaceholder="Buscar listas de compras..."
        showCompletedLabel="Mostrar concluídas"
      />

      <div>
        <h3
          className="text-sm font-medium mb-2"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Categorias
        </h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger
            className="w-full h-12 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          >
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent
            className="rounded-xl border-2 shadow-lg"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              borderColor: state.currentTheme.colors.border,
            }}
          >
            <SelectItem
              value="all"
              className="text-sm font-medium hover:bg-opacity-10"
              style={{
                color: state.currentTheme.colors.text,
              }}
            >
              Todas as categorias
            </SelectItem>
            <SelectItem
              value="pending"
              className="text-sm font-medium hover:bg-opacity-10"
              style={{
                color: state.currentTheme.colors.text,
              }}
            >
              Pendentes
            </SelectItem>
            <SelectItem
              value="completed"
              className="text-sm font-medium hover:bg-opacity-10"
              style={{
                color: state.currentTheme.colors.text,
              }}
            >
              Concluídas
            </SelectItem>
            {SHOPPING_CATEGORIES.map((category) => (
              <SelectItem
                key={category.value}
                value={category.value}
                className="text-sm font-medium hover:bg-opacity-10"
                style={{
                  color: state.currentTheme.colors.text,
                }}
              >
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredLists.length > 0 ? (
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }`}
        >
          {filteredLists.map((list) => (
            <ShoppingListCard
              key={list.id}
              list={list}
              onEdit={handleEditList}
              onDelete={handleDeleteList}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title={
            searchQuery
              ? "Nenhuma lista encontrada"
              : selectedCategory === "completed"
              ? "Nenhuma lista concluída"
              : selectedCategory !== "all"
              ? "Nenhuma lista nesta categoria"
              : "Nenhuma lista criada"
          }
          description={
            searchQuery
              ? "Tente ajustar sua busca ou filtros para encontrar o que procura."
              : selectedCategory === "completed"
              ? "Você ainda não concluiu nenhuma lista. Continue organizando suas compras!"
              : selectedCategory !== "all"
              ? `Não há listas na categoria "${SHOPPING_CATEGORIES.find((c) => c.value === selectedCategory)?.label || selectedCategory}". Tente outra categoria ou crie uma nova lista.`
              : "Crie listas de compras para organizar suas compras e nunca mais esquecer de comprar algo importante."
          }
          actionLabel={
            searchQuery || selectedCategory === "completed"
              ? undefined
              : "Criar Primeira Lista"
          }
          onAction={
            searchQuery || selectedCategory === "completed"
              ? undefined
              : handleCreateList
          }
        />
      )}

      <ShoppingListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        list={editingList}
        onSave={handleSaveList}
        categories={SHOPPING_CATEGORIES}
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setListToDelete(null);
        }}
        onConfirm={confirmDeleteList}
        title="Excluir Lista de Compras"
        message="Tem certeza que deseja excluir esta lista? Todos os itens associados serão removidos. Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteListMutation.isPending}
      />

      <FloatingActionButton onClick={handleCreateList} />
    </div>
  );
}
