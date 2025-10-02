import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { Target } from "lucide-react";
import { useState } from "react";
import FloatingActionButton from "../components/FloatingActionButton";
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

  const handleHabitEntry = (
    habitId: string,
    date: Date,
    targetValue: number
  ) => {
    console.log("=== DEBUG HABIT ENTRY ===");
    console.log("HabitId:", habitId);
    console.log("Date clicked:", date.toISOString());
    console.log("All entries:", entries);
    console.log(
      "Entries for this habit:",
      entries.filter((e) => e.habitId === habitId)
    );

    const existingEntry = entries.find(
      (entry) => entry.habitId === habitId && isSameDay(entry.date, date)
    );

    console.log("Existing entry found:", existingEntry);

    if (existingEntry) {
      // Se já existe uma entrada, alterna entre 0 e o valor da meta
      const newValue = existingEntry.value >= targetValue ? 0 : targetValue;
      console.log("Updating entry with value:", newValue);
      updateHabitEntryMutation.mutate({ ...existingEntry, value: newValue });
    } else {
      console.log("Creating new entry with value:", targetValue);
      createHabitEntryMutation.mutate({
        habitId,
        date,
        value: targetValue,
      });
    }
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

        <div className="space-y-2">
          {/* Labels dos dias da semana */}
          <div className="grid grid-cols-7 gap-1">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((dayLabel, index) => (
              <div
                key={index}
                className="text-center text-xs font-medium py-1"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                {dayLabel}
              </div>
            ))}
          </div>

          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const progress = getHabitProgress(habit, entries, day);
              const isToday = isSameDay(day, new Date());
              const isCompleted = progress >= 1;
              const isPartial = progress > 0 && progress < 1;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleHabitEntry(habit.id, day, habit.target)}
                  className={`relative aspect-square rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 ${
                    isToday ? "ring-2" : ""
                  } ${isCompleted ? "shadow-md" : ""}`}
                  style={{
                    backgroundColor: isCompleted
                      ? habit.color
                      : isPartial
                      ? habit.color + "60"
                      : state.currentTheme.colors.surface,
                    color:
                      isCompleted || isPartial
                        ? "white"
                        : state.currentTheme.colors.textSecondary,
                    borderColor: isToday
                      ? state.currentTheme.colors.primary
                      : isCompleted
                      ? habit.color
                      : state.currentTheme.colors.border,
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  title={`${format(day, "dd/MM")} - ${
                    isCompleted
                      ? "Completo"
                      : isPartial
                      ? `${Math.round(progress * 100)}%`
                      : "Não realizado"
                  }`}
                >
                  {format(day, "d")}
                  {isCompleted && (
                    <div className="absolute top-1 right-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
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
      </div>

      {/* Instruções de uso */}
      {habits.length > 0 && (
        <div
          className="p-3 rounded-lg border text-sm"
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <div
            className="font-medium mb-1"
            style={{ color: state.currentTheme.colors.text }}
          >
            💡 Como usar:
          </div>
          <div
            className="text-xs space-y-1"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            <div>• Clique nos dias para marcar/desmarcar o hábito</div>
            <div>
              • <span className="font-medium">Verde sólido:</span> Hábito
              completo
            </div>
            <div>
              • <span className="font-medium">Verde claro:</span> Hábito parcial
            </div>
            <div>
              • <span className="font-medium">Borda azul:</span> Dia atual
            </div>
          </div>
        </div>
      )}

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

      <FloatingActionButton
        onClick={() => {
          setEditingHabit(undefined);
          setIsHabitModalOpen(true);
        }}
      />
    </div>
  );
}
