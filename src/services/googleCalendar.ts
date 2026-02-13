import type { Task } from "../types";

export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup" | "sms";
      minutes: number;
    }>;
  };
}

function formatDateForGoogleCalendar(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function buildEventDescription(task: Task): string {
  const parts: string[] = [];

  if (task.description) {
    parts.push(task.description);
  }

  if (task.subtasks && task.subtasks.length > 0) {
    parts.push("\n📋 Subtarefas:");
    task.subtasks.forEach((subtask) => {
      const status = subtask.isCompleted ? "✅" : "☐";
      parts.push(`${status} ${subtask.title}`);
    });
  }

  return parts.join("\n");
}

function getEventDuration(
  startDate: Date,
  endDate?: Date,
): { start: Date; end: Date } {
  const start = startDate;
  const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora por padrão

  return { start, end };
}

export async function addTaskToGoogleCalendar(
  task: Task,
): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: task.title,
    });

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const { start, end } = getEventDuration(dueDate);

      const startStr = formatDateForGoogleCalendar(start);
      const endStr = formatDateForGoogleCalendar(end);
      params.append("dates", `${startStr}/${endStr}`);
    } else {
      const today = new Date();
      today.setHours(9, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setHours(10, 0, 0, 0);

      const startStr = formatDateForGoogleCalendar(today);
      const endStr = formatDateForGoogleCalendar(endDate);
      params.append("dates", `${startStr}/${endStr}`);
    }

    const description = buildEventDescription(task);
    if (description) {
      params.append("details", description);
    }

    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;

    return { success: true, url };
  } catch (error) {
    console.error("Erro ao criar evento do Google Calendar:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao adicionar ao Google Agenda",
    };
  }
}

export function createGoogleCalendarEventObject(
  task: Task,
): GoogleCalendarEvent {
  const event: GoogleCalendarEvent = {
    summary: task.title,
    description: buildEventDescription(task),
    start: {},
    end: {},
  };

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const { start, end } = getEventDuration(dueDate);

    event.start.dateTime = start.toISOString();
    event.end.dateTime = end.toISOString();
  } else {
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(10, 0, 0, 0);

    event.start.dateTime = today.toISOString();
    event.end.dateTime = endDate.toISOString();
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  event.start.timeZone = timeZone;
  event.end.timeZone = timeZone;

  event.reminders = {
    useDefault: false,
    overrides: [
      { method: "popup", minutes: 30 }, // 30 minutos antes
      { method: "email", minutes: 120 }, // 2 horas antes
      { method: "email", minutes: 1440 }, // 1 dia antes
      { method: "email", minutes: 10080 }, // 1 semana antes
    ],
  };

  return event;
}
