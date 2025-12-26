import type { StickyNote } from "../types";

export interface ReminderCheck {
  note: StickyNote;
  reminderDate: Date;
}

export function checkReminders(notes: StickyNote[]): ReminderCheck[] {
  const now = new Date();
  const activeReminders: ReminderCheck[] = [];

  for (const note of notes) {
    if (note.reminderDate && !note.isArchived) {
      const reminderDate = new Date(note.reminderDate);
      if (reminderDate <= now) {
        activeReminders.push({ note, reminderDate });
      }
    }
  }

  return activeReminders;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Este navegador não suporta notificações");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showReminderNotification(note: StickyNote): void {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    const title = note.title || "Lembrete";
    const body = note.content || "Você tem um lembrete";
    const icon = "/icons/icon-192x192.png";

    const notification = new Notification(title, {
      body,
      icon,
      tag: `sticky-note-${note.id}`,
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}
