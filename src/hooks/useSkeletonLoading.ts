import { useEffect, useState } from "react";

interface SkeletonLoadingOptions {
  minLoadingTime?: number;
  maxLoadingTime?: number;
  showSkeletonAfter?: number;
}

export function useSkeletonLoading(
  isLoading: boolean,
  options: SkeletonLoadingOptions = {}
) {
  const { minLoadingTime = 300, showSkeletonAfter = 100 } = options;

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  useEffect(() => {
    let showTimer: NodeJS.Timeout | undefined;
    let hideTimer: NodeJS.Timeout | undefined;

    if (isLoading) {
      // Mostrar skeleton após um pequeno delay para evitar flash
      showTimer = setTimeout(() => {
        setShowSkeleton(true);
      }, showSkeletonAfter);

      // Garantir tempo mínimo de loading
      hideTimer = setTimeout(() => {
        setIsLoadingComplete(true);
      }, minLoadingTime);
    } else {
      // Se não está carregando, limpar timers
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);

      if (isLoadingComplete) {
        // Delay para esconder skeleton suavemente
        const hideDelay = setTimeout(() => {
          setShowSkeleton(false);
          setIsLoadingComplete(false);
        }, 150);

        return () => clearTimeout(hideDelay);
      }
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isLoading, minLoadingTime, showSkeletonAfter, isLoadingComplete]);

  return {
    showSkeleton: showSkeleton && isLoading,
    isLoadingComplete,
  };
}

// Hook para loading com delay inteligente
export function useDelayedLoading(isLoading: boolean, delay: number = 200) {
  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      timer = setTimeout(() => {
        setDelayedLoading(true);
      }, delay);
    } else {
      setDelayedLoading(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return delayedLoading;
}

// Hook para loading com retry
export function useRetryLoading(
  isLoading: boolean,
  retryCount: number = 0,
  maxRetries: number = 3
) {
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);

  useEffect(() => {
    if (isLoading && retryCount < maxRetries) {
      setShouldShowSkeleton(true);
    } else if (!isLoading) {
      // Delay para esconder skeleton após sucesso
      const timer = setTimeout(() => {
        setShouldShowSkeleton(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, retryCount, maxRetries]);

  return shouldShowSkeleton;
}
