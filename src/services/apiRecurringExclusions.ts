import { supabase } from "../lib/supabaseClient";

export interface RecurringExclusionRecord {
  id: string;
  task_id: string;
  user_id: string;
  workspace_id: string;
  excluded_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export async function listRecurringExclusions(
  taskIds: string[],
  startDate: string,
  endDate: string,
): Promise<RecurringExclusionRecord[]> {
  if (!taskIds.length) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("task_recurring_exclusions")
    .select("*")
    .in("task_id", taskIds)
    .eq("user_id", user.id)
    .gte("excluded_date", startDate)
    .lte("excluded_date", endDate);

  if (error) {
    console.error("Erro ao listar exclusões recorrentes:", error);
    throw error;
  }

  return data as RecurringExclusionRecord[];
}

export async function excludeRecurringInstance(
  taskId: string,
  excludedDate: string, // YYYY-MM-DD
  workspaceId: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("task_recurring_exclusions").upsert(
    {
      task_id: taskId,
      user_id: user.id,
      workspace_id: workspaceId,
      excluded_date: excludedDate,
    },
    { onConflict: "user_id,task_id,workspace_id,excluded_date" },
  );

  if (error) {
    console.error("Erro ao registrar exclusão recorrente:", error);
    throw error;
  }
}

export async function removeRecurringExclusion(
  taskId: string,
  excludedDate: string, // YYYY-MM-DD
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("task_recurring_exclusions")
    .delete()
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .eq("excluded_date", excludedDate);

  if (error) {
    console.error("Erro ao remover exclusão recorrente:", error);
    throw error;
  }
}
