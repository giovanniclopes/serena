import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}

export function useAppStorage() {
  const [appData, setAppData] = useLocalStorage("serena-app-data", {
    workspaces: [],
    activeWorkspaceId: "",
    projects: [],
    tasks: [],
    habits: [],
    habitEntries: [],
    countdowns: [],
    tags: [],
    filters: [],
    currentThemeId: "serena-default",
  });

  return {
    appData,
    setAppData,
    hasInitialized: true,
  };
}
