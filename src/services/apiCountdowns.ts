import { supabase } from "../lib/supabaseClient";
import type { Countdown } from "../types";

export async function getCountdowns(): Promise<Countdown[]> {
  const { data, error } = await supabase
    .from("countdowns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar contagens regressivas:", error);
    throw new Error("Falha ao carregar contagens regressivas");
  }

  return (
    data?.map((countdown) => ({
      id: countdown.id,
      title: countdown.event_name,
      description: countdown.description,
      targetDate: new Date(countdown.event_date),
      color: countdown.color,
      icon: countdown.icon,
      workspaceId: countdown.workspace_id,
      createdAt: new Date(countdown.created_at),
      updatedAt: new Date(countdown.updated_at),
    })) || []
  );
}

export async function createCountdown(
  countdown: Omit<Countdown, "id" | "createdAt" | "updatedAt">
): Promise<Countdown> {
  const { data, error } = await supabase
    .from("countdowns")
    .insert({
      event_name: countdown.title,
      description: countdown.description,
      event_date: countdown.targetDate.toISOString(),
      color: countdown.color,
      icon: countdown.icon,
      workspace_id: countdown.workspaceId,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar contagem regressiva:", error);
    throw new Error("Falha ao criar contagem regressiva");
  }

  return {
    id: data.id,
    title: data.event_name,
    description: data.description,
    targetDate: new Date(data.event_date),
    color: data.color,
    icon: data.icon,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateCountdown(
  countdown: Countdown
): Promise<Countdown> {
  const { data, error } = await supabase
    .from("countdowns")
    .update({
      event_name: countdown.title,
      description: countdown.description,
      event_date: countdown.targetDate.toISOString(),
      color: countdown.color,
      icon: countdown.icon,
      workspace_id: countdown.workspaceId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", countdown.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar contagem regressiva:", error);
    throw new Error("Falha ao atualizar contagem regressiva");
  }

  return {
    id: data.id,
    title: data.event_name,
    description: data.description,
    targetDate: new Date(data.event_date),
    color: data.color,
    icon: data.icon,
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteCountdown(countdownId: string): Promise<void> {
  const { error } = await supabase
    .from("countdowns")
    .delete()
    .eq("id", countdownId);

  if (error) {
    console.error("Erro ao excluir contagem regressiva:", error);
    throw new Error("Falha ao excluir contagem regressiva");
  }
}

