import { supabase } from "../lib/supabaseClient";
import type { Workspace } from "../types";

export async function getWorkspaces(): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar workspaces:", error);
    throw new Error("Não foi possível carregar os workspaces.");
  }

  return (data || []).map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    color: workspace.color,
    icon: workspace.icon,
    isDefault: workspace.is_default,
    createdAt: new Date(workspace.created_at),
    updatedAt: new Date(workspace.updated_at),
  }));
}

export async function createWorkspace(
  workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">
): Promise<Workspace> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("workspaces")
    .insert([
      {
        name: workspace.name,
        description: workspace.description,
        color: workspace.color,
        icon: workspace.icon,
        is_default: workspace.isDefault,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar workspace:", error);
    throw new Error("Não foi possível criar o workspace.");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    icon: data.icon,
    isDefault: data.is_default,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateWorkspace(
  id: string,
  updates: Partial<Workspace>
): Promise<Workspace> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.isDefault !== undefined)
    updateData.is_default = updates.isDefault;

  const { data, error } = await supabase
    .from("workspaces")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar workspace:", error);
    throw new Error("Não foi possível atualizar o workspace.");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    icon: data.icon,
    isDefault: data.is_default,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteWorkspace(id: string): Promise<void> {
  const { error } = await supabase.from("workspaces").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar workspace:", error);
    throw new Error("Não foi possível deletar o workspace.");
  }
}
