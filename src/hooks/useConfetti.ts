import { useCallback, useState } from "react";

interface ConfettiConfig {
  recycle?: boolean;
  run?: boolean;
  numberOfPieces?: number;
  colors?: string[];
  gravity?: number;
  wind?: number;
  friction?: number;
  initialVelocityX?: number;
  initialVelocityY?: number;
  spread?: number;
}

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<ConfettiConfig>({});

  const triggerConfetti = useCallback((customConfig?: ConfettiConfig) => {
    if (customConfig) {
      setConfig(customConfig);
    }
    setIsActive(true);
  }, []);

  const stopConfetti = useCallback(() => {
    setIsActive(false);
  }, []);

  const triggerCelebration = useCallback(
    (type: "task" | "milestone" | "achievement" = "task") => {
      const configs = {
        task: {
          numberOfPieces: 150,
          colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
          gravity: 0.3,
          wind: 0.05,
          spread: 45,
        },
        milestone: {
          numberOfPieces: 300,
          colors: [
            "#ff6b6b",
            "#4ecdc4",
            "#45b7d1",
            "#96ceb4",
            "#feca57",
            "#ff9ff3",
            "#54a0ff",
            "#5f27cd",
          ],
          gravity: 0.2,
          wind: 0.1,
          spread: 60,
        },
        achievement: {
          numberOfPieces: 500,
          colors: [
            "#ffd700",
            "#ff6b6b",
            "#4ecdc4",
            "#45b7d1",
            "#96ceb4",
            "#feca57",
            "#ff9ff3",
            "#54a0ff",
            "#5f27cd",
            "#00d2d3",
          ],
          gravity: 0.15,
          wind: 0.15,
          spread: 75,
        },
      };

      triggerConfetti(configs[type]);
    },
    [triggerConfetti]
  );

  return {
    isActive,
    config,
    triggerConfetti,
    stopConfetti,
    triggerCelebration,
  };
}
