import { supabase } from "../lib/supabaseClient";

export interface RecurringCompletionRecord {
  id: string;
  task_id: string;
  user_id: string;
  workspace_id: string;
  instance_date: string; // YYYY-MM-DD
  is_completed: boolean;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export async function listRecurringCompletions(
  taskIds: string[],
  startDate: string,
  endDate: string
): Promise<RecurringCompletionRecord[]> {
  if (!taskIds.length) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("task_recurring_completions")
    .select("*")
    .in("task_id", taskIds)
    .eq("user_id", user.id)
    .gte("instance_date", startDate)
    .lte("instance_date", endDate);

  if (error) {
    console.error("Erro ao listar conclusões recorrentes:", error);
    throw error;
  }

  return data as RecurringCompletionRecord[];
}

export async function setRecurringCompletion(
  taskId: string,
  instanceDate: string, // YYYY-MM-DD
  isCompleted: boolean,
  workspaceId: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (isCompleted) {
    const { error } = await supabase.from("task_recurring_completions").upsert(
      {
        task_id: taskId,
        user_id: user.id,
        workspace_id: workspaceId,
        instance_date: instanceDate,
        is_completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "task_id,user_id,instance_date" }
    );
    if (error) {
      console.error("Erro ao registrar conclusão recorrente:", error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from("task_recurring_completions")
      .delete()
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .eq("instance_date", instanceDate);
    if (error) {
      console.error("Erro ao remover conclusão recorrente:", error);
      throw error;
    }
  }
}
