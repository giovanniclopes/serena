import { differenceInMinutes, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { useCountdowns } from "../features/countdowns/useCountdowns";
import type { Countdown } from "../types";

export default function NextEventAlert() {
  const { state } = useApp();
  const { countdowns } = useCountdowns();
  const [currentAlert, setCurrentAlert] = useState<{
    countdown: Countdown;
    timeRemaining: string;
  } | null>(null);
  const hasPlayedSoundRef = useRef(false);
  const hasVibratedRef = useRef(false);
  const lastCountdownIdRef = useRef<string | null>(null);

  const filteredCountdowns = useMemo(
    () =>
      countdowns.filter(
        (countdown) => countdown.workspaceId === state.activeWorkspaceId
      ),
    [countdowns, state.activeWorkspaceId]
  );

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
      );
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {
      console.error("Erro ao reproduzir som de notificação");
    }
  }, []);

  const triggerVibration = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  useEffect(() => {
    const checkNextEvent = () => {
      const now = new Date();
      const upcomingCountdowns = filteredCountdowns
        .filter((countdown) => countdown.targetDate > now)
        .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

      if (upcomingCountdowns.length === 0) {
        setCurrentAlert(null);
        return;
      }

      const nextCountdown = upcomingCountdowns[0];
      const minutesUntil = differenceInMinutes(nextCountdown.targetDate, now);

      if (minutesUntil <= 60 && minutesUntil >= 0) {
        let timeRemaining = "";

        if (minutesUntil >= 60) {
          timeRemaining = "1 hora";
        } else if (minutesUntil > 1) {
          timeRemaining = `${minutesUntil} minutos`;
        } else if (minutesUntil === 1) {
          timeRemaining = "1 minuto";
        } else if (minutesUntil === 0) {
          timeRemaining = "agora";
        }

        if (timeRemaining) {
          const newAlert = {
            countdown: nextCountdown,
            timeRemaining,
          };

          if (lastCountdownIdRef.current !== nextCountdown.id) {
            hasPlayedSoundRef.current = false;
            hasVibratedRef.current = false;
            lastCountdownIdRef.current = nextCountdown.id;
          }

          setCurrentAlert((prevAlert) => {
            if (
              !prevAlert ||
              prevAlert.timeRemaining !== timeRemaining ||
              prevAlert.countdown.id !== nextCountdown.id
            ) {
              if (minutesUntil <= 5 && !hasPlayedSoundRef.current) {
                playNotificationSound();
                hasPlayedSoundRef.current = true;
              }

              if (minutesUntil <= 2 && !hasVibratedRef.current) {
                triggerVibration();
                hasVibratedRef.current = true;
              }
            }
            return newAlert;
          });
        } else {
          setCurrentAlert(null);
        }
      } else {
        setCurrentAlert((prevAlert) => {
          if (prevAlert && minutesUntil < 0) {
            hasPlayedSoundRef.current = false;
            hasVibratedRef.current = false;
            lastCountdownIdRef.current = null;
            return null;
          }
          return null;
        });
      }
    };

    checkNextEvent();
    const interval = setInterval(checkNextEvent, 1000);

    return () => clearInterval(interval);
  }, [filteredCountdowns, playNotificationSound, triggerVibration]);

  if (!currentAlert) {
    return null;
  }

  const tooltipContent = currentAlert
    ? `
    <div class="text-sm">
      <div class="font-semibold mb-1">${currentAlert.countdown.title}</div>
      <div class="text-gray-600 mb-1">${
        currentAlert.countdown.description || "Sem descrição"
      }</div>
      <div class="text-xs text-gray-500">
        Data: ${format(
          currentAlert.countdown.targetDate,
          "dd/MM/yyyy 'às' HH:mm",
          { locale: ptBR }
        )}
      </div>
    </div>
  `
    : "";

  return (
    <div className="mx-4 my-4">
      <div
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3 cursor-pointer hover:shadow-md transition-shadow duration-200"
        title={tooltipContent}
        data-tooltip={tooltipContent}
      >
        <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
        <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            Próximo evento em {currentAlert.timeRemaining}!
          </p>
          <p className="text-xs text-gray-600 truncate">
            {currentAlert.countdown.title}
          </p>
        </div>
      </div>
    </div>
  );
}
