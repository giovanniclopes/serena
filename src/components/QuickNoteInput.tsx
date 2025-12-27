import {
  CheckSquare,
  Image,
  Palette,
  PenTool,
  Pin,
  PinOff,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_STICKY_NOTE_COLOR,
  STICKY_NOTE_COLORS,
} from "../constants/stickyNoteColors";
import { useApp } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface QuickNoteInputProps {
  onCreateNote: (note: {
    title?: string;
    content: string;
    color: string;
    isPinned: boolean;
    isChecklist: boolean;
  }) => void;
  onCreateList?: () => void;
  onCreateNoteWithDrawing?: () => void;
  onCreateNoteWithImage?: () => void;
  onCreateNoteWithAI?: () => void;
}

export default function QuickNoteInput({
  onCreateNote,
  onCreateList,
  onCreateNoteWithDrawing,
  onCreateNoteWithImage,
  onCreateNoteWithAI,
}: QuickNoteInputProps) {
  const { state } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(
    DEFAULT_STICKY_NOTE_COLOR
  );
  const [isPinned, setIsPinned] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setContent("");
    setSelectedColor(DEFAULT_STICKY_NOTE_COLOR);
    setIsPinned(false);
    setIsChecklist(false);
    setIsExpanded(false);
    setShowColorPicker(false);
  }, []);

  const handleSave = useCallback(() => {
    if (content.trim() || title.trim()) {
      onCreateNote({
        title: title.trim() || undefined,
        content: content.trim(),
        color: selectedColor,
        isPinned,
        isChecklist,
      });
      resetForm();
    } else {
      resetForm();
    }
  }, [
    content,
    title,
    selectedColor,
    isPinned,
    isChecklist,
    onCreateNote,
    resetForm,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      const timeout = setTimeout(() => {
        if (
          document.activeElement === inputRef.current ||
          document.activeElement === textareaRef.current
        ) {
          return;
        }
        inputRef.current?.focus();
      }, 0);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        clearTimeout(timeout);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, title, content, handleSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isChecklist) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      resetForm();
    }
  };

  return (
    <div
      ref={containerRef}
      className="mb-4 transition-all duration-200"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          !isExpanded &&
          target.closest("input") === null &&
          target.closest("textarea") === null
        ) {
          setIsExpanded(true);
        }
      }}
    >
      <div
        className="rounded-lg shadow-sm border transition-all duration-200"
        style={{
          backgroundColor: state.currentTheme.colors.surface,
          borderColor: isExpanded
            ? state.currentTheme.colors.primary
            : state.currentTheme.colors.border,
          boxShadow: isExpanded
            ? `0 2px 8px ${state.currentTheme.colors.primary}20`
            : "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {isExpanded ? (
          <div className="p-4 space-y-3">
            <Input
              ref={inputRef}
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="border-0 shadow-none focus-visible:ring-0 p-0 text-base font-medium"
              style={{
                backgroundColor: "transparent",
                color: state.currentTheme.colors.text,
              }}
            />
            <Textarea
              ref={textareaRef}
              placeholder="Criar uma nota..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="border-0 shadow-none focus-visible:ring-0 p-0 resize-none min-h-[60px]"
              style={{
                backgroundColor: "transparent",
                color: state.currentTheme.colors.text,
              }}
              rows={isChecklist ? 1 : 3}
            />
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded hover:bg-black/5 transition-colors"
                  style={{
                    color: state.currentTheme.colors.textSecondary,
                  }}
                  aria-label="Escolher cor"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2 rounded hover:bg-black/5 transition-colors ${
                    isPinned ? "opacity-100" : "opacity-60"
                  }`}
                  style={{
                    color: isPinned
                      ? state.currentTheme.colors.primary
                      : state.currentTheme.colors.textSecondary,
                  }}
                  aria-label={isPinned ? "Desfixar" : "Fixar"}
                >
                  {isPinned ? (
                    <Pin className="w-4 h-4" />
                  ) : (
                    <PinOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChecklist(!isChecklist)}
                  className={`p-2 rounded hover:bg-black/5 transition-colors ${
                    isChecklist ? "opacity-100" : "opacity-60"
                  }`}
                  style={{
                    color: isChecklist
                      ? state.currentTheme.colors.primary
                      : state.currentTheme.colors.textSecondary,
                  }}
                  aria-label="Criar checklist"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="text-xs"
              >
                Fechar
              </Button>
            </div>
            {showColorPicker && (
              <div
                className="flex gap-2 p-2 rounded border-t"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                }}
              >
                {STICKY_NOTE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color.value);
                      setShowColorPicker(false);
                    }}
                    className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color.value,
                      borderColor:
                        selectedColor === color.value
                          ? state.currentTheme.colors.primary
                          : "transparent",
                    }}
                    aria-label={color.name}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className="p-4 cursor-text flex flex-col md:flex-row md:items-center md:justify-between"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("button") === null) {
                setIsExpanded(true);
              }
            }}
            style={{
              color: state.currentTheme.colors.textSecondary,
            }}
          >
            <span>Criar uma nota...</span>
            <div
              className="flex items-center gap-2 mt-2 md:mt-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCreateList) {
                    onCreateList();
                  } else {
                    setIsChecklist(true);
                    setIsExpanded(true);
                  }
                }}
                className="p-2 rounded hover:bg-black/5 transition-all duration-200 ease-in-out hover:scale-110"
                style={{
                  color: state.currentTheme.colors.textSecondary,
                }}
                aria-label="Nova Lista"
                title="Nova Lista"
              >
                <CheckSquare className="w-5 h-5 transition-transform duration-200" />
              </button>
              {onCreateNoteWithDrawing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNoteWithDrawing();
                  }}
                  className="p-2 rounded hover:bg-black/5 transition-all duration-200 ease-in-out hover:scale-110"
                  style={{
                    color: state.currentTheme.colors.textSecondary,
                  }}
                  aria-label="Nova Nota com Desenho"
                  title="Nova Nota com Desenho"
                >
                  <PenTool className="w-5 h-5 transition-transform duration-200" />
                </button>
              )}
              {onCreateNoteWithImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNoteWithImage();
                  }}
                  className="p-2 rounded hover:bg-black/5 transition-all duration-200 ease-in-out hover:scale-110"
                  style={{
                    color: state.currentTheme.colors.textSecondary,
                  }}
                  aria-label="Nova Nota com Imagem"
                  title="Nova Nota com Imagem"
                >
                  <Image className="w-5 h-5 transition-transform duration-200" />
                </button>
              )}
              {onCreateNoteWithAI && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNoteWithAI();
                  }}
                  className="p-2 rounded transition-colors relative group ai-sparkle-button"
                  style={{
                    color: state.currentTheme.colors.textSecondary,
                  }}
                  aria-label="Criar nota com IA"
                  title="Criar nota com IA"
                >
                  <Sparkles className="w-5 h-5 ai-sparkle-icon transition-all duration-300" />
                  <style>{`
                    .ai-sparkle-icon {
                      transition: filter 0.4s ease-in-out, transform 0.4s ease-in-out;
                    }
                    .ai-sparkle-button:hover .ai-sparkle-icon {
                      animation: sparkle-glow 2.5s ease-in-out infinite;
                    }
                    @keyframes sparkle-glow {
                      0%, 100% {
                        filter: drop-shadow(0 0 3px ${state.currentTheme.colors.primary}80) drop-shadow(0 0 6px ${state.currentTheme.colors.primary}50);
                        transform: scale(1) rotate(0deg);
                      }
                      25% {
                        filter: drop-shadow(0 0 4px ${state.currentTheme.colors.primary}90) drop-shadow(0 0 8px ${state.currentTheme.colors.primary}60);
                        transform: scale(1.05) rotate(3deg);
                      }
                      50% {
                        filter: drop-shadow(0 0 5px ${state.currentTheme.colors.primary}) drop-shadow(0 0 10px ${state.currentTheme.colors.primary}70);
                        transform: scale(1.08) rotate(-2deg);
                      }
                      75% {
                        filter: drop-shadow(0 0 4px ${state.currentTheme.colors.primary}90) drop-shadow(0 0 8px ${state.currentTheme.colors.primary}60);
                        transform: scale(1.05) rotate(2deg);
                      }
                    }
                  `}</style>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
