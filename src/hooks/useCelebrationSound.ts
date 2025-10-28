import { useCallback, useRef } from "react";

export function useCelebrationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const playSuccessSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );

        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + 0.5);
      });
    } catch {
      console.log("Audio não suportado neste navegador");
    }
  }, []);

  const playAchievementSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      const frequencies = [261.63, 329.63, 392.0, 523.25, 659.25]; // C4, E4, G4, C5, E5

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = "triangle";

        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.8
        );

        oscillator.start(audioContext.currentTime + index * 0.15);
        oscillator.stop(audioContext.currentTime + 0.8);
      });
    } catch {
      console.log("Audio não suportado neste navegador");
    }
  }, []);

  const playMilestoneSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      const frequencies = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = "sawtooth";

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 1.2
        );

        oscillator.start(audioContext.currentTime + index * 0.2);
        oscillator.stop(audioContext.currentTime + 1.2);
      });
    } catch {
      console.log("Audio não suportado neste navegador");
    }
  }, []);

  return {
    playSuccessSound,
    playAchievementSound,
    playMilestoneSound,
  };
}
