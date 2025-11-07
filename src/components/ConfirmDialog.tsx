import { AlertTriangle, X } from "lucide-react";
import { useApp } from "../context/AppContext";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  const { state } = useApp();

  if (!isOpen) return null;

  const getVariantColors = () => {
    switch (variant) {
      case "danger":
        return {
          button: state.currentTheme.colors.error,
          icon: state.currentTheme.colors.error,
        };
      case "warning":
        return {
          button: state.currentTheme.colors.warning,
          icon: state.currentTheme.colors.warning,
        };
      case "info":
        return {
          button: state.currentTheme.colors.primary,
          icon: state.currentTheme.colors.primary,
        };
      default:
        return {
          button: state.currentTheme.colors.error,
          icon: state.currentTheme.colors.error,
        };
    }
  };

  const colors = getVariantColors();
  const defaultIcon = <AlertTriangle className="w-6 h-6" style={{ color: colors.icon }} />;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 mt-1">
            {icon || defaultIcon}
          </div>
          <div className="flex-1">
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              {title}
            </h3>
            <p
              className="text-sm"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-opacity-10"
            style={{
              color: state.currentTheme.colors.textSecondary,
              backgroundColor: state.currentTheme.colors.textSecondary + "10",
            }}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              color: state.currentTheme.colors.text,
              border: `1px solid ${state.currentTheme.colors.border}`,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: colors.button,
              color: "white",
            }}
          >
            {isLoading ? "Processando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

