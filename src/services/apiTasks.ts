import { supabase } from "../lib/supabaseClient";
import type { Task } from "../types";

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      subtasks:subtasks!task_id(*)
    `
    )
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
          tags: subtask.tags || [],
          isCompleted: subtask.is_completed,
          completedAt: subtask.completed_at
            ? new Date(subtask.completed_at)
            : undefined,
          workspaceId: subtask.workspace_id,
          createdAt: new Date(subtask.created_at),
          updatedAt: new Date(subtask.updated_at),
        })) || [],
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      priority: task.priority,
      reminders: task.reminders || [],
      tags: task.tags || [],
      isCompleted: task.is_completed,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      workspaceId: task.workspace_id,
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
      parent_task_id: task.parentTaskId,
      due_date: task.dueDate?.toISOString(),
      priority: task.priority,
      reminders: task.reminders,
      tags: task.tags,
      is_completed: task.isCompleted,
      completed_at: task.completedAt?.toISOString(),
      workspace_id: task.workspaceId,
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
    tags: data.tags || [],
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
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
      parent_task_id: task.parentTaskId,
      due_date: task.dueDate?.toISOString(),
      priority: task.priority,
      reminders: task.reminders,
      tags: task.tags,
      is_completed: task.isCompleted,
      completed_at: task.completedAt?.toISOString(),
      workspace_id: task.workspaceId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw new Error("Falha ao atualizar tarefa");
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
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
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
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao completar tarefa:", error);
    throw new Error("Falha ao completar tarefa");
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
    isCompleted: data.is_completed,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
