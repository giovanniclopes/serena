import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { Plus, Target } from "lucide-react";
import { useState } from "react";
import HabitModal from "../components/HabitModal";
import { useApp } from "../context/AppContext";
import {
  useCreateHabit,
  useCreateHabitEntry,
  useHabitEntries,
  useHabits,
  useUpdateHabit,
  useUpdateHabitEntry,
} from "../features/habits/useHabits";
import type { Habit } from "../types";
import { getHabitProgress, getHabitStreak } from "../utils";

export default function Habits() {
  const { state } = useApp();
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(
    undefined
  );

  const { habits, isLoading: habitsLoading, error: habitsError } = useHabits();
  const {
    entries,
    isLoading: entriesLoading,
    error: entriesError,
  } = useHabitEntries();
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const createHabitEntryMutation = useCreateHabitEntry();
  const updateHabitEntryMutation = useUpdateHabitEntry();

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleHabitEntry = (habitId: string, date: Date, value: number) => {
    const existingEntry = entries.find(
      (entry) => entry.habitId === habitId && isSameDay(entry.date, date)
    );

    if (existingEntry) {
      updateHabitEntryMutation.mutate({ ...existingEntry, value });
    } else {
      createHabitEntryMutation.mutate({
        habitId,
        date,
        value,
      });
    }
  };

  const getHabitEntryForDate = (habitId: string, date: Date) => {
    return entries.find(
      (entry) => entry.habitId === habitId && isSameDay(entry.date, date)
    );
  };

  const handleCreateHabit = () => {
    setEditingHabit(undefined);
    setIsHabitModalOpen(true);
  };

  const handleSaveHabit = (
    habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingHabit) {
      updateHabitMutation.mutate({
        ...editingHabit,
        ...habitData,
        updatedAt: new Date(),
      });
    } else {
      createHabitMutation.mutate({
        ...habitData,
        workspaceId: state.activeWorkspaceId,
      });
    }
    setIsHabitModalOpen(false);
  };

  const renderHabitCard = (habit: Habit) => {
    const streak = getHabitStreak(habit, entries);
    const todayProgress = getHabitProgress(habit, entries, new Date());

    return (
      <div
        key={habit.id}
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: state.currentTheme.colors.surface,
          borderColor: state.currentTheme.colors.border,
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: habit.color + "20" }}
            >
              <Target className="w-4 h-4" style={{ color: habit.color }} />
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {habit.name}
              </h3>
              <p
                className="text-xs"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Meta: {habit.target} {habit.unit}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className="text-lg font-bold"
              style={{ color: state.currentTheme.colors.primary }}
            >
              {streak}
            </div>
            <div
              className="text-xs"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              dias
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs font-medium"
              style={{ color: state.currentTheme.colors.text }}
            >
              Hoje
            </span>
            <span
              className="text-xs"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              {Math.round(todayProgress * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: habit.color,
                width: `${todayProgress * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            getHabitEntryForDate(habit.id, day);
            const progress = getHabitProgress(habit, entries, day);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleHabitEntry(habit.id, day, habit.target)}
                className={`aspect-square rounded-md text-xs font-medium transition-colors ${
                  isToday ? "ring-1" : ""
                }`}
                style={{
                  backgroundColor:
                    progress > 0
                      ? habit.color +
                        Math.min(progress * 100, 100)
                          .toString(16)
                          .padStart(2, "0")
                      : state.currentTheme.colors.surface,
                  color:
                    progress > 0.5
                      ? "white"
                      : state.currentTheme.colors.textSecondary,
                  ...(isToday && {
                    borderColor: state.currentTheme.colors.primary,
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }),
                }}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (habitsLoading || entriesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="text-center"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Carregando hábitos...
        </div>
      </div>
    );
  }

  if (habitsError || entriesError) {
    return (
      <div className="text-center py-8">
        <div
          className="text-red-500 mb-2"
          style={{ color: state.currentTheme.colors.error }}
        >
          Erro ao carregar hábitos
        </div>
        <div
          className="text-sm"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Tente recarregar a página
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: state.currentTheme.colors.text }}
        >
          Hábitos
        </h1>
        <button
          onClick={handleCreateHabit}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
          style={{
            backgroundColor: state.currentTheme.colors.primary,
            color: "white",
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Novo Hábito</span>
        </button>
      </div>

      {habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map(renderHabitCard)}
        </div>
      ) : (
        <div
          className="text-center py-8 rounded-lg"
          style={{ backgroundColor: state.currentTheme.colors.surface }}
        >
          <div
            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "20",
            }}
          >
            <Target
              className="w-6 h-6"
              style={{ color: state.currentTheme.colors.primary }}
            />
          </div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: state.currentTheme.colors.text }}
          >
            Nenhum hábito criado
          </h3>
          <p
            className="text-sm mb-3"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Crie hábitos para construir uma rotina mais saudável e produtiva
          </p>
          <button
            onClick={handleCreateHabit}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            Criar Primeiro Hábito
          </button>
        </div>
      )}

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        habit={editingHabit}
        onSave={handleSaveHabit}
      />
    </div>
  );
}
