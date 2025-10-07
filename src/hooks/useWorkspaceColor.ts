import { useApp } from "../context/AppContext";

export function useWorkspaceColor() {
  const { state } = useApp();

  const activeWorkspace = state.workspaces.find(
    (w) => w.id === state.activeWorkspaceId
  );

  return activeWorkspace?.color || state.currentTheme.colors.primary;
}
