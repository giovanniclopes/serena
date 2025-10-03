import { Filter, Grid, List, Search } from "lucide-react";
import { useApp } from "../context/AppContext";

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  searchPlaceholder?: string;
  showCompletedLabel?: string;
  onFilterClick?: () => void;
}

export default function FilterControls({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showCompleted,
  onShowCompletedChange,
  searchPlaceholder = "Buscar...",
  showCompletedLabel = "Mostrar concluídos",
  onFilterClick,
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

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => onShowCompletedChange(e.target.checked)}
            className="w-1.5 h-1.5 sm:w-4 sm:h-4 rounded"
            style={{ accentColor: state.currentTheme.colors.primary }}
          />
          <span
            className="text-sm"
            style={{ color: state.currentTheme.colors.text }}
          >
            {showCompletedLabel}
          </span>
        </label>
      </div>
    </>
  );
}
