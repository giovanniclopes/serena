import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Edit2, Pin } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { ChecklistItem, StickyNote } from "../types";
import { getContrastTextColor } from "../utils";
import ResponsiveModal from "./ResponsiveModal";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface StickyNotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: StickyNote | null;
  onEdit: () => void;
}

export default function StickyNotePreviewModal({
  isOpen,
  onClose,
  note,
  onEdit,
}: StickyNotePreviewModalProps) {
  const { state } = useApp();

  if (!note) return null;

  const textColor = getContrastTextColor(note.color);
  const hasChecklist = note.checklist && note.checklist.length > 0;
  const imageAttachments =
    note.attachments?.filter((att) => att.type.startsWith("image/")) || [];
  const otherAttachments =
    note.attachments?.filter((att) => !att.type.startsWith("image/")) || [];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="space-y-4">
        <div
          className="rounded-lg p-6 shadow-lg"
          style={{
            backgroundColor: note.color,
            color: textColor,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 flex-1">
              {note.isPinned && (
                <Pin
                  className="w-5 h-5"
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
                    className="w-5 h-5"
                    style={{ color: textColor, opacity: 0.9 }}
                  />
                </div>
              )}
              {note.title && (
                <h2
                  className="text-2xl font-bold flex-1"
                  style={{ color: textColor }}
                >
                  {note.title}
                </h2>
              )}
            </div>
          </div>

          {note.content && (
            <div
              className="text-base mb-4 whitespace-pre-wrap break-words"
              style={{ color: textColor, opacity: 0.9 }}
            >
              {note.content}
            </div>
          )}

          {hasChecklist && (
            <div className="space-y-2 mt-4">
              {note.checklist!.map((item: ChecklistItem) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={item.isChecked}
                    disabled
                    style={{
                      opacity: item.isChecked ? 0.6 : 1,
                    }}
                  />
                  <span
                    className={`text-sm flex-1 ${
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
            <div className="mt-4 space-y-2">
              {imageAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative rounded overflow-hidden"
                >
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-auto object-cover rounded"
                    style={{ maxHeight: "400px" }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1 rounded-full"
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

        {otherAttachments.length > 0 && (
          <div className="space-y-2">
            <h3
              className="text-sm font-semibold"
              style={{ color: state.currentTheme.colors.text }}
            >
              Anexos
            </h3>
            <div className="space-y-2">
              {otherAttachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border transition-colors hover:bg-opacity-50"
                  style={{
                    borderColor: state.currentTheme.colors.border,
                    backgroundColor: state.currentTheme.colors.surface,
                    color: state.currentTheme.colors.text,
                  }}
                >
                  <span className="text-sm flex-1">{attachment.name}</span>
                  <span
                    className="text-xs"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {(attachment.size / 1024).toFixed(2)} KB
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <div className="text-xs space-y-1">
            <div style={{ color: state.currentTheme.colors.textSecondary }}>
              Criado em:{" "}
              {format(note.createdAt, "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
            {note.updatedAt.getTime() !== note.createdAt.getTime() && (
              <div style={{ color: state.currentTheme.colors.textSecondary }}>
                Modificado em:{" "}
                {format(note.updatedAt, "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button type="button" onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}

