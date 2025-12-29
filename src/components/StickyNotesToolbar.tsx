import { Archive, ArrowDown, ArrowUp, Search, Tag } from "lucide-react";
import { useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

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
  availableTags?: string[];
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
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
  availableTags = [],
  selectedTags = [],
  onTagsChange,
}: StickyNotesToolbarProps) {
  const { state } = useApp();
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (!onTagsChange) return;
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClearTags = () => {
    if (onTagsChange) {
      onTagsChange([]);
    }
  };

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

      {availableTags.length > 0 && onTagsChange && (
        <Popover open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={selectedTags.length > 0 ? "default" : "outline"}
              size="sm"
            >
              <Tag className="w-4 h-4 mr-2" />
              Tags
              {selectedTags.length > 0 && (
                <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded">
                  {selectedTags.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-3"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              borderColor: state.currentTheme.colors.border,
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h4
                  className="text-sm font-semibold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Filtrar por tags
                </h4>
                {selectedTags.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearTags}
                    className="h-6 px-2 text-xs"
                  >
                    Limpar
                  </Button>
                )}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors hover:bg-black/5"
                      style={{
                        backgroundColor: isSelected
                          ? state.currentTheme.colors.primary + "20"
                          : "transparent",
                        color: isSelected
                          ? state.currentTheme.colors.primary
                          : state.currentTheme.colors.text,
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? "border-current" : ""
                        }`}
                        style={{
                          borderColor: isSelected
                            ? state.currentTheme.colors.primary
                            : state.currentTheme.colors.border,
                        }}
                      >
                        {isSelected && (
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{
                              backgroundColor: state.currentTheme.colors.primary,
                            }}
                          />
                        )}
                      </div>
                      <span className="flex-1 text-left">{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
