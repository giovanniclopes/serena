import { useApp } from "../context/AppContext";

export default function WorkspaceLoadingOverlay() {
  const { workspaceChanging, state } = useApp();

  if (!workspaceChanging) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center shadow-xl animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: state.currentTheme.colors.primary }}
        ></div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: state.currentTheme.colors.text }}
        >
          Alterando Workspace
        </h3>
        <p
          className="text-sm"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Carregando dados do workspace...
        </p>
      </div>
    </div>
  );
}
