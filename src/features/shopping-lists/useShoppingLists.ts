import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createShoppingList,
  createShoppingListItem,
  deleteShoppingList,
  deleteShoppingListItem,
  getShoppingLists,
  reorderShoppingListItems,
  updateShoppingList,
  updateShoppingListItem,
} from "../../services/apiShoppingLists";
import type {
  UpdateShoppingListData,
  UpdateShoppingListItemData,
} from "../../types";

export function useShoppingLists(workspaceId?: string) {
  return useQuery({
    queryKey: ["shopping-lists", workspaceId],
    queryFn: () => getShoppingLists(workspaceId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Lista de compras criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar lista de compras:", error);
      toast.error("Erro ao criar lista de compras");
    },
  });
}

export function useUpdateShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateShoppingListData;
    }) => updateShoppingList(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Lista de compras atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar lista de compras:", error);
      toast.error("Erro ao atualizar lista de compras");
    },
  });
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Lista de compras excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir lista de compras:", error);
      toast.error("Erro ao excluir lista de compras");
    },
  });
}

export function useCreateShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShoppingListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Item adicionado à lista!");
    },
    onError: (error) => {
      console.error("Erro ao criar item da lista:", error);
      toast.error("Erro ao adicionar item à lista");
    },
  });
}

export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateShoppingListItemData;
    }) => updateShoppingListItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar item da lista:", error);
      toast.error("Erro ao atualizar item");
    },
  });
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShoppingListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
      toast.success("Item removido da lista!");
    },
    onError: (error) => {
      console.error("Erro ao excluir item da lista:", error);
      toast.error("Erro ao remover item da lista");
    },
  });
}

export function useReorderShoppingListItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderShoppingListItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: (error) => {
      console.error("Erro ao reordenar itens:", error);
      toast.error("Erro ao reordenar itens");
    },
  });
}

export function useToggleShoppingListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPurchased }: { id: string; isPurchased: boolean }) =>
      updateShoppingListItem(id, { isPurchased }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    },
    onError: (error) => {
      console.error("Erro ao marcar item:", error);
      toast.error("Erro ao marcar item");
    },
  });
}
