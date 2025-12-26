import { useQuery } from "@tanstack/react-query";
import { getSharedStickyNoteIds } from "../services/stickyNoteSharing";

export function useSharedStickyNoteIds() {
  const { data: sharedStickyNoteIds = [], isLoading } = useQuery({
    queryKey: ["sharedStickyNoteIds"],
    queryFn: getSharedStickyNoteIds,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return { sharedStickyNoteIds, isLoading };
}
