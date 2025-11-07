import { useEffect, useState } from "react";
import {
  canEditShoppingList,
  isShoppingListOwner,
} from "../services/shoppingListSharing";

export function useShoppingListPermissions(shoppingListId: string) {
  const [isOwner, setIsOwner] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      setIsLoading(true);
      try {
        const [ownerResult, editResult] = await Promise.all([
          isShoppingListOwner(shoppingListId),
          canEditShoppingList(shoppingListId),
        ]);
        setIsOwner(ownerResult);
        setCanEdit(editResult);
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setIsOwner(false);
        setCanEdit(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (shoppingListId) {
      checkPermissions();
    }
  }, [shoppingListId]);

  return { isOwner, canEdit, isLoading };
}

