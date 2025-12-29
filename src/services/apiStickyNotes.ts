import { supabase } from "../lib/supabaseClient";
import type { Attachment, ChecklistItem, StickyNote } from "../types";
import { getSharedStickyNoteIds } from "./stickyNoteSharing";

function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Data inválida: ${dateString}`);
  }
  return date;
}

export async function getStickyNotes(): Promise<StickyNote[]> {
  const sharedNoteIds = await getSharedStickyNoteIds();

  let sharedNotesResult: any = { data: [], error: null };
  if (sharedNoteIds.length > 0) {
    const sharedQuery = supabase
      .from("sticky_notes")
      .select("*")
      .in("id", sharedNoteIds);

    sharedNotesResult = await sharedQuery
      .order("is_pinned", {
        ascending: false,
      })
      .order("created_at", { ascending: false });
  }

  const { data, error } = await supabase
    .from("sticky_notes")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar post-its:", error);
    throw new Error("Falha ao carregar post-its");
  }

  if (sharedNotesResult.error) {
    console.error(
      "Erro ao buscar post-its compartilhados:",
      sharedNotesResult.error
    );
  }

  const allNotes = [...(data || []), ...(sharedNotesResult.data || [])];

  const uniqueNotes = Array.from(
    new Map(allNotes.map((note) => [note.id, note])).values()
  );

  return (
    uniqueNotes.map((note) => ({
      id: note.id,
      workspaceId: note.workspace_id,
      projectId: note.project_id || undefined,
      title: note.title,
      content: note.content || "",
      color: note.color,
      positionX: Number(note.position_x),
      positionY: Number(note.position_y),
      width: note.width,
      height: note.height,
      isPinned: note.is_pinned,
      isArchived: note.is_archived,
      reminderDate: note.reminder_date
        ? parseDate(note.reminder_date)
        : undefined,
      tags: (note.tags || []) as string[],
      attachments: (note.attachments || []).map((att: any) => ({
        id: att.id,
        name: att.name,
        url: att.url,
        type: att.type,
        size: att.size,
        uploadedAt: parseDate(att.uploadedAt),
      })) as Attachment[],
      checklist: Array.isArray(note.checklist)
        ? (note.checklist as ChecklistItem[])
        : [],
      createdAt: parseDate(note.created_at),
      updatedAt: parseDate(note.updated_at),
    })) || []
  );
}

export async function createStickyNote(
  note: Omit<StickyNote, "id" | "createdAt" | "updatedAt">
): Promise<StickyNote> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("sticky_notes")
    .insert({
      workspace_id: note.workspaceId,
      user_id: user.id,
      project_id: note.projectId || null,
      title: note.title,
      content: note.content,
      color: note.color,
      position_x: note.positionX,
      position_y: note.positionY,
      width: note.width,
      height: note.height,
      is_pinned: note.isPinned,
      is_archived: note.isArchived,
      reminder_date: note.reminderDate ? note.reminderDate.toISOString() : null,
      tags: note.tags || [],
      attachments: note.attachments || [],
      checklist: note.checklist || [],
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar post-it:", error);
    throw new Error("Falha ao criar post-it");
  }

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    projectId: data.project_id || undefined,
    title: data.title,
    content: data.content || "",
    color: data.color,
    positionX: Number(data.position_x),
    positionY: Number(data.position_y),
    width: data.width,
    height: data.height,
    isPinned: data.is_pinned,
    isArchived: data.is_archived,
    reminderDate: data.reminder_date
      ? parseDate(data.reminder_date)
      : undefined,
    tags: (data.tags || []) as string[],
    attachments: (data.attachments || []).map((att: any) => ({
      id: att.id,
      name: att.name,
      url: att.url,
      type: att.type,
      size: att.size,
      uploadedAt: parseDate(att.uploadedAt),
    })) as Attachment[],
    checklist: Array.isArray(data.checklist)
      ? (data.checklist as ChecklistItem[])
      : [],
    createdAt: parseDate(data.created_at),
    updatedAt: parseDate(data.updated_at),
  };
}

export async function updateStickyNote(note: StickyNote): Promise<StickyNote> {
  const { data, error } = await supabase
    .from("sticky_notes")
    .update({
      project_id: note.projectId || null,
      title: note.title,
      content: note.content,
      color: note.color,
      position_x: note.positionX,
      position_y: note.positionY,
      width: note.width,
      height: note.height,
      is_pinned: note.isPinned,
      is_archived: note.isArchived,
      reminder_date: note.reminderDate ? note.reminderDate.toISOString() : null,
      tags: note.tags || [],
      attachments: note.attachments || [],
      checklist: note.checklist || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", note.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar post-it:", error);
    throw new Error("Falha ao atualizar post-it");
  }

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    projectId: data.project_id || undefined,
    title: data.title,
    content: data.content || "",
    color: data.color,
    positionX: Number(data.position_x),
    positionY: Number(data.position_y),
    width: data.width,
    height: data.height,
    isPinned: data.is_pinned,
    isArchived: data.is_archived,
    reminderDate: data.reminder_date
      ? parseDate(data.reminder_date)
      : undefined,
    tags: (data.tags || []) as string[],
    attachments: (data.attachments || []).map((att: any) => ({
      id: att.id,
      name: att.name,
      url: att.url,
      type: att.type,
      size: att.size,
      uploadedAt: parseDate(att.uploadedAt),
    })) as Attachment[],
    checklist: Array.isArray(data.checklist)
      ? (data.checklist as ChecklistItem[])
      : [],
    createdAt: parseDate(data.created_at),
    updatedAt: parseDate(data.updated_at),
  };
}

export async function updateStickyNotePosition(
  noteId: string,
  positionX: number,
  positionY: number
): Promise<void> {
  const { error } = await supabase
    .from("sticky_notes")
    .update({
      position_x: positionX,
      position_y: positionY,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId);

  if (error) {
    console.error("Erro ao atualizar posição do post-it:", error);
    throw new Error("Falha ao atualizar posição do post-it");
  }
}

export async function updateStickyNoteOrder(
  noteId: string,
  newUpdatedAt: Date
): Promise<void> {
  const { error } = await supabase
    .from("sticky_notes")
    .update({
      updated_at: newUpdatedAt.toISOString(),
    })
    .eq("id", noteId);

  if (error) {
    console.error("Erro ao atualizar ordem do post-it:", error);
    throw new Error("Falha ao atualizar ordem do post-it");
  }
}

export async function deleteStickyNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from("sticky_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("Erro ao excluir post-it:", error);
    throw new Error("Falha ao excluir post-it");
  }
}
