import { supabase } from "../lib/supabaseClient";
import type { Project } from "../types";

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar projetos:", error);
    throw new Error("Não foi possível carregar os projetos.");
  }

  return (data || []).map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    icon: project.icon,
    workspaceId: project.workspace_id,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
  }));
}

export async function createProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name: project.name,
        description: project.description,
        color: project.color,
        icon: project.icon,
        workspace_id: project.workspaceId,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar projeto:", error);
    throw new Error("Não foi possível criar o projeto.");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    icon: data.icon,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project> {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.workspaceId !== undefined)
    updateData.workspace_id = updates.workspaceId;

  const { data, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar projeto:", error);
    throw new Error("Não foi possível atualizar o projeto.");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    icon: data.icon,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar projeto:", error);
    throw new Error("Não foi possível deletar o projeto.");
  }
}
