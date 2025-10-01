import type { Theme } from "../types";

export const defaultTheme: Theme = {
  id: "serena-default",
  name: "Serena Padrão",
  colors: {
    primary: "#ec4899",
    secondary: "#f3e8ff",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },
};

export const availableThemes: Theme[] = [
  defaultTheme,
  {
    id: "night-stars",
    name: "Noite Estrelada",
    colors: {
      primary: "#8b5cf6",
      secondary: "#1e1b4b",
      background: "#0f0f23",
      surface: "#1a1a2e",
      text: "#e2e8f0",
      textSecondary: "#94a3b8",
      border: "#334155",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
    },
  },
  {
    id: "botanical-garden",
    name: "Jardim Botânico",
    colors: {
      primary: "#059669",
      secondary: "#ecfdf5",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#1f2937",
      textSecondary: "#6b7280",
      border: "#d1fae5",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
    },
  },
  {
    id: "serene-beach",
    name: "Praia Serena",
    colors: {
      primary: "#0ea5e9",
      secondary: "#f0f9ff",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1f2937",
      textSecondary: "#6b7280",
      border: "#bae6fd",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
    },
  },
];
