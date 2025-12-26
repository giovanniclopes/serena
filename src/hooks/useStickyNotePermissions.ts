import { useQuery } from "@tanstack/react-query";
import {
  canEditStickyNote,
  isStickyNoteOwner,
} from "../services/stickyNoteSharing";

export function useStickyNotePermissions(noteId: string) {
  const { data: canEdit = false, isLoading: isLoadingEdit } = useQuery({
    queryKey: ["stickyNotePermissions", noteId, "canEdit"],
    queryFn: () => canEditStickyNote(noteId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: isOwner = false, isLoading: isLoadingOwner } = useQuery({
    queryKey: ["stickyNotePermissions", noteId, "isOwner"],
    queryFn: () => isStickyNoteOwner(noteId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    canEdit,
    isOwner,
    isLoading: isLoadingEdit || isLoadingOwner,
  };
}
