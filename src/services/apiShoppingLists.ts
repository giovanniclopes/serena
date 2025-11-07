import { supabase } from "../lib/supabaseClient";
import { getSharedShoppingListIds } from "./shoppingListSharing";
import type {
  CreateShoppingListData,
  CreateShoppingListItemData,
  ShoppingList,
  ShoppingListItem,
  UpdateShoppingListData,
  UpdateShoppingListItemData,
} from "../types";

export async function getShoppingLists(
  workspaceId?: string
): Promise<ShoppingList[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const sharedListIds = await getSharedShoppingListIds();

  const ownListsQuery = supabase
    .from("shopping_lists")
    .select(
      `
      *,
      shopping_list_items (
        id,
        shopping_list_id,
        name,
        quantity,
        notes,
        price,
        is_purchased,
        purchased_at,
        order_index,
        workspace_id,
        created_at,
        updated_at
      )
    `
    )
    .eq("user_id", user.id);

  if (workspaceId) {
    ownListsQuery.eq("workspace_id", workspaceId);
  }

  const ownListsResult = await ownListsQuery.order("created_at", {
    ascending: false,
  });

  let sharedListsResult: any = { data: [], error: null };

  if (sharedListIds.length > 0) {
    const sharedQuery = supabase
      .from("shopping_lists")
      .select(
        `
      *,
      shopping_list_items (
        id,
        shopping_list_id,
        name,
        quantity,
        notes,
        price,
        is_purchased,
        purchased_at,
        order_index,
        workspace_id,
        created_at,
        updated_at
      )
    `
      )
      .in("id", sharedListIds);

    sharedListsResult = await sharedQuery.order("created_at", {
      ascending: false,
    });
  }

  if (ownListsResult.error) {
    console.error("Erro ao buscar listas próprias:", ownListsResult.error);
    throw ownListsResult.error;
  }

  if (sharedListsResult.error) {
    console.error("Erro ao buscar listas compartilhadas:", sharedListsResult.error);
    console.error("IDs compartilhados:", sharedListIds);
    throw sharedListsResult.error;
  }

  const data = [
    ...(ownListsResult.data || []),
    ...(sharedListsResult.data || []),
  ].filter(
    (list, index, self) =>
      index === self.findIndex((l) => l.id === list.id)
  );

  if (sharedListIds.length > 0 && sharedListsResult.data?.length === 0) {
    console.warn("Listas compartilhadas não encontradas. IDs:", sharedListIds);
    console.warn("Verifique se as políticas RLS estão corretas.");
  }

  return (
    data?.map((list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      category: list.category,
      color: list.color,
      icon: list.icon,
      isCompleted: list.is_completed,
      completedAt: list.completed_at ? new Date(list.completed_at) : undefined,
      workspaceId: list.workspace_id,
      items:
        list.shopping_list_items?.map((item: any) => ({
          id: item.id,
          shoppingListId: item.shopping_list_id,
          name: item.name,
          quantity: item.quantity,
          notes: item.notes,
          price: item.price,
          isPurchased: item.is_purchased,
          purchasedAt: item.purchased_at
            ? new Date(item.purchased_at)
            : undefined,
          orderIndex: item.order_index,
          workspaceId: item.workspace_id,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        })) || [],
      createdAt: new Date(list.created_at),
      updatedAt: new Date(list.updated_at),
    })) || []
  );
}

