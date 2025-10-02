import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import LogoutModal from "./LogoutModal";
import Navigation from "./Navigation";
import WorkspaceLoadingOverlay from "./WorkspaceLoadingOverlay";
import WorkspaceSelector from "./WorkspaceSelector";

export default function Layout() {
  const { state } = useApp();
  const { user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
          <div className="flex items-center space-x-3">
            {/* Avatar do usuário */}
            <div
              className="flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "10",
                border: `1px solid ${state.currentTheme.colors.primary}20`,
              }}
              onClick={() => setShowLogoutModal(true)}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: state.currentTheme.colors.primary,
                }}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p
                  className="text-sm font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {(user as unknown as { email: string })?.email?.split(
                    "@"
                  )[0] || "Usuário"}
                </p>
                <p
                  className="text-xs"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Sair da conta
                </p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-2.5 rounded-xl transition-all duration-200"
                style={{
                  color: state.currentTheme.colors.error,
                }}
                title="Sair da conta"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex pb-16">
        <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <Navigation />
      <WorkspaceLoadingOverlay />

      {/* Modal de confirmação de logout */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
