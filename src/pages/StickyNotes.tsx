import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StickyNote as StickyNoteIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import AIStickyNoteInput from "../components/AIStickyNoteInput";
import ConfirmDialog from "../components/ConfirmDialog";
import DrawingModal from "../components/DrawingModal";
import EmptyState from "../components/EmptyState";
import FloatingActionButton from "../components/FloatingActionButton";
import QuickNoteInput from "../components/QuickNoteInput";
import ShareStickyNoteModal from "../components/ShareStickyNoteModal";
import StickyNote from "../components/StickyNote";
import StickyNoteModal from "../components/StickyNoteModal";
import type { SortBy, SortOrder } from "../components/StickyNotesToolbar";
import StickyNotesToolbar from "../components/StickyNotesToolbar";
import {
  DEFAULT_STICKY_NOTE_COLOR,
  STICKY_NOTE_SIZES,
} from "../constants/stickyNoteColors";
import { useApp } from "../context/AppContext";
import {
  useCreateStickyNote,
  useDeleteStickyNote,
  useStickyNotes,
  useUpdateStickyNote,
  useUpdateStickyNotePosition,
} from "../features/sticky-notes/useStickyNotes";
import { useParseNoteInput } from "../hooks/useParseNoteInput";
import { useStickyNoteReminders } from "../hooks/useStickyNoteReminders";
import { uploadAttachment } from "../services/apiAttachments";
import type {
  Attachment,
  ChecklistItem,
  StickyNote as StickyNoteType,
} from "../types";

interface SortableStickyNoteProps {
  note: StickyNoteType;
  onEdit: (note: StickyNoteType) => void;
  onUpdate?: (note: StickyNoteType) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (note: StickyNoteType) => void;
  onToggleArchive: (note: StickyNoteType) => void;
  onChecklistToggle: (noteId: string, itemId: string, checked: boolean) => void;
  onShare?: (note: StickyNoteType) => void;
}

function SortableStickyNote({
  note,
  onEdit,
  onUpdate,
  onDelete,
  onTogglePin,
  onToggleArchive,
  onChecklistToggle,
  onShare,
}: SortableStickyNoteProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full">
      <StickyNote
        note={note}
        onEdit={onEdit}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
        onToggleArchive={onToggleArchive}
        onChecklistToggle={onChecklistToggle}
        onShare={onShare}
        isDragging={isDragging}
        dragHandleProps={{ attributes, listeners }}
        style={{
          position: "relative",
          left: 0,
          top: 0,
        }}
      />
    </div>
  );
}

