import { supabase } from "../lib/supabaseClient";
import type { ProjectGoal } from "../types";

export async function getGoals(projectId?: string): Promise<ProjectGoal[]> {
  let query = supabase
    .from("project_goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar metas:", error);
    throw new Error("Não foi possível carregar as metas.");
  }

  return (data || []).map((goal) => ({
    id: goal.id,
    projectId: goal.project_id,
    workspaceId: goal.workspace_id,
    title: goal.title,
    description: goal.description,
    dueDate: goal.due_date ? new Date(goal.due_date) : undefined,
    status: goal.status,
    progress: goal.progress || 0,
    targetValue: goal.target_value ? Number(goal.target_value) : undefined,
    currentValue: goal.current_value ? Number(goal.current_value) : 0,
    completedAt: goal.completed_at ? new Date(goal.completed_at) : undefined,
    createdAt: new Date(goal.created_at),
    updatedAt: new Date(goal.updated_at),
  }));
}

export async function createGoal(
  goal: Omit<ProjectGoal, "id" | "createdAt" | "updatedAt">
): Promise<ProjectGoal> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("project_goals")
    .insert([
      {
        project_id: goal.projectId,
        workspace_id: goal.workspaceId,
        user_id: user.id,
        title: goal.title,
        description: goal.description,
        due_date: goal.dueDate ? goal.dueDate.toISOString() : null,
        status: goal.status || "pending",
        progress: goal.progress || 0,
        target_value: goal.targetValue || null,
        current_value: goal.currentValue || 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar meta:", error);
    throw new Error("Não foi possível criar a meta.");
  }

  return {
    id: data.id,
    projectId: data.project_id,
    workspaceId: data.workspace_id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    status: data.status,
    progress: data.progress || 0,
    targetValue: data.target_value ? Number(data.target_value) : undefined,
    currentValue: data.current_value ? Number(data.current_value) : 0,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateGoal(
  id: string,
  updates: Partial<ProjectGoal>
): Promise<ProjectGoal> {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.dueDate !== undefined)
    updateData.due_date = updates.dueDate
      ? updates.dueDate.toISOString()
      : null;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.targetValue !== undefined)
    updateData.target_value = updates.targetValue || null;
  if (updates.currentValue !== undefined)
    updateData.current_value = updates.currentValue;
  if (updates.completedAt !== undefined)
    updateData.completed_at = updates.completedAt
      ? updates.completedAt.toISOString()
      : null;

  const { data, error } = await supabase
    .from("project_goals")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar meta:", error);
    throw new Error("Não foi possível atualizar a meta.");
  }

  return {
    id: data.id,
    projectId: data.project_id,
    workspaceId: data.workspace_id,
    title: data.title,
    description: data.description,
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    status: data.status,
    progress: data.progress || 0,
    targetValue: data.target_value ? Number(data.target_value) : undefined,
    currentValue: data.current_value ? Number(data.current_value) : 0,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from("project_goals").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar meta:", error);
    throw new Error("Não foi possível deletar a meta.");
  }
}

export async function completeGoal(id: string): Promise<ProjectGoal> {
  return updateGoal(id, {
    status: "completed",
    progress: 100,
    completedAt: new Date(),
  });
}

export async function uncompleteGoal(id: string): Promise<ProjectGoal> {
  return updateGoal(id, {
    status: "in_progress",
    completedAt: undefined,
  });
}

