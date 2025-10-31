import { supabase } from "../lib/supabaseClient";
import type { ShareRole } from "../types";
import { findUserByEmailOrUsername } from "./users";
import { sanitizeTaskIdForAPI } from "../utils/taskUtils";

export async function shareTask(params: {
  taskId: string;
  userIdentifier: string;
  role: ShareRole;
}): Promise<{ success: boolean; message?: string }> {
  const user = await findUserByEmailOrUsername(params.userIdentifier);
  if (!user) {
    return { success: false, message: "Usuário não encontrado" };
  }

  const { error } = await supabase.from("task_shares").upsert(
    {
      task_id: sanitizeTaskIdForAPI(params.taskId),
      shared_with_user_id: user.id,
      role: params.role,
    },
    { onConflict: "task_id,shared_with_user_id" }
  );

  if (error) {
    console.error("Erro ao compartilhar tarefa:", error);
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function getTaskShares(taskId: string): Promise<
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
    .from("task_shares")
    .select("id, role, created_at, shared_with_user_id")
    .eq("task_id", sanitizeTaskIdForAPI(taskId));

  if (error) {
    console.error("Erro ao listar compartilhamentos:", error);
    return [];
  }
  return (
    data as Array<{
      id: string;
      role: ShareRole;
      created_at: string;
      shared_with_user_id: string;
    }>
  ).map((row) => ({
    id: row.id,
    role: row.role as ShareRole,
    createdAt: row.created_at,
    user: {
      id: row.shared_with_user_id,
      username: null,
      firstName: null,
      lastName: null,
    },
  }));
}

export async function updateTaskShareRole(shareId: string, role: ShareRole) {
  const { error } = await supabase
    .from("task_shares")
    .update({ role })
    .eq("id", shareId);

  if (error) {
    throw error;
  }
}

export async function revokeTaskShare(shareId: string) {
  const { error } = await supabase
    .from("task_shares")
    .delete()
    .eq("id", shareId);
  if (error) {
    throw error;
  }
}

export async function getSharedTaskIds(): Promise<string[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("task_shares")
    .select("task_id")
    .eq("shared_with_user_id", user.id);

  if (error) {
    console.error("Erro ao buscar tarefas compartilhadas:", error);
    return [];
  }

  return (data || []).map((row) => row.task_id);
}

export async function canEditTask(taskId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: taskRow } = await supabase
    .from("tasks")
    .select("user_id")
    .eq("id", sanitizeTaskIdForAPI(taskId))
    .maybeSingle();

  if (taskRow && taskRow.user_id === user.id) {
    return true;
  }

  const { data: shares } = await supabase
    .from("task_shares")
    .select("role")
    .eq("task_id", sanitizeTaskIdForAPI(taskId))
    .eq("shared_with_user_id", user.id);

  return (shares ?? []).some((s) => s.role === "editor");
}
