import { useCallback } from "react";

export function useHapticFeedback() {
  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" = "light") => {
      if ("vibrate" in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
        };

        try {
          navigator.vibrate(patterns[type]);
        } catch (error) {
          console.debug("Vibration not supported:", error);
        }
      }
    },
    []
  );

  const triggerSuccess = useCallback(() => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([10, 50, 10]);
      } catch (error) {
        console.debug("Vibration not supported:", error);
      }
    }
  }, []);

  const triggerError = useCallback(() => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([20, 50, 20, 50, 20]);
      } catch (error) {
        console.debug("Vibration not supported:", error);
      }
    }
  }, []);

  return {
    triggerHaptic,
    triggerSuccess,
    triggerError,
  };
}
