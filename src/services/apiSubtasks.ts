import { supabase } from "../lib/supabaseClient";
import type { Task } from "../types";
import { sanitizeTaskIdForAPI } from "../utils/taskUtils";

const formatDateForSupabase = (date?: Date): string | null => {
  if (!date) return null;
  return date.toISOString();
};

export async function getSubtasks(taskId: string): Promise<Task[]> {
  // Sanitizar o ID da tarefa para evitar erros com IDs de recorrência
  const originalTaskId = sanitizeTaskIdForAPI(taskId);

  const { data, error } = await supabase
    .from("subtasks")
    .select("*")
    .eq("task_id", originalTaskId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar subtarefas:", error);
    throw new Error("Falha ao carregar subtarefas");
  }

  return (data || []).map((subtask) => ({
    id: subtask.id,
    title: subtask.title,
    description: subtask.description,
    projectId: subtask.project_id,
    parentTaskId: subtask.parent_task_id,
    subtasks: [],
    dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
    priority: subtask.priority,
    reminders: subtask.reminders || [],
    tags: subtask.tags || [],
    attachments: subtask.attachments || [],
    isCompleted: subtask.is_completed,
    completedAt: subtask.completed_at
      ? new Date(subtask.completed_at)
      : undefined,
    workspaceId: subtask.workspace_id,
    createdAt: new Date(subtask.created_at),
    updatedAt: new Date(subtask.updated_at),
  }));
}

export async function createSubtask(
  subtask: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<Task> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Sanitizar o ID da tarefa pai para evitar erros com IDs de recorrência
  const originalParentTaskId = subtask.parentTaskId
    ? sanitizeTaskIdForAPI(subtask.parentTaskId)
    : null;

  const { data, error } = await supabase
    .from("subtasks")
    .insert({
      title: subtask.title,
      description: subtask.description,
      task_id: originalParentTaskId,
      parent_task_id: originalParentTaskId,
      due_date: formatDateForSupabase(subtask.dueDate),
      priority: subtask.priority,
      reminders: subtask.reminders,
      tags: subtask.tags,
      is_completed: subtask.isCompleted,
      completed_at: formatDateForSupabase(subtask.completedAt),
      workspace_id: subtask.workspaceId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar subtarefa:", error);
    throw new Error("Falha ao criar subtarefa");
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    projectId: data.project_id,
    parentTaskId: data.parent_task_id,
    subtasks: [],
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    priority: data.priority,
    reminders: data.reminders || [],
    tags: data.tags || [],
    attachments: data.attachments || [],
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateSubtask(subtask: Task): Promise<Task> {
  // Sanitizar o ID da tarefa pai para evitar erros com IDs de recorrência
  const originalParentTaskId = subtask.parentTaskId
    ? sanitizeTaskIdForAPI(subtask.parentTaskId)
    : null;

  const { data, error } = await supabase
    .from("subtasks")
    .update({
      title: subtask.title,
      description: subtask.description,
      task_id: originalParentTaskId,
      parent_task_id: originalParentTaskId,
      due_date: formatDateForSupabase(subtask.dueDate),
      priority: subtask.priority,
      reminders: subtask.reminders,
      tags: subtask.tags,
      is_completed: subtask.isCompleted,
      completed_at: formatDateForSupabase(subtask.completedAt),
      workspace_id: subtask.workspaceId,
      updated_at: formatDateForSupabase(new Date()),
    })
    .eq("id", subtask.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar subtarefa:", error);
    throw new Error("Falha ao atualizar subtarefa");
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    projectId: data.project_id,
    parentTaskId: data.parent_task_id,
    subtasks: [],
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    priority: data.priority,
    reminders: data.reminders || [],
    tags: data.tags || [],
    attachments: data.attachments || [],
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  const { error } = await supabase
    .from("subtasks")
    .delete()
    .eq("id", subtaskId);

  if (error) {
    console.error("Erro ao deletar subtarefa:", error);
    throw new Error("Falha ao deletar subtarefa");
  }
}

export async function completeSubtask(subtaskId: string): Promise<Task> {
  const { data, error } = await supabase
    .from("subtasks")
    .update({
      is_completed: true,
      completed_at: formatDateForSupabase(new Date()),
      updated_at: formatDateForSupabase(new Date()),
    })
    .eq("id", subtaskId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao completar subtarefa:", error);
    throw new Error("Falha ao completar subtarefa");
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    projectId: data.project_id,
    parentTaskId: data.parent_task_id,
    subtasks: [],
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    priority: data.priority,
    reminders: data.reminders || [],
    tags: data.tags || [],
    attachments: data.attachments || [],
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
