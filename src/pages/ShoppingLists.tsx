import { ShoppingCart } from "lucide-react";
import { useState } from "react";
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
      // TODO: Implementar update
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

      {/* Filtros de Categoria */}
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

      {/* Lista de Listas */}
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
        <div
          className="text-center py-8 rounded-lg"
          style={{ backgroundColor: state.currentTheme.colors.surface }}
        >
          <div
            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "20",
            }}
          >
            <ShoppingCart
              className="w-6 h-6"
              style={{ color: state.currentTheme.colors.primary }}
            />
          </div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: state.currentTheme.colors.text }}
          >
            Nenhuma lista encontrada
          </h3>
          <p
            className="text-sm"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            {searchQuery
              ? "Tente ajustar sua busca ou filtros"
              : selectedCategory === "all"
              ? "Que tal criar sua primeira lista de compras?"
              : "Nenhuma lista nesta categoria"}
          </p>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <ShoppingListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        list={editingList}
        onSave={handleSaveList}
        categories={SHOPPING_CATEGORIES}
      />

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: state.currentTheme.colors.surface }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: state.currentTheme.colors.text }}
            >
              Excluir lista de compras
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Tem certeza que deseja excluir esta lista? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setListToDelete(null);
                }}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                style={{
                  backgroundColor: state.currentTheme.colors.surface,
                  color: state.currentTheme.colors.textSecondary,
                  border: `1px solid ${state.currentTheme.colors.border}`,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteList}
                disabled={deleteListMutation.isPending}
                className="px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                style={{
                  backgroundColor: state.currentTheme.colors.error,
                  color: "white",
                }}
              >
                {deleteListMutation.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingActionButton onClick={handleCreateList} />
    </div>
  );
}
