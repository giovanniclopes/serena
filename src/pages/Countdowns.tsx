import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";
import CountdownModal from "../components/CountdownModal";
import FilterControls from "../components/FilterControls";
import FloatingActionButton from "../components/FloatingActionButton";
import StandardCard from "../components/StandardCard";
import { useApp } from "../context/AppContext";
import {
  useCountdowns,
  useCreateCountdown,
  useUpdateCountdown,
} from "../features/countdowns/useCountdowns";
import type { Countdown } from "../types";
import { filterCountdowns, searchCountdowns } from "../utils";

export default function Countdowns() {
  const { state } = useApp();
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<
    Countdown | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { countdowns, isLoading, error } = useCountdowns();
  const createCountdownMutation = useCreateCountdown();
  const updateCountdownMutation = useUpdateCountdown();

  const workspaceCountdowns = countdowns.filter(
    (countdown) => countdown.workspaceId === state.activeWorkspaceId
  );

  const filteredCountdowns = filterCountdowns(
    searchCountdowns(workspaceCountdowns, searchQuery),
    showCompleted
  );

  const getTimeRemaining = (targetDate: Date) => {
    const now = new Date();
    const days = differenceInDays(targetDate, now);
    const hours = differenceInHours(targetDate, now) % 24;
    const minutes = differenceInMinutes(targetDate, now) % 60;

    if (days > 0) {
      return `${days} dia${days !== 1 ? "s" : ""}`;
    } else if (hours > 0) {
      return `${hours} hora${hours !== 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      return `${minutes} minuto${minutes !== 1 ? "s" : ""}`;
    } else {
      return "Chegou!";
    }
  };

  const getTimeRemainingDetailed = (targetDate: Date) => {
    const now = new Date();
    const days = differenceInDays(targetDate, now);
    const hours = differenceInHours(targetDate, now) % 24;
    const minutes = differenceInMinutes(targetDate, now) % 60;

    return { days, hours, minutes };
  };

  const isOverdue = (targetDate: Date) => {
    return targetDate < new Date();
  };

  const handleCreateCountdown = () => {
    setEditingCountdown(undefined);
    setIsCountdownModalOpen(true);
  };

  const handleSaveCountdown = (
    countdownData: Omit<Countdown, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingCountdown) {
      updateCountdownMutation.mutate({
        ...editingCountdown,
        ...countdownData,
        updatedAt: new Date(),
      });
    } else {
      createCountdownMutation.mutate(countdownData);
    }
    setIsCountdownModalOpen(false);
  };

  const renderCountdownCard = (countdown: Countdown) => {
    const timeRemaining = getTimeRemaining(countdown.targetDate);
    const timeDetailed = getTimeRemainingDetailed(countdown.targetDate);
    const overdue = isOverdue(countdown.targetDate);

    return (
      <StandardCard key={countdown.id} color={countdown.color}>
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: countdown.color }}
        />

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: countdown.color + "20" }}
            >
              <Clock className="w-4 h-4" style={{ color: countdown.color }} />
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: state.currentTheme.colors.text }}
              >
                {countdown.title}
              </h3>
              {countdown.description && (
                <p
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {countdown.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div
            className="text-xl font-bold mb-2"
            style={{
              color: overdue
                ? state.currentTheme.colors.error
                : state.currentTheme.colors.primary,
            }}
          >
            {overdue ? "Passou!" : timeRemaining}
          </div>

          {!overdue && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div
                  className="text-lg font-bold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {timeDetailed.days}
                </div>
                <div
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  dias
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-lg font-bold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {timeDetailed.hours}
                </div>
                <div
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  horas
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-lg font-bold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {timeDetailed.minutes}
                </div>
                <div
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  min
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Calendar
            className="w-3 h-3"
            style={{ color: state.currentTheme.colors.textSecondary }}
          />
          <span
            className="text-xs"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            {format(countdown.targetDate, "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </span>
        </div>
      </StandardCard>
    );
  };

  const upcomingCountdowns = filteredCountdowns.filter(
    (c) => !isOverdue(c.targetDate)
  );
  const pastCountdowns = filteredCountdowns.filter((c) =>
    isOverdue(c.targetDate)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="text-center"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Carregando contagens regressivas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div
          className="text-red-500 mb-2"
          style={{ color: state.currentTheme.colors.error }}
        >
          Erro ao carregar contagens regressivas
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
          Contagem Regressiva
        </h1>
      </div>

      <FilterControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        searchPlaceholder="Buscar countdowns..."
        showCompletedLabel="Mostrar concluídos"
      />

      {filteredCountdowns.length > 0 ? (
        <div className="space-y-4">
          {upcomingCountdowns.length > 0 && (
            <div>
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: state.currentTheme.colors.text }}
              >
                🔮 Próximos Eventos
              </h2>
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }`}
              >
                {upcomingCountdowns.map(renderCountdownCard)}
              </div>
            </div>
          )}

          {pastCountdowns.length > 0 && (
            <div>
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: state.currentTheme.colors.text }}
              >
                📅 Eventos Passados
              </h2>
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }`}
              >
                {pastCountdowns.map(renderCountdownCard)}
              </div>
            </div>
          )}
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
            <Clock
              className="w-6 h-6"
              style={{ color: state.currentTheme.colors.primary }}
            />
          </div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: state.currentTheme.colors.text }}
          >
            Nenhuma contagem regressiva
          </h3>
          <p
            className="text-sm mb-3"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Crie contagens regressivas para eventos importantes e acompanhe o
            tempo restante
          </p>
          <button
            onClick={handleCreateCountdown}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            Criar Primeira Contagem
          </button>
        </div>
      )}

      <CountdownModal
        isOpen={isCountdownModalOpen}
        onClose={() => setIsCountdownModalOpen(false)}
        countdown={editingCountdown}
        onSave={handleSaveCountdown}
      />

      <FloatingActionButton
        onClick={() => {
          setEditingCountdown(undefined);
          setIsCountdownModalOpen(true);
        }}
      />
    </div>
  );
}
