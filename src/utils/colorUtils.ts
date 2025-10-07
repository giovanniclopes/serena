export function adjustColorBrightness(color: string, factor: number): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

export function generateThemeFromWorkspaceColor(
  primaryColor: string,
  workspaceName: string,
  workspaceId: string
) {
  return {
    id: `workspace-${workspaceId}`,
    name: `Tema ${workspaceName}`,
    colors: {
      primary: primaryColor,
      secondary: adjustColorBrightness(primaryColor, 0.95),
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
}
