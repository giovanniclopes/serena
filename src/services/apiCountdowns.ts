import { supabase } from "../lib/supabaseClient";
import type { Countdown } from "../types";

function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Data inválida: ${dateString}`);
  }
  return date;
}

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
      targetDate: parseDate(countdown.event_date),
      color: countdown.color,
      icon: countdown.icon,
      workspaceId: countdown.workspace_id,
      createdAt: parseDate(countdown.created_at),
      updatedAt: parseDate(countdown.updated_at),
    })) || []
  );
}

export async function createCountdown(
  countdown: Omit<Countdown, "id" | "createdAt" | "updatedAt">
): Promise<Countdown> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("countdowns")
    .insert({
      event_name: countdown.title,
      description: countdown.description,
      event_date: countdown.targetDate.toISOString(),
      color: countdown.color,
      icon: countdown.icon,
      workspace_id: countdown.workspaceId,
      user_id: user.id,
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
    targetDate: parseDate(data.event_date),
    color: data.color,
    icon: data.icon,
    workspaceId: data.workspace_id,
    createdAt: parseDate(data.created_at),
    updatedAt: parseDate(data.updated_at),
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
    targetDate: parseDate(data.event_date),
    color: data.color,
    icon: data.icon,
    workspaceId: data.workspace_id,
    createdAt: parseDate(data.created_at),
    updatedAt: parseDate(data.updated_at),
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
