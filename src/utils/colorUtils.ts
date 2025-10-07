export function adjustColorBrightness(color: string, factor: number): string {
  // Validar entrada
  if (!color || typeof color !== "string") {
    return "#ec4899"; // cor padrão
  }

  const hex = color.replace("#", "");

  // Validar se é um hex válido
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return "#ec4899"; // cor padrão
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Validar se os valores são válidos
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return "#ec4899"; // cor padrão
  }

  const newR = Math.max(0, Math.min(255, Math.round(r * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(g * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(b * factor)));

  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

export function generateThemeFromWorkspaceColor(
  primaryColor: string,
  workspaceName: string,
  workspaceId: string
) {
  // Validar entrada
  if (!primaryColor || !workspaceName || !workspaceId) {
    return {
      id: "default-theme",
      name: "Tema Padrão",
      colors: {
        primary: "#ec4899",
        secondary: "#f472b6",
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
