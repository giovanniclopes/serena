import { supabase } from "../lib/supabaseClient";
import type { Project } from "../types";

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Erro ao buscar projetos:", error);
    throw new Error("Não foi possível carregar os projetos.");
  }

  return data || [];
}

export async function createProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert([project])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar projeto:", error);
    throw new Error("Não foi possível criar o projeto.");
  }

  return data;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar projeto:", error);
    throw new Error("Não foi possível atualizar o projeto.");
  }

  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar projeto:", error);
    throw new Error("Não foi possível deletar o projeto.");
  }
}
