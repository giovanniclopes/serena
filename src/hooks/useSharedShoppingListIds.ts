import { useQuery } from "@tanstack/react-query";
import { getSharedShoppingListIds } from "../services/shoppingListSharing";

export function useSharedShoppingListIds() {
  const { data: sharedShoppingListIds = [], isLoading } = useQuery({
    queryKey: ["sharedShoppingListIds"],
    queryFn: getSharedShoppingListIds,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return { sharedShoppingListIds, isLoading };
}

