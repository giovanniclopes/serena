import { useMemo } from "react";
import { adjustColorBrightness } from "../utils/colorUtils";
import { useWorkspaceColor } from "./useWorkspaceColor";

export function useWorkspaceColors() {
  const workspaceColor = useWorkspaceColor();

  return useMemo(() => {
    const primary = workspaceColor;
    const secondary = adjustColorBrightness(workspaceColor, 0.95);
    const tertiary = adjustColorBrightness(workspaceColor, 0.9);
    const light = adjustColorBrightness(workspaceColor, 0.85);
    const lighter = adjustColorBrightness(workspaceColor, 0.8);

    return {
      primary,
      secondary,
      tertiary,
      light,
      lighter,
      // Cores neutras que sempre funcionam bem
      neutral: {
        white: "#ffffff",
        lightGray: "#f8fafc",
        gray: "#e5e7eb",
        darkGray: "#6b7280",
        black: "#1f2937",
        dark: "#090814",
      },
      // Cores de destaque que complementam a cor primária
      accent: {
        pink: "#ec4899",
        purple: "#8b5cf6",
        blue: "#3b82f6",
        green: "#10b981",
        orange: "#f59e0b",
        red: "#ef4444",
      },
    };
  }, [workspaceColor]);
}
