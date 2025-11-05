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
}

export async function addTaskToGoogleCalendar(
  task: Task
): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const event: GoogleCalendarEvent = {
      summary: task.title,
      description: task.description || "",
      start: {},
      end: {},
    };

    if (task.dueDate) {
      const startDate = new Date(task.dueDate);
      const endDate = new Date(task.dueDate);
      endDate.setHours(endDate.getHours() + 1);

      event.start.dateTime = startDate.toISOString();
      event.end.dateTime = endDate.toISOString();
      event.start.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      event.end.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } else {
      const today = new Date();
      today.setHours(9, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setHours(10, 0, 0, 0);

      event.start.date = today.toISOString().split("T")[0];
      event.end.date = endDate.toISOString().split("T")[0];
    }

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.summary,
    });

    if (task.dueDate) {
      const startDate = new Date(task.dueDate);
      const endDate = new Date(task.dueDate);
      endDate.setHours(endDate.getHours() + 1);

      const startStr = formatDateForGoogleCalendar(startDate.toISOString());
      const endStr = formatDateForGoogleCalendar(endDate.toISOString());
      params.append("dates", `${startStr}/${endStr}`);
    } else {
      const today = new Date();
      today.setHours(9, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setHours(10, 0, 0, 0);

      params.append(
        "dates",
        `${formatDateOnly(today.toISOString().split("T")[0])}/${formatDateOnly(
          endDate.toISOString().split("T")[0]
        )}`
      );
    }

    if (event.description) {
      params.append("details", event.description);
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

function formatDateForGoogleCalendar(dateTime: string): string {
  const date = new Date(dateTime);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function formatDateOnly(date: string): string {
  return date.replace(/-/g, "");
}