export default function StickyNotes() {
  const { state } = useApp();
  const { stickyNotes, isLoading } = useStickyNotes();
  const createNoteMutation = useCreateStickyNote();
  const updateNoteMutation = useUpdateStickyNote();
  const updatePositionMutation = useUpdateStickyNotePosition();
  const deleteNoteMutation = useDeleteStickyNote();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StickyNoteType | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("modified");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [noteToShare, setNoteToShare] = useState<StickyNoteType | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"default" | "list">("default");
  const [isAIInputOpen, setIsAIInputOpen] = useState(false);
  const [aiInputValue, setAiInputValue] = useState("");
  const parseNoteMutation = useParseNoteInput();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const workspaceNotes = useMemo(
    () =>
      stickyNotes.filter(
        (note) =>
          note.workspaceId === state.activeWorkspaceId &&
          (showArchived ? note.isArchived : !note.isArchived)
      ),
    [stickyNotes, state.activeWorkspaceId, showArchived]
  );

  const filteredNotes = useMemo(() => {
    let notes = workspaceNotes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      notes = notes.filter(
        (note) =>
          note.title?.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    const sorted = [...notes].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "created") {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      } else if (sortBy === "modified") {
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
      } else if (sortBy === "alphabetical") {
        const titleA = (a.title || a.content || "").toLowerCase();
        const titleB = (b.title || b.content || "").toLowerCase();
        comparison = titleA.localeCompare(titleB);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [workspaceNotes, searchQuery, sortBy, sortOrder]);

  useStickyNoteReminders({
    notes: workspaceNotes,
    enabled: true,
    checkInterval: 60000,
  });

  const handleCreateNote = () => {
    setEditingNote(undefined);
    setModalMode("default");
    setIsModalOpen(true);
  };

  const handleQuickCreate = async (quickNote: {
    title?: string;
    content: string;
    color: string;
    isPinned: boolean;
    isChecklist: boolean;
  }) => {
    if (!quickNote.content.trim() && !quickNote.title?.trim()) {
      return;
    }

    const checklist = quickNote.isChecklist
      ? quickNote.content
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => ({
            id: `item-${Date.now()}-${Math.random()}`,
            text: line.trim(),
            isChecked: false,
          }))
      : [];

    await createNoteMutation.mutateAsync({
      workspaceId: state.activeWorkspaceId,
      title: quickNote.title,
      content: quickNote.isChecklist ? "" : quickNote.content,
      color: quickNote.color,
      positionX: 0,
      positionY: 0,
      width: STICKY_NOTE_SIZES.medium.width,
      height: STICKY_NOTE_SIZES.medium.height,
      isPinned: quickNote.isPinned,
      isArchived: false,
      tags: [],
      checklist: checklist,
      attachments: [],
    });
  };

  const handleEditNote = (note: StickyNoteType) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (
    noteData: Omit<StickyNoteType, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingNote) {
      await updateNoteMutation.mutateAsync({
        ...editingNote,
        ...noteData,
      });
    } else {
      await createNoteMutation.mutateAsync({
        ...noteData,
        positionX: 0,
        positionY: 0,
        width: noteData.width || STICKY_NOTE_SIZES.medium.width,
        height: noteData.height || STICKY_NOTE_SIZES.medium.height,
        color: noteData.color || DEFAULT_STICKY_NOTE_COLOR,
        isPinned: false,
        isArchived: false,
        tags: noteData.tags || [],
        checklist: noteData.checklist || [],
        attachments: noteData.attachments || [],
      });
    }
    setIsModalOpen(false);
    setEditingNote(undefined);
    setModalMode("default");
  };

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteNote = async () => {
    if (noteToDelete) {
      await deleteNoteMutation.mutateAsync(noteToDelete);
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    }
  };

  const handleDragEnd = useCallback(
    async (event: any) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const activeNote = filteredNotes.find((n) => n.id === active.id);
      const overNote = filteredNotes.find((n) => n.id === over.id);

      if (activeNote && overNote) {
        const oldIndex = filteredNotes.findIndex((n) => n.id === active.id);
        const newIndex = filteredNotes.findIndex((n) => n.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          await updatePositionMutation.mutateAsync({
            noteId: activeNote.id,
            positionX: activeNote.positionX,
            positionY: activeNote.positionY,
          });
        }
      }
    },
    [filteredNotes, updatePositionMutation]
  );

  const handleTogglePin = async (note: StickyNoteType) => {
    await updateNoteMutation.mutateAsync({
      ...note,
      isPinned: !note.isPinned,
    });
  };

  const handleToggleArchive = async (note: StickyNoteType) => {
    await updateNoteMutation.mutateAsync({
      ...note,
      isArchived: !note.isArchived,
    });
    toast.success(
      note.isArchived
        ? "Post-it desarquivado com sucesso!"
        : "Post-it arquivado com sucesso!"
    );
  };

  const handleUpdateNote = async (note: StickyNoteType) => {
    await updateNoteMutation.mutateAsync(note);
  };

  const handleChecklistToggle = async (
    noteId: string,
    itemId: string,
    checked: boolean
  ) => {
    const note = filteredNotes.find((n) => n.id === noteId);
    if (note) {
      const updatedChecklist: ChecklistItem[] = (note.checklist || []).map(
        (item) => (item.id === itemId ? { ...item, isChecked: checked } : item)
      );
      await updateNoteMutation.mutateAsync({
        ...note,
        checklist: updatedChecklist,
      });
    }
  };

  const handleShareNote = (note: StickyNoteType) => {
    setNoteToShare(note);
    setIsShareModalOpen(true);
  };

  const handleCreateNoteWithDrawing = () => {
    setIsDrawingModalOpen(true);
  };

  const handleSaveDrawing = async (attachment: Attachment) => {
    await createNoteMutation.mutateAsync({
      workspaceId: state.activeWorkspaceId,
      title: "Nova Nota com Desenho",
      content: "",
      color: DEFAULT_STICKY_NOTE_COLOR,
      positionX: 0,
      positionY: 0,
      width: STICKY_NOTE_SIZES.medium.width,
      height: STICKY_NOTE_SIZES.medium.height,
      isPinned: false,
      isArchived: false,
      tags: [],
      checklist: [],
      attachments: [attachment],
    });
  };

  const openImagePicker = (): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0] || null;
        resolve(file);
      };
      input.oncancel = () => resolve(null);
      input.click();
    });
  };

  const handleCreateList = () => {
    setEditingNote(undefined);
    setModalMode("list");
    setIsModalOpen(true);
  };

  const handleCreateNoteWithImage = async () => {
    const file = await openImagePicker();
    if (!file) return;

    const uploadResult = await uploadAttachment({
      file,
      workspaceId: state.activeWorkspaceId,
    });

    if (!uploadResult.success || !uploadResult.attachment) {
      toast.error("Erro ao fazer upload da imagem");
      return;
    }

    const newNote = await createNoteMutation.mutateAsync({
      workspaceId: state.activeWorkspaceId,
      title: "",
      content: "",
      color: DEFAULT_STICKY_NOTE_COLOR,
      positionX: 0,
      positionY: 0,
      width: STICKY_NOTE_SIZES.medium.width,
      height: STICKY_NOTE_SIZES.medium.height,
      isPinned: false,
      isArchived: false,
      tags: [],
      checklist: [],
      attachments: [uploadResult.attachment],
    });

    setEditingNote(newNote);
    setIsModalOpen(true);
  };

  const handleCreateNoteWithAI = () => {
    setIsAIInputOpen(true);
    setAiInputValue("");
  };

  const handleAICreation = async () => {
    if (!aiInputValue.trim()) return;

    try {
      const result = await parseNoteMutation.mutateAsync(aiInputValue);

      if (result.success && result.data) {
        const checklist = result.data.checklist
          ? result.data.checklist.map((item) => ({
              id: `item-${Date.now()}-${Math.random()}`,
              text: item,
              isChecked: false,
            }))
          : [];

        const newNote = await createNoteMutation.mutateAsync({
          workspaceId: state.activeWorkspaceId,
          title: result.data.title,
          content: result.data.content,
          color: result.data.color || DEFAULT_STICKY_NOTE_COLOR,
          positionX: 0,
          positionY: 0,
          width: STICKY_NOTE_SIZES.medium.width,
          height: STICKY_NOTE_SIZES.medium.height,
          isPinned: false,
          isArchived: false,
          tags: result.data.tags || [],
          checklist: checklist,
          attachments: [],
          reminderDate: result.data.reminderDate
            ? new Date(result.data.reminderDate)
            : undefined,
        });

        setEditingNote(newNote);
        setIsModalOpen(true);
        setAiInputValue("");
        setIsAIInputOpen(false);
        toast.success("Nota criada com sucesso!");
      } else if (result.partialData) {
        const checklist = result.partialData.checklist
          ? result.partialData.checklist.map((item) => ({
              id: `item-${Date.now()}-${Math.random()}`,
              text: item,
              isChecked: false,
            }))
          : [];

        const newNote = await createNoteMutation.mutateAsync({
          workspaceId: state.activeWorkspaceId,
          title: result.partialData.title,
          content: result.partialData.content || aiInputValue,
          color: result.partialData.color || DEFAULT_STICKY_NOTE_COLOR,
          positionX: 0,
          positionY: 0,
          width: STICKY_NOTE_SIZES.medium.width,
          height: STICKY_NOTE_SIZES.medium.height,
          isPinned: false,
          isArchived: false,
          tags: result.partialData.tags || [],
          checklist: checklist,
          attachments: [],
          reminderDate: result.partialData.reminderDate
            ? new Date(result.partialData.reminderDate)
            : undefined,
        });

        setEditingNote(newNote);
        setIsModalOpen(true);
        setAiInputValue("");
        setIsAIInputOpen(false);
        toast.success(
          "Nota criada com dados parciais. Você pode editar para completar."
        );
      }
    } catch (error) {
      console.error("Erro ao criar nota com IA:", error);
    }
  };

  useStickyNoteReminders({
    notes: workspaceNotes,
    enabled: true,
    checkInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"></div>
          <p style={{ color: state.currentTheme.colors.textSecondary }}>
            Carregando post-its...
          </p>
        </div>
      </div>
    );
  }

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: state.currentTheme.colors.background,
        minHeight: "100vh",
      }}
    >
      <StickyNotesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showArchived={showArchived}
        onToggleShowArchived={() => setShowArchived(!showArchived)}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <div className="px-4 pt-4">
        <QuickNoteInput
          onCreateNote={handleQuickCreate}
          onCreateList={handleCreateList}
          onCreateNoteWithDrawing={handleCreateNoteWithDrawing}
          onCreateNoteWithImage={handleCreateNoteWithImage}
          onCreateNoteWithAI={handleCreateNoteWithAI}
        />
      </div>

      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          minHeight: "calc(100vh - 200px)",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={StickyNoteIcon}
            title={
              searchQuery
                ? "Nenhum post-it encontrado"
                : showArchived
                ? "Nenhum post-it arquivado"
                : "Nenhum post-it criado"
            }
            description={
              searchQuery
                ? "Tente ajustar sua busca para encontrar o que procura."
                : showArchived
                ? "Você ainda não arquivou nenhum post-it."
                : "Crie seu primeiro post-it para começar a organizar suas ideias!"
            }
            actionLabel={
              searchQuery || showArchived ? undefined : "Criar Primeiro Post-it"
            }
            onAction={
              searchQuery || showArchived ? undefined : handleCreateNote
            }
          />
        ) : (
          <div className="space-y-4">
            {pinnedNotes.length > 0 && (
              <div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Fixados
                </h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={pinnedNotes.map((n) => n.id)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 auto-rows-max">
                      {pinnedNotes.map((note, index) => (
                        <div
                          key={note.id}
                          className="animate-in fade-in slide-in-from-bottom-4"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationDuration: "400ms",
                            animationFillMode: "both",
                          }}
                        >
                          <SortableStickyNote
                            note={note}
                            onEdit={handleEditNote}
                            onUpdate={handleUpdateNote}
                            onDelete={handleDeleteNote}
                            onTogglePin={handleTogglePin}
                            onToggleArchive={handleToggleArchive}
                            onChecklistToggle={handleChecklistToggle}
                            onShare={handleShareNote}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h3
                    className="text-sm font-semibold mb-2 mt-4"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    Outros
                  </h3>
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={unpinnedNotes.map((n) => n.id)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 auto-rows-max">
                      {unpinnedNotes.map((note, index) => (
                        <div
                          key={note.id}
                          className="animate-in fade-in slide-in-from-bottom-4"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationDuration: "400ms",
                            animationFillMode: "both",
                          }}
                        >
                          <SortableStickyNote
                            note={note}
                            onEdit={handleEditNote}
                            onUpdate={handleUpdateNote}
                            onDelete={handleDeleteNote}
                            onTogglePin={handleTogglePin}
                            onToggleArchive={handleToggleArchive}
                            onChecklistToggle={handleChecklistToggle}
                            onShare={handleShareNote}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        )}
      </div>

      <FloatingActionButton onClick={handleCreateNote} />

      <StickyNoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(undefined);
          setModalMode("default");
        }}
        note={editingNote}
        onSave={handleSaveNote}
        workspaceId={state.activeWorkspaceId}
        mode={modalMode}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setNoteToDelete(null);
        }}
        onConfirm={confirmDeleteNote}
        title="Excluir Post-it"
        message="Tem certeza que deseja excluir este post-it? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteNoteMutation.isPending}
      />

      <ShareStickyNoteModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setNoteToShare(null);
        }}
        note={noteToShare}
      />

      <DrawingModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSave={handleSaveDrawing}
        workspaceId={state.activeWorkspaceId}
      />

      {isAIInputOpen && (
        <AIStickyNoteInput
          value={aiInputValue}
          onChange={setAiInputValue}
          onSubmit={handleAICreation}
          onClose={() => {
            setIsAIInputOpen(false);
            setAiInputValue("");
          }}
          isProcessing={parseNoteMutation.isPending}
        />
      )}
    </div>
  );
}
