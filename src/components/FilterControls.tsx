import { ArrowUpDown, Filter, Grid, List, Search, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Priority } from "../types";
import { getPriorityColor, getPriorityLabel } from "../utils";

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  selectedPriorities?: Priority[];
  onPrioritiesChange?: (priorities: Priority[]) => void;
  searchPlaceholder?: string;
  showCompletedLabel?: string;
  onFilterClick?: () => void;
  isBulkDeleteMode?: boolean;
  onBulkDeleteToggle?: () => void;
  selectedTasksCount?: number;
  sortBy?: "priority" | "recent" | "dueDate" | "date" | "dateNew" | "dateOld";
  onSortChange?: (
    sort: "priority" | "recent" | "dueDate" | "date" | "dateNew" | "dateOld"
  ) => void;
}

export default function FilterControls({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showCompleted,
  onShowCompletedChange,
  selectedPriorities = [],
  onPrioritiesChange,
  searchPlaceholder = "Buscar...",
  showCompletedLabel = "Mostrar concluídos",
  onFilterClick,
  isBulkDeleteMode = false,
  onBulkDeleteToggle,
  selectedTasksCount = 0,
  sortBy = "priority",
  onSortChange,
}: FilterControlsProps) {
  const { state } = useApp();

  return (
    <>
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: state.currentTheme.colors.textSecondary }}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          />
        </div>

        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "20",
              color: state.currentTheme.colors.primary,
            }}
          >
            <Filter className="w-4 h-4" />
          </button>
        )}

        {onSortChange && (
          <div className="relative">
            <button
              onClick={() => {
                if (sortBy === "dateNew" || sortBy === "dateOld") {
                  onSortChange(sortBy === "dateNew" ? "dateOld" : "dateNew");
                } else {
                  const sortOptions: (
                    | "priority"
                    | "recent"
                    | "dueDate"
                    | "date"
                  )[] = ["priority", "recent", "dueDate", "date"];
                  const currentIndex = sortOptions.indexOf(
                    sortBy as "priority" | "recent" | "dueDate" | "date"
                  );
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  onSortChange(sortOptions[nextIndex]);
                }
              }}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
              title={`Ordenar por: ${
                sortBy === "priority"
                  ? "Prioridade"
                  : sortBy === "recent"
                  ? "Mais recentes"
                  : sortBy === "dueDate"
                  ? "Data de vencimento"
                  : sortBy === "date"
                  ? "Data do evento"
                  : sortBy === "dateNew"
                  ? "Data nova (mais próximas)"
                  : "Data antiga (mais distantes)"
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          className="flex rounded-lg"
          style={{ backgroundColor: state.currentTheme.colors.surface }}
        >
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-l-lg transition-colors ${
              viewMode === "list" ? "bg-opacity-20" : ""
            }`}
            style={{
              backgroundColor:
                viewMode === "list"
                  ? state.currentTheme.colors.primary + "20"
                  : "transparent",
              color:
                viewMode === "list"
                  ? state.currentTheme.colors.primary
                  : state.currentTheme.colors.textSecondary,
            }}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-r-lg transition-colors ${
              viewMode === "grid" ? "bg-opacity-20" : ""
            }`}
            style={{
              backgroundColor:
                viewMode === "grid"
                  ? state.currentTheme.colors.primary + "20"
                  : "transparent",
              color:
                viewMode === "grid"
                  ? state.currentTheme.colors.primary
                  : state.currentTheme.colors.textSecondary,
            }}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onShowCompletedChange(!showCompleted)}
            className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 ${
              showCompleted ? "text-white shadow-md" : "hover:bg-opacity-10"
            }`}
            style={{
              backgroundColor: showCompleted
                ? state.currentTheme.colors.primary
                : "transparent",
              color: showCompleted
                ? "white"
                : state.currentTheme.colors.primary,
              border: `1px solid ${state.currentTheme.colors.primary}`,
            }}
            onMouseEnter={(e) => {
              if (!showCompleted) {
                e.currentTarget.style.backgroundColor =
                  state.currentTheme.colors.primary + "10";
              }
            }}
            onMouseLeave={(e) => {
              if (!showCompleted) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded"
              style={{
                accentColor: showCompleted
                  ? "white"
                  : state.currentTheme.colors.primary,
              }}
            />
            <span className="hidden sm:inline">{showCompletedLabel}</span>
            <span className="sm:hidden">Concluídas</span>
          </button>

          {onBulkDeleteToggle && (
            <button
              onClick={onBulkDeleteToggle}
              className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 ${
                isBulkDeleteMode
                  ? "text-white shadow-md"
                  : "hover:bg-opacity-10"
              }`}
              style={{
                backgroundColor: isBulkDeleteMode
                  ? state.currentTheme.colors.error
                  : "transparent",
                color: isBulkDeleteMode
                  ? "white"
                  : state.currentTheme.colors.error,
                border: `1px solid ${state.currentTheme.colors.error}`,
              }}
              onMouseEnter={(e) => {
                if (!isBulkDeleteMode) {
                  e.currentTarget.style.backgroundColor =
                    state.currentTheme.colors.error + "10";
                }
              }}
              onMouseLeave={(e) => {
                if (!isBulkDeleteMode) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {isBulkDeleteMode
                  ? `Excluir (${selectedTasksCount})`
                  : "Excluir em lote"}
              </span>
              <span className="sm:hidden">
                {isBulkDeleteMode ? `(${selectedTasksCount})` : "Excluir"}
              </span>
            </button>
          )}
        </div>
      </div>

      {onPrioritiesChange && (
        <div className="space-y-2">
          <span
            className="text-sm font-medium"
            style={{ color: state.currentTheme.colors.text }}
          >
            Filtrar por prioridade:
          </span>
          <div className="flex flex-wrap gap-2">
            {(["P1", "P2", "P3", "P4"] as Priority[]).map((priority) => {
              const isSelected = selectedPriorities.includes(priority);
              return (
                <button
                  key={priority}
                  onClick={() => {
                    if (isSelected) {
                      onPrioritiesChange(
                        selectedPriorities.filter((p) => p !== priority)
                      );
                    } else {
                      onPrioritiesChange([...selectedPriorities, priority]);
                    }
                  }}
                  className={`px-3 md:px-5 py-1 md:py-2 rounded-full text-xs font-medium transition-all sm:py-0 ${
                    isSelected ? "text-white" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? getPriorityColor(priority)
                      : state.currentTheme.colors.surface,
                    color: isSelected
                      ? "white"
                      : state.currentTheme.colors.text,
                    border: `1px solid ${getPriorityColor(priority)}`,
                  }}
                >
                  {getPriorityLabel(priority)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
