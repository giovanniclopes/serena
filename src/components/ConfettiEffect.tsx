import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
  recycle?: boolean;
  run?: boolean;
  numberOfPieces?: number;
  colors?: string[];
  gravity?: number;
  wind?: number;
  friction?: number;
  initialVelocityX?: number;
  initialVelocityY?: number;
}

export default function ConfettiEffect({
  isActive,
  onComplete,
  recycle = false,
  run = true,
  numberOfPieces = 200,
  colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
    "#ff9f43",
  ],
  gravity = 0.3,
  wind = 0.05,
  friction = 0.99,
  initialVelocityX = 4,
  initialVelocityY = 2,
}: ConfettiEffectProps) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <Confetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      recycle={recycle}
      run={run}
      numberOfPieces={numberOfPieces}
      colors={colors}
      gravity={gravity}
      wind={wind}
      friction={friction}
      initialVelocityX={initialVelocityX}
      initialVelocityY={initialVelocityY}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  );
}
