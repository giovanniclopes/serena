import { LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { state } = useApp();
  const { signOut, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={handleBackdropClick}
      />

      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          backgroundColor: state.currentTheme.colors.surface,
          borderColor: state.currentTheme.colors.border,
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-full"
                style={{
                  backgroundColor: state.currentTheme.colors.error + "20",
                }}
              >
                <LogOut
                  className="w-5 h-5"
                  style={{ color: state.currentTheme.colors.error }}
                />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: state.currentTheme.colors.text }}
              >
                Sair da conta
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Tem certeza que deseja sair da sua conta? Você precisará fazer login
            novamente para acessar seus dados.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: state.currentTheme.colors.surface,
                color: state.currentTheme.colors.text,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
              style={{
                backgroundColor: state.currentTheme.colors.error,
                color: "white",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saindo...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                  <span>Sair</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
