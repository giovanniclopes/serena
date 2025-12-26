import { Archive, ArrowDown, ArrowUp, Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type SortBy = "created" | "modified" | "alphabetical" | "manual";
export type SortOrder = "asc" | "desc";

interface StickyNotesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showArchived: boolean;
  onToggleShowArchived: () => void;
  sortBy?: SortBy;
  onSortByChange?: (sortBy: SortBy) => void;
  sortOrder?: SortOrder;
  onSortOrderChange?: (sortOrder: SortOrder) => void;
}

export default function StickyNotesToolbar({
  searchQuery,
  onSearchChange,
  showArchived,
  onToggleShowArchived,
  sortBy = "modified",
  onSortByChange,
  sortOrder = "desc",
  onSortOrderChange,
}: StickyNotesToolbarProps) {
  const { state } = useApp();

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-4 border-b"
      style={{
        backgroundColor: state.currentTheme.colors.surface,
        borderColor: state.currentTheme.colors.border,
      }}
    >
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: state.currentTheme.colors.textSecondary }}
          />
          <Input
            type="text"
            placeholder="Buscar post-its..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {onSortByChange && (
        <>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modified">Data de modificação</SelectItem>
              <SelectItem value="created">Data de criação</SelectItem>
              <SelectItem value="alphabetical">Alfabética</SelectItem>
              <SelectItem value="manual">Ordem manual</SelectItem>
            </SelectContent>
          </Select>
          {onSortOrderChange && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
              }
              aria-label={
                sortOrder === "asc"
                  ? "Ordenar decrescente"
                  : "Ordenar crescente"
              }
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </>
      )}

      <Button
        type="button"
        variant={showArchived ? "default" : "outline"}
        size="sm"
        onClick={onToggleShowArchived}
      >
        <Archive className="w-4 h-4" />
      </Button>
    </div>
  );
}
