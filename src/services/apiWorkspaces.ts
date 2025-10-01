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

  return data || [];
}

export async function createWorkspace(
  workspace: Omit<Workspace, "id" | "created_at" | "updated_at">
): Promise<Workspace> {
  const { data, error } = await supabase
    .from("workspaces")
    .insert([workspace])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar workspace:", error);
    throw new Error("Não foi possível criar o workspace.");
  }

  return data;
}

export async function updateWorkspace(
  id: string,
  updates: Partial<Workspace>
): Promise<Workspace> {
  const { data, error } = await supabase
    .from("workspaces")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar workspace:", error);
    throw new Error("Não foi possível atualizar o workspace.");
  }

  return data;
}

export async function deleteWorkspace(id: string): Promise<void> {
  const { error } = await supabase.from("workspaces").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar workspace:", error);
    throw new Error("Não foi possível deletar o workspace.");
  }
}
