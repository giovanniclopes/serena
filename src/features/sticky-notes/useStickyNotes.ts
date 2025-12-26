import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createStickyNote,
  deleteStickyNote,
  getStickyNotes,
  updateStickyNote,
  updateStickyNotePosition,
} from "../../services/apiStickyNotes";

export function useStickyNotes() {
  const {
    data: stickyNotes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sticky-notes"],
    queryFn: getStickyNotes,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return { stickyNotes: stickyNotes || [], isLoading, error };
}

export function useCreateStickyNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStickyNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sticky-notes"] });
      toast.success("Post-it criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar post-it:", error);
      toast.error("Erro ao criar post-it. Tente novamente.");
    },
  });
}

export function useUpdateStickyNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStickyNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sticky-notes"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar post-it:", error);
      toast.error("Erro ao atualizar post-it. Tente novamente.");
    },
  });
}

export function useUpdateStickyNotePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      positionX,
      positionY,
    }: {
      noteId: string;
      positionX: number;
      positionY: number;
    }) => updateStickyNotePosition(noteId, positionX, positionY),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sticky-notes"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar posição do post-it:", error);
    },
  });
}

export function useDeleteStickyNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStickyNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sticky-notes"] });
      toast.success("Post-it excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir post-it:", error);
      toast.error("Erro ao excluir post-it. Tente novamente.");
    },
  });
}
