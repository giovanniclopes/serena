import { supabase } from "../lib/supabaseClient";
import type { ShareRole } from "../types";
import { findUserByEmailOrUsername } from "./users";

export async function shareStickyNote(params: {
  stickyNoteId: string;
  userIdentifier: string;
  role: ShareRole;
}): Promise<{ success: boolean; message?: string }> {
  const user = await findUserByEmailOrUsername(params.userIdentifier);
  if (!user) {
    return { success: false, message: "Usuário não encontrado" };
  }

  const { error } = await supabase.from("sticky_note_shares").upsert(
    {
      sticky_note_id: params.stickyNoteId,
      shared_with_user_id: user.id,
      role: params.role,
    },
    { onConflict: "sticky_note_id,shared_with_user_id" }
  );

  if (error) {
    console.error("Erro ao compartilhar post-it:", error);
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function getStickyNoteShares(stickyNoteId: string): Promise<
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
    .from("sticky_note_shares")
    .select("id, role, created_at, shared_with_user_id")
    .eq("sticky_note_id", stickyNoteId);

  if (error) {
    console.error("Erro ao listar compartilhamentos:", error);
    return [];
  }

  const shares = data as Array<{
    id: string;
    role: string;
    created_at: string;
    shared_with_user_id: string;
  }>;

  const sharesWithUsers = await Promise.all(
    shares.map(async (share) => {
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, username, first_name, last_name")
        .eq("id", share.shared_with_user_id)
        .maybeSingle();

      return {
        id: share.id,
        role: share.role as ShareRole,
        createdAt: share.created_at,
        user: {
          id: share.shared_with_user_id,
          username: userData?.username || null,
          firstName: userData?.first_name || null,
          lastName: userData?.last_name || null,
        },
      };
    })
  );

  return sharesWithUsers;
}

export async function updateStickyNoteShareRole(
  shareId: string,
  role: ShareRole
) {
  const { error } = await supabase
    .from("sticky_note_shares")
    .update({ role })
    .eq("id", shareId);

  if (error) {
    throw error;
  }
}

export async function revokeStickyNoteShare(shareId: string) {
  const { error } = await supabase
    .from("sticky_note_shares")
    .delete()
    .eq("id", shareId);
  if (error) {
    throw error;
  }
}

export async function getSharedStickyNoteIds(): Promise<string[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("sticky_note_shares")
    .select("sticky_note_id")
    .eq("shared_with_user_id", user.id);

  if (error) {
    console.error("Erro ao buscar post-its compartilhados:", error);
    return [];
  }

  return (data || []).map((row) => row.sticky_note_id);
}

export async function canEditStickyNote(
  stickyNoteId: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: noteRow } = await supabase
    .from("sticky_notes")
    .select("user_id")
    .eq("id", stickyNoteId)
    .maybeSingle();

  if (noteRow && noteRow.user_id === user.id) {
    return true;
  }

  const { data: shares } = await supabase
    .from("sticky_note_shares")
    .select("role")
    .eq("sticky_note_id", stickyNoteId)
    .eq("shared_with_user_id", user.id);

  return (shares ?? []).some((s) => s.role === "editor");
}

export async function isStickyNoteOwner(
  stickyNoteId: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: noteRow } = await supabase
    .from("sticky_notes")
    .select("user_id")
    .eq("id", stickyNoteId)
    .maybeSingle();

  return noteRow?.user_id === user.id;
}

export async function getStickyNoteOwner(stickyNoteId: string): Promise<{
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
} | null> {
  const { data: noteRow } = await supabase
    .from("sticky_notes")
    .select("user_id")
    .eq("id", stickyNoteId)
    .maybeSingle();

  if (!noteRow) {
    return null;
  }

  const { data: userData } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name")
    .eq("id", noteRow.user_id)
    .maybeSingle();

  if (!userData) {
    return null;
  }

  return {
    id: userData.id,
    username: userData.username || null,
    firstName: userData.first_name || null,
    lastName: userData.last_name || null,
  };
}
