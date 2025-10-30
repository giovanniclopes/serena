import { useEffect, useState } from "react";
import { getTaskShares } from "../services/taskSharing";

export function useTaskShareCount(taskId: string | undefined) {
  const [shareCount, setShareCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setShareCount(0);
      return;
    }

    let cancelled = false;

    const fetchShareCount = async () => {
      setIsLoading(true);
      try {
        const shares = await getTaskShares(taskId);
        if (!cancelled) {
          setShareCount(shares.length);
        }
      } catch (error) {
        console.error("Erro ao buscar contagem de compartilhamentos:", error);
        if (!cancelled) {
          setShareCount(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchShareCount();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  return { shareCount, isLoading };
}

