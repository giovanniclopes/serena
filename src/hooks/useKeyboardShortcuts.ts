import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const hasCtrlOrMeta = event.ctrlKey || event.metaKey;

        const ctrlMatch =
          shortcut.ctrlKey === undefined
            ? !hasCtrlOrMeta
            : shortcut.ctrlKey
            ? hasCtrlOrMeta
            : !hasCtrlOrMeta;

        const shiftMatch =
          shortcut.shiftKey === undefined
            ? !event.shiftKey
            : shortcut.shiftKey === event.shiftKey;

        const altMatch =
          shortcut.altKey === undefined
            ? !event.altKey
            : shortcut.altKey === event.altKey;

        const keyMatch =
          shortcut.key.toLowerCase() === event.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

