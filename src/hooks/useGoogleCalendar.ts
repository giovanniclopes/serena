import { useState } from "react";
import {
  addTaskToGoogleCalendar,
  createGoogleCalendarEventObject,
} from "../services/googleCalendar";
import type { Task } from "../types";

interface UseGoogleCalendarResult {
  isLoading: boolean;
  error: string | null;
  url: string | null;
  addToGoogleCalendar: (task: Task) => Promise<void>;
  openGoogleCalendar: () => void;
  reset: () => void;
}

export function useGoogleCalendar(): UseGoogleCalendarResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const addToGoogleCalendar = async (task: Task): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await addTaskToGoogleCalendar(task);

      if (result.success && result.url) {
        setUrl(result.url);
      } else {
        setError(result.error || "Erro ao adicionar ao Google Calendar");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const openGoogleCalendar = (): void => {
    if (url) {
      window.open(url, "_blank");
    } else {
      setError("URL do Google Calendar não gerada");
    }
  };

  const reset = (): void => {
    setUrl(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    url,
    addToGoogleCalendar,
    openGoogleCalendar,
    reset,
  };
}

export function useGoogleCalendarAPI(): {
  eventObject: ReturnType<typeof createGoogleCalendarEventObject> | null;
  getEventObject: (task: Task) => void;
} {
  const [eventObject, setEventObject] = useState<ReturnType<
    typeof createGoogleCalendarEventObject
  > | null>(null);

  const getEventObject = (task: Task): void => {
    const event = createGoogleCalendarEventObject(task);
    setEventObject(event);
  };

  return {
    eventObject,
    getEventObject,
  };
}
