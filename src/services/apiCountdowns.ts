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
      title: countdown.eventName,
      description: countdown.description,
      targetDate: new Date(countdown.eventDate),
      color: countdown.color,
      icon: countdown.icon,
      workspaceId: countdown.workspaceId,
      createdAt: new Date(countdown.createdAt),
      updatedAt: new Date(countdown.updatedAt),
    })) || []
  );
}

export async function createCountdown(
  countdown: Omit<Countdown, "id" | "createdAt" | "updatedAt">
): Promise<Countdown> {
  const { data, error } = await supabase
    .from("countdowns")
    .insert({
      eventName: countdown.title,
      description: countdown.description,
      eventDate: countdown.targetDate.toISOString(),
      color: countdown.color,
      icon: countdown.icon,
      workspaceId: countdown.workspaceId,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar contagem regressiva:", error);
    throw new Error("Falha ao criar contagem regressiva");
  }

  return {
    id: data.id,
    title: data.eventName,
    description: data.description,
    targetDate: new Date(data.eventDate),
    color: data.color,
    icon: data.icon,
    workspaceId: data.workspaceId,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

export async function updateCountdown(
  countdown: Countdown
): Promise<Countdown> {
  const { data, error } = await supabase
    .from("countdowns")
    .update({
      eventName: countdown.title,
      description: countdown.description,
      eventDate: countdown.targetDate.toISOString(),
      color: countdown.color,
      icon: countdown.icon,
      workspaceId: countdown.workspaceId,
      updatedAt: new Date().toISOString(),
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
    title: data.eventName,
    description: data.description,
    targetDate: new Date(data.eventDate),
    color: data.color,
    icon: data.icon,
    workspaceId: data.workspaceId,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
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
