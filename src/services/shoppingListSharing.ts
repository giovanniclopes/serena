import { supabase } from "../lib/supabaseClient";
import type { ShareRole } from "../types";
import { findUserByEmailOrUsername } from "./users";

export async function shareShoppingList(params: {
  shoppingListId: string;
  userIdentifier: string;
  role: ShareRole;
}): Promise<{ success: boolean; message?: string }> {
  const user = await findUserByEmailOrUsername(params.userIdentifier);
  if (!user) {
    return { success: false, message: "Usuário não encontrado" };
  }

  const { error } = await supabase.from("shopping_list_shares").upsert(
    {
      shopping_list_id: params.shoppingListId,
      shared_with_user_id: user.id,
      role: params.role,
    },
    { onConflict: "shopping_list_id,shared_with_user_id" }
  );

  if (error) {
    console.error("Erro ao compartilhar lista de compras:", error);
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function getShoppingListShares(shoppingListId: string): Promise<
  Array<{
    id: string;
    role: ShareRole;
    createdAt: string;
    user: {
      id: string;
      username?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    };
  }>
> {
  const { data, error } = await supabase
    .from("shopping_list_shares")
    .select("id, role, created_at, shared_with_user_id")
    .eq("shopping_list_id", shoppingListId);

  if (error) {
    console.error("Erro ao listar compartilhamentos:", error);
    return [];
  }

  const shares = data as Array<{
    id: string;
    role: ShareRole;
    created_at: string;
    shared_with_user_id: string;
  }>;

  const userPromises = shares.map(async (share) => {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, first_name, last_name, avatar_url")
      .eq("id", share.shared_with_user_id)
      .maybeSingle();

    if (profileError) {
      console.error("Erro ao buscar perfil do usuário compartilhado:", profileError);
      console.error("User ID:", share.shared_with_user_id);
    }

    if (!profile) {
      console.warn("Perfil não encontrado para usuário:", share.shared_with_user_id);
    }

    return {
      id: share.id,
      role: share.role as ShareRole,
      createdAt: share.created_at,
      user: {
        id: share.shared_with_user_id,
        username: profile?.username ?? null,
        firstName: profile?.first_name ?? null,
        lastName: profile?.last_name ?? null,
      },
    };
  });

  return Promise.all(userPromises);
}

export async function updateShoppingListShareRole(
  shareId: string,
  role: ShareRole
) {
  const { error } = await supabase
    .from("shopping_list_shares")
    .update({ role })
    .eq("id", shareId);

  if (error) {
    throw error;
  }
}

export async function revokeShoppingListShare(shareId: string) {
  const { error } = await supabase
    .from("shopping_list_shares")
    .delete()
    .eq("id", shareId);
  if (error) {
    throw error;
  }
}

export async function getSharedShoppingListIds(): Promise<string[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.warn("Usuário não autenticado ao buscar listas compartilhadas");
    return [];
  }

  const { data, error } = await supabase
    .from("shopping_list_shares")
    .select("shopping_list_id")
    .eq("shared_with_user_id", user.id);

  if (error) {
    console.error("Erro ao buscar listas compartilhadas:", error);
    console.error("User ID:", user.id);
    return [];
  }

  const ids = (data || []).map((row) => row.shopping_list_id);
  console.log("Listas compartilhadas encontradas:", ids.length, "IDs:", ids);
  return ids;
}

export async function getShoppingListOwner(shoppingListId: string): Promise<{
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
} | null> {
  const { data: list, error: listError } = await supabase
    .from("shopping_lists")
    .select("user_id")
    .eq("id", shoppingListId)
    .maybeSingle();

  if (listError) {
    console.error("Erro ao buscar lista:", listError);
    return null;
  }

  if (!list) {
    console.warn("Lista não encontrada:", shoppingListId);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, first_name, last_name, avatar_url")
    .eq("id", list.user_id)
    .maybeSingle();

  if (profileError) {
    console.error("Erro ao buscar perfil do proprietário:", profileError);
    console.error("User ID:", list.user_id);
  }

  if (!profile) {
    console.warn("Perfil não encontrado para proprietário:", list.user_id);
    return {
      id: list.user_id,
      username: null,
      firstName: null,
      lastName: null,
      avatarUrl: null,
    };
  }

  return {
    id: list.user_id,
    username: profile.username ?? null,
    firstName: profile.first_name ?? null,
    lastName: profile.last_name ?? null,
    avatarUrl: profile.avatar_url ?? null,
  };
}

export async function isShoppingListOwner(
  shoppingListId: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: listRow } = await supabase
    .from("shopping_lists")
    .select("user_id")
    .eq("id", shoppingListId)
    .maybeSingle();

  return listRow?.user_id === user.id;
}

export async function canEditShoppingList(
  shoppingListId: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: listRow } = await supabase
    .from("shopping_lists")
    .select("user_id")
    .eq("id", shoppingListId)
    .maybeSingle();

  if (listRow && listRow.user_id === user.id) {
    return true;
  }

  const { data: shares } = await supabase
    .from("shopping_list_shares")
    .select("role")
    .eq("shopping_list_id", shoppingListId)
    .eq("shared_with_user_id", user.id);

  return (shares ?? []).some((s) => s.role === "editor");
}

export async function canViewShoppingList(
  shoppingListId: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const isOwner = await isShoppingListOwner(shoppingListId);
  if (isOwner) {
    return true;
  }

  const { data: shares } = await supabase
    .from("shopping_list_shares")
    .select("role")
    .eq("shopping_list_id", shoppingListId)
    .eq("shared_with_user_id", user.id);

  return (shares ?? []).length > 0;
}

