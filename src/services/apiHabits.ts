import { supabase } from "../lib/supabaseClient";
import type { Habit, HabitEntry } from "../types";

// Função para formatar data sem problemas de fuso horário
function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar hábitos:", error);
    throw new Error("Falha ao carregar hábitos");
  }

  return (
    data?.map((habit) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      target: habit.target,
      unit: habit.unit,
      color: habit.color,
      icon: habit.icon,
      reminders: habit.reminders || [],
      workspaceId: habit.workspace_id,
      createdAt: new Date(habit.created_at),
      updatedAt: new Date(habit.updated_at),
    })) || []
  );
}

export async function createHabit(
  habit: Omit<Habit, "id" | "createdAt" | "updatedAt">
): Promise<Habit> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("habits")
    .insert({
      name: habit.name,
      description: habit.description,
      target: habit.target,
      unit: habit.unit,
      color: habit.color,
      icon: habit.icon,
      reminders: habit.reminders,
      workspace_id: habit.workspaceId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar hábito:", error);
    throw new Error("Falha ao criar hábito");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    target: data.target,
    unit: data.unit,
    color: data.color,
    icon: data.icon,
    reminders: data.reminders || [],
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateHabit(habit: Habit): Promise<Habit> {
  const { data, error } = await supabase
    .from("habits")
    .update({
      name: habit.name,
      description: habit.description,
      target: habit.target,
      unit: habit.unit,
      color: habit.color,
      icon: habit.icon,
      reminders: habit.reminders,
      workspace_id: habit.workspaceId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", habit.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar hábito:", error);
    throw new Error("Falha ao atualizar hábito");
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    target: data.target,
    unit: data.unit,
    color: data.color,
    icon: data.icon,
    reminders: data.reminders || [],
    workspaceId: data.workspace_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { error } = await supabase.from("habits").delete().eq("id", habitId);

  if (error) {
    console.error("Erro ao excluir hábito:", error);
    throw new Error("Falha ao excluir hábito");
  }
}

export async function getHabitEntries(): Promise<HabitEntry[]> {
  const { data, error } = await supabase
    .from("habit_entries")
    .select("*")
    .order("completion_date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar entradas de hábitos:", error);
    throw new Error("Falha ao carregar entradas de hábitos");
  }

  return (
    data?.map((entry) => ({
      id: entry.id,
      habitId: entry.habitId,
      date: new Date(entry.completion_date),
      value: entry.value || 1,
      notes: entry.notes,
    })) || []
  );
}

export async function createHabitEntry(
  entry: Omit<HabitEntry, "id">
): Promise<HabitEntry> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("habit_entries")
    .insert({
      habit_id: entry.habitId,
      user_id: user.id,
      completion_date: formatDateForDB(entry.date),
      value: entry.value,
      notes: entry.notes,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar entrada de hábito:", error);
    throw new Error("Falha ao criar entrada de hábito");
  }

  return {
    id: data.id,
    habitId: data.habitId,
    date: new Date(data.completion_date),
    value: data.value || 1,
    notes: data.notes,
  };
}

export async function updateHabitEntry(entry: HabitEntry): Promise<HabitEntry> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("habit_entries")
    .update({
      habit_id: entry.habitId,
      user_id: user.id,
      completion_date: formatDateForDB(entry.date),
      value: entry.value,
      notes: entry.notes,
    })
    .eq("id", entry.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar entrada de hábito:", error);
    throw new Error("Falha ao atualizar entrada de hábito");
  }

  return {
    id: data.id,
    habitId: data.habitId,
    date: new Date(data.completion_date),
    value: data.value || 1,
    notes: data.notes,
  };
}
