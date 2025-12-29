import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DEFAULT_STICKY_NOTE_COLOR,
  STICKY_NOTE_COLORS,
  STICKY_NOTE_SIZES,
} from "../constants/stickyNoteColors";
import { useApp } from "../context/AppContext";
import { useProjects } from "../features/projects/useProjects";
import type { ChecklistItem, Project, StickyNote } from "../types";
import AttachmentManager from "./AttachmentManager";
import ColorPicker from "./ColorPicker";
import ResponsiveModal from "./ResponsiveModal";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface StickyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: StickyNote;
  onSave: (note: Omit<StickyNote, "id" | "createdAt" | "updatedAt">) => void;
  workspaceId: string;
  mode?: "default" | "list";
}

export default function StickyNoteModal({
  isOpen,
  onClose,
  note,
  onSave,
  workspaceId,
  mode = "default",
}: StickyNoteModalProps) {
  const { state } = useApp();
  const { projects } = useProjects();
  const [formData, setFormData] = useState({
    title: note?.title || "",
    content: note?.content || "",
    color: note?.color || DEFAULT_STICKY_NOTE_COLOR,
    width: note?.width || STICKY_NOTE_SIZES.medium.width,
    height: note?.height || STICKY_NOTE_SIZES.medium.height,
    projectId: note?.projectId || "",
    tags: note?.tags || [],
    checklist: note?.checklist || [],
    attachments: note?.attachments || [],
    reminderDate: note?.reminderDate
      ? note.reminderDate.toISOString().slice(0, 16)
      : "",
  });

  const [newTag, setNewTag] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || "",
        content: note.content || "",
        color: note.color,
        width: note.width,
        height: note.height,
        projectId: note.projectId || "",
        tags: note.tags || [],
        checklist: note.checklist || [],
        attachments: note.attachments || [],
        reminderDate: note.reminderDate
          ? note.reminderDate.toISOString().slice(0, 16)
          : "",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        color: DEFAULT_STICKY_NOTE_COLOR,
        width: STICKY_NOTE_SIZES.medium.width,
        height: STICKY_NOTE_SIZES.medium.height,
        projectId: "",
        tags: [],
        checklist: [],
        attachments: [],
        reminderDate: "",
      });
    }
  }, [note]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        content: "",
        color: DEFAULT_STICKY_NOTE_COLOR,
        width: STICKY_NOTE_SIZES.medium.width,
        height: STICKY_NOTE_SIZES.medium.height,
        projectId: "",
        tags: [],
        checklist: [],
        attachments: [],
        reminderDate: "",
      });
      setNewTag("");
      setNewChecklistItem("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const noteData = {
      workspaceId,
      projectId: formData.projectId || undefined,
      title: formData.title.trim() || undefined,
      content: isListMode ? "" : formData.content.trim() || "",
      color: isListMode ? DEFAULT_STICKY_NOTE_COLOR : formData.color,
      positionX: note?.positionX || 0,
      positionY: note?.positionY || 0,
      width: isListMode ? STICKY_NOTE_SIZES.medium.width : formData.width,
      height: isListMode ? STICKY_NOTE_SIZES.medium.height : formData.height,
      isPinned: note?.isPinned || false,
      isArchived: note?.isArchived || false,
      reminderDate: isListMode
        ? undefined
        : formData.reminderDate
        ? new Date(formData.reminderDate)
        : undefined,
      tags: isListMode ? [] : formData.tags,
      checklist: formData.checklist,
      attachments: isListMode ? [] : formData.attachments,
    };

    onSave(noteData);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: `item-${Date.now()}`,
        text: newChecklistItem.trim(),
        isChecked: false,
      };
      setFormData({
        ...formData,
        checklist: [...formData.checklist, newItem],
      });
      setNewChecklistItem("");
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.map((item) =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      ),
    });
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter((item) => item.id !== itemId),
    });
  };

  const handleSizeChange = (size: "small" | "medium" | "large") => {
    const selectedSize = STICKY_NOTE_SIZES[size];
    setFormData({
      ...formData,
      width: selectedSize.width,
      height: selectedSize.height,
    });
  };

  const currentSize =
    formData.width === STICKY_NOTE_SIZES.small.width
      ? "small"
      : formData.width === STICKY_NOTE_SIZES.large.width
      ? "large"
      : "medium";

  const isListMode = mode === "list";

  const availableProjects =
    (projects as Project[])?.filter(
      (p: Project) => p.workspaceId === workspaceId
    ) || [];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isListMode ? "Nova Lista" : note ? "Editar Post-it" : "Novo Post-it"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Título (opcional)</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder={isListMode ? "Título da lista" : "Título do post-it"}
          />
        </div>

        {!isListMode && (
          <>
            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Escreva seu post-it aqui..."
                rows={6}
              />
            </div>
          </>
        )}

        {!isListMode && (
          <>
            <div>
              <Label htmlFor="project">Projeto</Label>
              <Select
                value={formData.projectId || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    projectId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {availableProjects.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cor</Label>
              <ColorPicker
                value={formData.color}
                onChange={(color) => setFormData({ ...formData, color })}
                predefinedColors={STICKY_NOTE_COLORS.map((c) => c.value)}
              />
            </div>

            <div>
              <Label>Tamanho</Label>
              <Select value={currentSize} onValueChange={handleSizeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Adicionar tag"
                />
                <Button type="button" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor:
                          state.currentTheme.colors.primary + "20",
                        color: state.currentTheme.colors.primary,
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Lembrete</Label>
              <div className="space-y-2">
                <Input
                  type="datetime-local"
                  value={formData.reminderDate}
                  onChange={(e) =>
                    setFormData({ ...formData, reminderDate: e.target.value })
                  }
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const inOneHour = new Date();
                      inOneHour.setHours(inOneHour.getHours() + 1);
                      setFormData({
                        ...formData,
                        reminderDate: inOneHour.toISOString().slice(0, 16),
                      });
                    }}
                  >
                    Em 1 hora
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(9, 0, 0, 0);
                      setFormData({
                        ...formData,
                        reminderDate: tomorrow.toISOString().slice(0, 16),
                      });
                    }}
                  >
                    Amanhã às 9h
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      nextWeek.setHours(9, 0, 0, 0);
                      setFormData({
                        ...formData,
                        reminderDate: nextWeek.toISOString().slice(0, 16),
                      });
                    }}
                  >
                    Próxima semana
                  </Button>
                  {formData.reminderDate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData({ ...formData, reminderDate: "" })
                      }
                    >
                      Remover
                    </Button>
                  )}
                </div>
                {formData.reminderDate && (
                  <p
                    className="text-xs"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    Lembrete:{" "}
                    {format(
                      new Date(formData.reminderDate),
                      "dd/MM/yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Imagens</Label>
              <AttachmentManager
                attachments={formData.attachments}
                onAttachmentsChange={(attachments) =>
                  setFormData({ ...formData, attachments })
                }
                workspaceId={workspaceId}
              />
            </div>
          </>
        )}

        <div>
          <Label>Checklist</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              placeholder="Adicionar item"
            />
            <Button type="button" onClick={handleAddChecklistItem}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.checklist.length > 0 && (
            <div className="space-y-2">
              {formData.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.isChecked}
                    onCheckedChange={() => handleToggleChecklistItem(item.id)}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.isChecked ? "line-through opacity-60" : ""
                    }`}
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
