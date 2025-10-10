import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { Edit3, Repeat, Target } from "lucide-react";
import { useState } from "react";
import FilterControls from "../components/FilterControls";
import FloatingActionButton from "../components/FloatingActionButton";
import HabitModal from "../components/HabitModal";
import {
  HabitGridSkeleton,
  HabitListSkeleton,
} from "../components/skeletons/HabitSkeleton";
import StandardCard from "../components/StandardCard";
import { useApp } from "../context/AppContext";
import {
  useCreateHabit,
  useCreateHabitEntry,
  useHabitEntries,
  useHabits,
  useUpdateHabit,
  useUpdateHabitEntry,
} from "../features/habits/useHabits";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { useSkeletonLoading } from "../hooks/useSkeletonLoading";
import type { Habit } from "../types";
import {
  filterHabits,
  getHabitProgress,
  getHabitStreak,
  searchHabits,
} from "../utils";

const formatRecurrenceText = (habit: Habit): string => {
  const frequencyMap = {
    day: "dia",
    week: "semana",
    month: "mês",
  };

  const frequencyText = frequencyMap[habit.frequency];

  if (habit.recurrenceType === "infinite") {
    return `${habit.target} ${habit.unit} por ${frequencyText} · ♾️ Sempre`;
  }

  if (habit.recurrenceType === "duration") {
    const durationMap = {
      days: "dia(s)",
      weeks: "semana(s)",
      months: "mês(es)",
    };
    const unit = durationMap[habit.recurrenceDurationUnit || "days"];
    return `${habit.target} ${habit.unit} por ${frequencyText} · ⏱️ Por ${habit.recurrenceDuration} ${unit}`;
  }

  if (habit.recurrenceType === "until_date" && habit.recurrenceEndDate) {
    const endDate = format(new Date(habit.recurrenceEndDate), "dd/MM/yyyy");
    return `${habit.target} ${habit.unit} por ${frequencyText} · 📅 Até ${endDate}`;
  }

  return `${habit.target} ${habit.unit} por ${frequencyText}`;
};

export default function Habits() {
  const { state } = useApp();
  const { triggerHaptic, triggerSuccess } = useHapticFeedback();
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { habits, isLoading: habitsLoading, error: habitsError } = useHabits();
  const {
    entries,
    isLoading: entriesLoading,
    error: entriesError,
  } = useHabitEntries();
  const { showSkeleton } = useSkeletonLoading(habitsLoading || entriesLoading);

  const workspaceHabits = habits.filter(
    (habit) => habit.workspaceId === state.activeWorkspaceId
  );

  const filteredHabits = filterHabits(
    searchHabits(workspaceHabits, searchQuery),
    showCompleted
  );
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const createHabitEntryMutation = useCreateHabitEntry();
  const updateHabitEntryMutation = useUpdateHabitEntry();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleHabitEntry = (
    habitId: string,
    date: Date,
    targetValue: number
  ) => {
    triggerHaptic("light");

    const normalizedDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );

    const existingEntry = entries.find((entry) => {
      const entryDate = new Date(
        Date.UTC(
          entry.date.getUTCFullYear(),
          entry.date.getUTCMonth(),
          entry.date.getUTCDate()
        )
      );
      return (
        entry.habitId === habitId &&
        entryDate.getTime() === normalizedDate.getTime()
      );
    });

    if (existingEntry) {
      const newValue = existingEntry.value >= targetValue ? 0 : targetValue;
      updateHabitEntryMutation.mutate({ ...existingEntry, value: newValue });
      if (newValue > 0) {
        triggerSuccess();
      }
    } else {
      createHabitEntryMutation.mutate({
        habitId,
        date,
        value: targetValue,
      });
      triggerSuccess();
    }
  };

  const handleCreateHabit = () => {
    setEditingHabit(undefined);
    setIsHabitModalOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    triggerHaptic("light");
    setEditingHabit(habit);
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
      <StandardCard key={habit.id} color={habit.color}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: habit.color + "20" }}
            >
              <Target className="w-4 h-4" style={{ color: habit.color }} />
            </div>
            <div className="flex-1">
              <h3
                className="text-sm font-semibold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {habit.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Repeat
                  className="w-3 h-3"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                />
                <p
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {formatRecurrenceText(habit)}
                </p>
              </div>
              <p
                className="text-xs mt-0.5"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                {habit.category}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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

            <button
              onClick={() => handleEditHabit(habit)}
              className="p-1.5 rounded-md transition-colors hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: state.currentTheme.colors.surface,
                color: state.currentTheme.colors.textSecondary,
              }}
              aria-label={`Editar hábito ${habit.name}`}
              title="Editar hábito"
            >
              <Edit3 className="w-4 h-4" />
            </button>
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

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const progress = getHabitProgress(habit, entries, day);
              const isToday = isSameDay(day, new Date());
              const isCompleted = progress >= 1;
              const isPartial = progress > 0 && progress < 1;
              const isPast = day < new Date() && !isToday;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleHabitEntry(habit.id, day, habit.target)}
                  className={`relative aspect-square rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    isToday ? "ring-2" : ""
                  } ${isCompleted ? "shadow-md" : ""}`}
                  style={{
                    backgroundColor: isCompleted
                      ? habit.color
                      : isPartial
                      ? habit.color + "60"
                      : isPast
                      ? state.currentTheme.colors.surface
                      : state.currentTheme.colors.background,
                    color:
                      isCompleted || isPartial
                        ? "white"
                        : isPast
                        ? state.currentTheme.colors.textSecondary
                        : state.currentTheme.colors.text,
                    borderColor: isToday
                      ? state.currentTheme.colors.primary
                      : isCompleted
                      ? habit.color
                      : state.currentTheme.colors.border,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    opacity: isPast && !isCompleted && !isPartial ? 0.6 : 1,
                  }}
                  aria-label={`${format(day, "dd/MM")} - ${
                    isCompleted
                      ? "Completo"
                      : isPartial
                      ? `${Math.round(progress * 100)}%`
                      : "Não realizado"
                  }`}
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
      </StandardCard>
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

  if (showSkeleton) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        {viewMode === "grid" ? (
          <HabitGridSkeleton count={4} />
        ) : (
          <HabitListSkeleton count={3} />
        )}
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

      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        searchPlaceholder="Buscar hábitos..."
        showCompletedLabel="Mostrar concluídos"
      />

      {filteredHabits.length > 0 ? (
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }`}
        >
          {filteredHabits.map(renderHabitCard)}
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
