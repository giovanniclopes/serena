import { useQuery } from "@tanstack/react-query";
import { getSharedTaskIds } from "../services/taskSharing";

export function useSharedTaskIds() {
  const { data: sharedTaskIds = [], isLoading } = useQuery({
    queryKey: ["sharedTaskIds"],
    queryFn: getSharedTaskIds,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return { sharedTaskIds, isLoading };
}

