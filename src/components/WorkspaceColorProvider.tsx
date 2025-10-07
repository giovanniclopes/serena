import { useEffect } from "react";
import { useWorkspaceColor } from "../hooks/useWorkspaceColor";

export default function WorkspaceColorProvider() {
  const workspaceColor = useWorkspaceColor();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--workspace-color", workspaceColor);
  }, [workspaceColor]);

  return null;
}
