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
    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    if (isLoading) {
      showTimer = setTimeout(() => {
        setShowSkeleton(true);
      }, showSkeletonAfter);

      hideTimer = setTimeout(() => {
        setIsLoadingComplete(true);
      }, minLoadingTime);
    } else {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);

      if (isLoadingComplete) {
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

export function useDelayedLoading(isLoading: boolean, delay: number = 200) {
  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    let timer: number;

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
      const timer = setTimeout(() => {
        setShouldShowSkeleton(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, retryCount, maxRetries]);

  return shouldShowSkeleton;
}