export async function createShoppingList(
  shoppingList: CreateShoppingListData
): Promise<ShoppingList> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("shopping_lists")
    .insert({
      name: shoppingList.name,
      description: shoppingList.description,
      category: shoppingList.category,
      color: shoppingList.color,
      icon: shoppingList.icon,
      workspace_id: shoppingList.workspaceId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar lista de compras:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category,
    color: data.color,
    icon: data.icon,
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    items: [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateShoppingList(
  id: string,
  updates: UpdateShoppingListData
): Promise<ShoppingList> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { canEditShoppingList } = await import("./shoppingListSharing");
  const canEdit = await canEditShoppingList(id);

  if (!canEdit) {
    throw new Error("Você não tem permissão para editar esta lista");
  }

  const { data, error } = await supabase
    .from("shopping_lists")
    .update({
      name: updates.name,
      description: updates.description,
      category: updates.category,
      color: updates.color,
      icon: updates.icon,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar lista de compras:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category,
    color: data.color,
    icon: data.icon,
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    items: [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteShoppingList(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { isShoppingListOwner } = await import("./shoppingListSharing");
  const isOwner = await isShoppingListOwner(id);

  if (!isOwner) {
    throw new Error("Apenas o proprietário da lista pode excluí-la");
  }

  const { error } = await supabase
    .from("shopping_lists")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao excluir lista de compras:", error);
    throw error;
  }
}

export async function createShoppingListItem(
  item: CreateShoppingListItemData
): Promise<ShoppingListItem> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { canEditShoppingList } = await import("./shoppingListSharing");
  const canEdit = await canEditShoppingList(item.shoppingListId);

  if (!canEdit) {
    throw new Error("Você não tem permissão para adicionar itens a esta lista");
  }

  const { data, error } = await supabase
    .from("shopping_list_items")
    .insert({
      shopping_list_id: item.shoppingListId,
      name: item.name,
      quantity: item.quantity || "1",
      notes: item.notes,
      price: item.price,
      order_index: item.orderIndex || 0,
      workspace_id: item.workspaceId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar item da lista:", error);
    throw error;
  }

  return {
    id: data.id,
    shoppingListId: data.shopping_list_id,
    name: data.name,
    quantity: data.quantity,
    notes: data.notes,
    price: data.price,
    isPurchased: data.is_purchased,
    purchasedAt: data.purchased_at ? new Date(data.purchased_at) : undefined,
    orderIndex: data.order_index,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateShoppingListItem(
  id: string,
  updates: UpdateShoppingListItemData
): Promise<ShoppingListItem> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: item } = await supabase
    .from("shopping_list_items")
    .select("shopping_list_id")
    .eq("id", id)
    .maybeSingle();

  if (!item) {
    throw new Error("Item não encontrado");
  }

  const { canEditShoppingList } = await import("./shoppingListSharing");
  const canEdit = await canEditShoppingList(item.shopping_list_id);

  if (!canEdit) {
    throw new Error("Você não tem permissão para editar este item");
  }

  const updateData: any = {
    name: updates.name,
    quantity: updates.quantity,
    notes: updates.notes,
    price: updates.price,
    order_index: updates.orderIndex,
    updated_at: new Date().toISOString(),
  };

  if (updates.isPurchased !== undefined) {
    updateData.is_purchased = updates.isPurchased;
    updateData.purchased_at = updates.isPurchased
      ? new Date().toISOString()
      : null;
  }

  const { data, error } = await supabase
    .from("shopping_list_items")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar item da lista:", error);
    throw error;
  }

  return {
    id: data.id,
    shoppingListId: data.shopping_list_id,
    name: data.name,
    quantity: data.quantity,
    notes: data.notes,
    price: data.price,
    isPurchased: data.is_purchased,
    purchasedAt: data.purchased_at ? new Date(data.purchased_at) : undefined,
    orderIndex: data.order_index,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteShoppingListItem(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: item } = await supabase
    .from("shopping_list_items")
    .select("shopping_list_id")
    .eq("id", id)
    .maybeSingle();

  if (!item) {
    throw new Error("Item não encontrado");
  }

  const { canEditShoppingList } = await import("./shoppingListSharing");
  const canEdit = await canEditShoppingList(item.shopping_list_id);

  if (!canEdit) {
    throw new Error("Você não tem permissão para excluir este item");
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir item da lista:", error);
    throw error;
  }
}

export async function reorderShoppingListItems(
  items: { id: string; orderIndex: number }[]
): Promise<void> {
  const updates = items.map((item) =>
    supabase
      .from("shopping_list_items")
      .update({ order_index: item.orderIndex })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);

  const errors = results.filter((result) => result.error);
  if (errors.length > 0) {
    console.error("Erro ao reordenar itens:", errors);
    throw new Error("Falha ao reordenar itens da lista");
  }
}
