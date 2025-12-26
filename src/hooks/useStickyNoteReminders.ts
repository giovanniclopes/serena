import { useEffect, useRef } from "react";
import {
  checkReminders,
  requestNotificationPermission,
  showReminderNotification,
} from "../services/stickyNoteReminderService";
import type { StickyNote } from "../types";

interface UseStickyNoteRemindersOptions {
  notes: StickyNote[];
  enabled?: boolean;
  checkInterval?: number;
}

export function useStickyNoteReminders({
  notes,
  enabled = true,
  checkInterval = 60000,
}: UseStickyNoteRemindersOptions) {
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const requestPermission = async () => {
      if (!permissionRequestedRef.current) {
        permissionRequestedRef.current = true;
        await requestNotificationPermission();
      }
    };

    requestPermission();

    const checkAndNotify = () => {
      const activeReminders = checkReminders(notes);

      for (const { note, reminderDate } of activeReminders) {
        const reminderKey = `${note.id}-${reminderDate.getTime()}`;

        if (!notifiedIdsRef.current.has(reminderKey)) {
          notifiedIdsRef.current.add(reminderKey);
          showReminderNotification(note);

          setTimeout(() => {
            notifiedIdsRef.current.delete(reminderKey);
          }, 60000);
        }
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [notes, enabled, checkInterval]);
}
