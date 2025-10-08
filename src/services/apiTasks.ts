import { supabase } from "../lib/supabaseClient";
import type { Task } from "../types";
import { sanitizeTaskIdForAPI } from "../utils/taskUtils";

const formatDateForSupabase = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString();
};

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      subtasks:subtasks!task_id(*)
    `
    )
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar tarefas:", error);
    throw new Error("Falha ao carregar tarefas");
  }

  return (
    data?.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.project_id,
      parentTaskId: task.parent_task_id,
      subtasks:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        task.subtasks?.map((subtask: any) => ({
          id: subtask.id,
          title: subtask.title,
          description: subtask.description,
          projectId: subtask.project_id,
          parentTaskId: subtask.parent_task_id,
          subtasks: [],
          dueDate: subtask.due_date ? new Date(subtask.due_date) : undefined,
          priority: subtask.priority,
          reminders: subtask.reminders || [],
          recurrence: subtask.recurrence || undefined,
          tags: subtask.tags || [],
          attachments: subtask.attachments || [],
          isCompleted: subtask.is_completed,
          completedAt: subtask.completed_at
            ? new Date(subtask.completed_at)
            : undefined,
          workspaceId: subtask.workspace_id,
          order: subtask.order || 0,
          createdAt: new Date(subtask.created_at),
          updatedAt: new Date(subtask.updated_at),
        })) || [],
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      priority: task.priority,
      reminders: task.reminders || [],
      recurrence: task.recurrence || undefined,
      tags: task.tags || [],
      attachments: task.attachments || [],
      isCompleted: task.is_completed,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      workspaceId: task.workspace_id,
      order: task.order || 0,
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
    })) || []
  );
}

export async function createTask(
  task: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<Task> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: task.title,
      description: task.description,
      project_id: task.projectId,
      parent_task_id: task.parentTaskId
        ? sanitizeTaskIdForAPI(task.parentTaskId)
        : null,
      due_date: formatDateForSupabase(task.dueDate),
      priority: task.priority,
      reminders: task.reminders,
      recurrence: task.recurrence,
      tags: task.tags,
      attachments: task.attachments,
      is_completed: task.isCompleted,
      completed_at: formatDateForSupabase(task.completedAt),
      workspace_id: task.workspaceId,
      order: task.order || 0,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar tarefa:", error);
    throw new Error("Falha ao criar tarefa");
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
    recurrence: data.recurrence || undefined,
    tags: data.tags || [],
    attachments: data.attachments || [],
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    order: data.order || 0,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateTask(task: Task): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: task.title,
      description: task.description,
      project_id: task.projectId,
      parent_task_id: task.parentTaskId
        ? sanitizeTaskIdForAPI(task.parentTaskId)
        : null,
      due_date: formatDateForSupabase(task.dueDate),
      priority: task.priority,
      reminders: task.reminders,
      recurrence: task.recurrence,
      tags: task.tags,
      attachments: task.attachments,
      is_completed: task.isCompleted,
      completed_at: formatDateForSupabase(task.completedAt),
      workspace_id: task.workspaceId,
      order: task.order || 0,
      updated_at: formatDateForSupabase(new Date()),
    })
    .eq("id", task.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw error;
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
    recurrence: data.recurrence || undefined,
    tags: data.tags || [],
    attachments: data.attachments || [],
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    order: data.order || 0,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("Erro ao excluir tarefa:", error);
    throw new Error("Falha ao excluir tarefa");
  }
}

export async function completeTask(taskId: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      is_completed: true,
      completed_at: formatDateForSupabase(new Date()),
      updated_at: formatDateForSupabase(new Date()),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao completar tarefa:", error);
    throw error;
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
    recurrence: data.recurrence || undefined,
    tags: data.tags || [],
    attachments: data.attachments || [],
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    order: data.order || 0,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function uncompleteTask(taskId: string): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      is_completed: false,
      completed_at: null,
      updated_at: formatDateForSupabase(new Date()),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao desmarcar tarefa como concluída:", error);
    throw error;
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
    recurrence: data.recurrence || undefined,
    tags: data.tags || [],
    attachments: data.attachments || [],
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    order: data.order || 0,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function completeAllTasks(taskIds: string[]): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({
      is_completed: true,
      completed_at: formatDateForSupabase(new Date()),
      updated_at: formatDateForSupabase(new Date()),
    })
    .in("id", taskIds);

  if (error) {
    console.error("Erro ao completar todas as tarefas:", error);
    throw new Error("Falha ao completar todas as tarefas");
  }
}
