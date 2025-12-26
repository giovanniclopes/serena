import { supabase } from "../lib/supabaseClient";
import type { Task } from "../types";
import { sanitizeTaskIdForAPI } from "../utils/taskUtils";

const formatDateForSupabase = (date?: Date): string | null => {
  if (!date) return null;
  return date.toISOString();
};

export async function getSubtasks(taskId: string): Promise<Task[]> {
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
    order: subtask.order || 0,
    timeEntries: [],
    totalTimeSpent: 0,
    isTimerRunning: false,
    currentSessionStart: undefined,
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
      order: subtask.order || 0,
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
    order: data.order || 0,
    timeEntries: [],
    totalTimeSpent: 0,
    isTimerRunning: false,
    currentSessionStart: undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateSubtask(subtask: Task): Promise<Task> {
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
      order: subtask.order || 0,
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
    order: data.order || 0,
    timeEntries: [],
    totalTimeSpent: 0,
    isTimerRunning: false,
    currentSessionStart: undefined,
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
    order: data.order || 0,
    timeEntries: [],
    totalTimeSpent: 0,
    isTimerRunning: false,
    currentSessionStart: undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function uncompleteSubtask(subtaskId: string): Promise<Task> {
  const { data, error } = await supabase
    .from("subtasks")
    .update({
      is_completed: false,
      completed_at: null,
      updated_at: formatDateForSupabase(new Date()),
    })
    .eq("id", subtaskId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao desmarcar subtarefa como concluída:", error);
    throw new Error("Falha ao desmarcar subtarefa como concluída");
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
    order: data.order || 0,
    timeEntries: [],
    totalTimeSpent: 0,
    isTimerRunning: false,
    currentSessionStart: undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function reorderSubtasks({
  subtasks,
}: {
  taskId: string;
  subtasks: Task[];
}): Promise<void> {
  const updates = subtasks.map((subtask, index) => ({
    id: subtask.id,
    order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("subtasks")
      .update({ order: update.order })
      .eq("id", update.id);

    if (error) {
      console.error("Erro ao reordenar subtarefa:", error);
      throw new Error("Falha ao reordenar subtarefas");
    }
  }
}

export async function completeAllSubtasks(taskId: string): Promise<{
  updatedCount: number;
  subtasks: Task[];
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const originalTaskId = sanitizeTaskIdForAPI(taskId);

  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", originalTaskId)
    .single();

  if (taskError || !taskData) {
    throw new Error("Tarefa não encontrada");
  }

  const { data: pendingSubtasks, error: fetchError } = await supabase
    .from("subtasks")
    .select("*")
    .eq("task_id", originalTaskId)
    .eq("is_completed", false);

  if (fetchError) {
    console.error("Erro ao buscar subtarefas pendentes:", fetchError);
    throw new Error("Falha ao buscar subtarefas pendentes");
  }

  if (!pendingSubtasks || pendingSubtasks.length === 0) {
    return {
      updatedCount: 0,
      subtasks: [],
    };
  }

  const now = formatDateForSupabase(new Date());

  const { data: updatedSubtasks, error: updateError } = await supabase
    .from("subtasks")
    .update({
      is_completed: true,
      completed_at: now,
      updated_at: now,
    })
    .eq("task_id", originalTaskId)
    .eq("is_completed", false)
    .select();

  if (updateError) {
    console.error("Erro ao completar todas as subtarefas:", updateError);
    throw new Error("Falha ao completar todas as subtarefas");
  }

  const formattedSubtasks = (updatedSubtasks || []).map((subtask) => ({
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
    completedAt: subtask.completed_at ? new Date(subtask.completed_at) : undefined,
    workspaceId: subtask.workspace_id,
    order: subtask.order || 0,
    timeEntries: [],
    totalTimeSpent: 0,
    isTimerRunning: false,
    currentSessionStart: undefined,
    createdAt: new Date(subtask.created_at),
    updatedAt: new Date(subtask.updated_at),
  }));

  return {
    updatedCount: formattedSubtasks.length,
    subtasks: formattedSubtasks,
  };
}
