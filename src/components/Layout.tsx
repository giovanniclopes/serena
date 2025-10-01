import { LogOut } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Navigation from "./Navigation";
import WorkspaceSelector from "./WorkspaceSelector";

export default function Layout() {
  const { state } = useApp();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: state.currentTheme.colors.background,
        color: state.currentTheme.colors.text,
      }}
    >
      <header
        className="border-b px-4 py-3"
        style={{ borderColor: state.currentTheme.colors.border }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center space-x-4">
            <h1
              className="text-2xl font-bold"
              style={{ color: state.currentTheme.colors.primary }}
            >
              Serena
            </h1>
            <WorkspaceSelector />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex pb-16">
        <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <Navigation />
    </div>
  );
}
