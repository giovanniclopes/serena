import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Archive,
  Bell,
  Edit2,
  GripVertical,
  Pin,
  PinOff,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChecklistItem, StickyNote } from "../types";
import { debounce, getContrastTextColor } from "../utils";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface StickyNoteProps {
  note: StickyNote;
  onPreview: (note: StickyNote) => void;
  onEdit: (note: StickyNote) => void;
  onUpdate?: (note: StickyNote) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (note: StickyNote) => void;
  onToggleArchive: (note: StickyNote) => void;
  onChecklistToggle?: (
    noteId: string,
    itemId: string,
    checked: boolean
  ) => void;
  onShare?: (note: StickyNote) => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
  dragHandleProps?: {
    attributes: any;
    listeners: any;
  };
}

export default function StickyNoteComponent({
  note,
  onPreview,
  onEdit,
  onUpdate,
  onDelete,
  onTogglePin,
  onToggleArchive,
  onChecklistToggle,
  onShare,
  isDragging = false,
  style,
  dragHandleProps,
}: StickyNoteProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title || "");
  const [editContent, setEditContent] = useState(note.content);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditTitle(note.title || "");
      setEditContent(note.content);
    }
  }, [note.title, note.content, isEditing]);

  useEffect(() => {
    if (isEditing) {
      const timeout = setTimeout(() => {
        if (
          document.activeElement === titleInputRef.current ||
          document.activeElement === contentTextareaRef.current
        ) {
          return;
        }
        if (note.title) {
          titleInputRef.current?.focus();
        } else {
          contentTextareaRef.current?.focus();
        }
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [isEditing, note.title]);

  const onUpdateRef = useRef(onUpdate);
  
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const saveFunction = (updatedNote: StickyNote) => {
    if (onUpdateRef.current) {
      onUpdateRef.current(updatedNote);
    }
  };

  const debouncedSave = useRef(
    debounce(saveFunction as (...args: unknown[]) => unknown, 500)
  ).current as (updatedNote: StickyNote) => void;

  const handleSave = () => {
    const updatedNote: StickyNote = {
      ...note,
      title: editTitle.trim() || undefined,
      content: editContent.trim(),
    };
    if (onUpdate) {
      onUpdate(updatedNote);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(note.title || "");
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleTitleChange = (value: string) => {
    setEditTitle(value);
    const updatedNote: StickyNote = {
      ...note,
      title: value.trim() || undefined,
      content: editContent,
    };
    debouncedSave(updatedNote);
  };

  const handleContentChange = (value: string) => {
    setEditContent(value);
    const updatedNote: StickyNote = {
      ...note,
      title: editTitle.trim() || undefined,
      content: value.trim(),
    };
    debouncedSave(updatedNote);
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: "title" | "content") => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && type === "title" && !e.shiftKey) {
      e.preventDefault();
      contentTextareaRef.current?.focus();
    } else if (
      e.key === "Enter" &&
      type === "content" &&
      (e.ctrlKey || e.metaKey)
    ) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleChecklistToggle = (itemId: string, checked: boolean) => {
    if (onChecklistToggle) {
      onChecklistToggle(note.id, itemId, checked);
    }
  };

  const hasChecklist = note.checklist && note.checklist.length > 0;
  const hasContent = note.content.trim().length > 0 || note.title;
  const imageAttachments =
    note.attachments?.filter((att) => att.type.startsWith("image/")) || [];
  const textColor = getContrastTextColor(note.color);

  const finalStyle: React.CSSProperties = {
    width: `${note.width}px`,
    minHeight: `${note.height}px`,
    backgroundColor: note.color,
    boxShadow: isDragging
      ? "0 10px 25px rgba(0, 0, 0, 0.3)"
      : isHovered && !isEditing
      ? "0 4px 12px rgba(0, 0, 0, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",
    padding: "12px",
    cursor: note.isPinned ? "default" : "move",
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging
      ? "none"
      : "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
    transform: isHovered && !isEditing ? "translateY(-2px)" : "translateY(0)",
    zIndex:
      isHovered && !isEditing
        ? 2000
        : note.isPinned
        ? 1000
        : isDragging
        ? 999
        : 1,
    position: "relative",
    ...style,
  };

  if (!style?.position && !style?.left && !style?.top) {
    finalStyle.position = "absolute";
    finalStyle.left = `${note.positionX}px`;
    finalStyle.top = `${note.positionY}px`;
  }

  return (
    <div
      style={finalStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest("button") === null &&
          target.closest("input") === null &&
          target.closest("textarea") === null &&
          !isEditing
        ) {
          onPreview(note);
        }
      }}
      onDoubleClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest("button") === null &&
          target.closest("input") === null &&
          target.closest("textarea") === null
        ) {
          e.stopPropagation();
          setIsEditing(true);
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1 flex-1">
          {dragHandleProps && isHovered && !isEditing && (
            <button
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/5 transition-all duration-200 ease-in-out flex-shrink-0"
              style={{
                color: textColor,
                opacity: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Arrastar para reordenar"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          {note.isPinned && (
            <Pin
              className="w-4 h-4"
              style={{ color: textColor, opacity: 0.9 }}
            />
          )}
          {note.reminderDate && (
            <div
              title={`Lembrete: ${format(
                new Date(note.reminderDate),
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}`}
            >
              <Bell
                className="w-4 h-4"
                style={{ color: textColor, opacity: 0.9 }}
              />
            </div>
          )}
          {isEditing ? (
            <Input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "title")}
              onBlur={handleSave}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              placeholder="Título"
              className="flex-1 border-0 shadow-none focus-visible:ring-1 p-0 text-sm font-semibold h-auto"
              style={{
                backgroundColor: "transparent",
                color: textColor,
              }}
            />
          ) : (
            note.title && (
              <h3
                className="font-semibold text-sm flex-1"
                style={{ color: textColor }}
              >
                {note.title}
              </h3>
            )
          )}
        </div>
        {isEditing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            className="p-1 rounded hover:bg-black/10 transition-all duration-200 ease-in-out hover:scale-110"
            aria-label="Cancelar edição"
            style={{ color: textColor }}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          isHovered && (
            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 rounded hover:bg-black/10 transition-all duration-200 ease-in-out hover:scale-110"
                aria-label="Editar"
                style={{ color: textColor }}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(note);
                }}
                className="p-1 rounded hover:bg-black/10 transition-all duration-200 ease-in-out hover:scale-110"
                aria-label={note.isPinned ? "Desfixar" : "Fixar"}
                style={{ color: textColor }}
              >
                {note.isPinned ? (
                  <Pin className="w-4 h-4" />
                ) : (
                  <PinOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchive(note);
                }}
                className="p-1 rounded hover:bg-black/10 transition-all duration-200 ease-in-out hover:scale-110"
                aria-label="Arquivar"
                style={{ color: textColor }}
              >
                <Archive className="w-4 h-4" />
              </button>
              {onShare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(note);
                  }}
                  className="p-1 rounded hover:bg-black/10 transition-all duration-200 ease-in-out hover:scale-110"
                  aria-label="Compartilhar"
                  style={{ color: textColor }}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                className="p-1 rounded hover:bg-black/10 transition-all duration-200 ease-in-out hover:scale-110"
                aria-label="Excluir"
                style={{ color: textColor }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        )}
      </div>

      {isEditing ? (
        <Textarea
          ref={contentTextareaRef}
          value={editContent}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "content")}
          onBlur={handleSave}
          onFocus={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          placeholder="Criar uma nota..."
          className="text-sm border-0 shadow-none focus-visible:ring-1 p-0 resize-none min-h-[60px] mb-2 whitespace-pre-wrap break-words"
          style={{
            backgroundColor: "transparent",
            color: textColor,
            opacity: 0.9,
          }}
          rows={3}
        />
      ) : (
        hasContent && (
          <div
            className="text-sm mb-2 whitespace-pre-wrap break-words"
            style={{ color: textColor, opacity: 0.9 }}
          >
            {note.content}
          </div>
        )
      )}

      {hasChecklist && (
        <div className="space-y-1 mt-2">
          {note.checklist!.map((item: ChecklistItem) => (
            <div
              key={item.id}
              className="flex items-center gap-2 transition-all duration-200 ease-in-out"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={item.isChecked}
                onCheckedChange={(checked) =>
                  handleChecklistToggle(item.id, checked === true)
                }
              />
              <span
                className={`text-sm flex-1 transition-all duration-200 ease-in-out ${
                  item.isChecked ? "line-through opacity-60" : ""
                }`}
                style={{
                  color: textColor,
                  opacity: item.isChecked ? 0.6 : 0.9,
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {imageAttachments.length > 0 && (
        <div className="mt-2 space-y-2">
          {imageAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative rounded overflow-hidden"
              style={{ maxHeight: "200px" }}
            >
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full h-auto object-cover"
                style={{ maxHeight: "200px" }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded-full transition-all duration-200 ease-in-out hover:scale-105"
              style={{
                backgroundColor:
                  textColor === "#ffffff"
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.1)",
                color: textColor,
                opacity: 0.9,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
