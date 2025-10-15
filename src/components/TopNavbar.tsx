import { motion } from "framer-motion";
import { ArrowLeft, Edit, Menu, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import WorkspaceSelector from "./WorkspaceSelector";

interface TopNavbarProps {
  title?: string;
  showBackButton?: boolean;
  showShareButton?: boolean;
  showEditButton?: boolean;
  showCancelDone?: boolean;
  onCancel?: () => void;
  onDone?: () => void;
  onBack?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onMenuClick?: () => void;
}

export default function TopNavbar({
  title,
  showBackButton = false,
  showShareButton = false,
  showEditButton = false,
  showCancelDone = false,
  onCancel,
  onDone,
  onBack,
  onShare,
  onEdit,
  onMenuClick,
}: TopNavbarProps) {
  const { state } = useApp();
  const navigate = useNavigate();

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      style={{
        backgroundColor: state.currentTheme.colors.background,
        borderBottom: `1px solid ${state.currentTheme.colors.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton ? (
            <motion.button
              onClick={handleBack}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ color: state.currentTheme.colors.text }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          ) : showCancelDone ? (
            <motion.button
              onClick={onCancel}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: state.currentTheme.colors.primary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Cancelar
            </motion.button>
          ) : (
            <motion.button
              onClick={handleMenuClick}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ color: state.currentTheme.colors.text }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        <div className="flex-1 flex justify-center">
          {title ? (
            <motion.h1
              className="text-xs font-light italic text-center max-w-[280px] px-2"
              style={{ color: state.currentTheme.colors.text }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h1>
          ) : (
            <motion.span
              className="text-sm font-medium"
              style={{ color: state.currentTheme.colors.text }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold tracking-wide">
                  {getCurrentTime()}
                </span>
                <span className="text-xs font-light opacity-75 capitalize">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
            </motion.span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {showCancelDone ? (
            <motion.button
              onClick={onDone}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: state.currentTheme.colors.primary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Concluído
            </motion.button>
          ) : (
            <>
              {showShareButton && (
                <motion.button
                  onClick={onShare}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ color: state.currentTheme.colors.text }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Share className="w-5 h-5" />
                </motion.button>
              )}
              {showEditButton && (
                <motion.button
                  onClick={onEdit}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ color: state.currentTheme.colors.text }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Edit className="w-5 h-5" />
                </motion.button>
              )}
              {/* <div className="flex items-center space-x-2">
                <div
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: state.currentTheme.colors.primary + "10",
                    color: state.currentTheme.colors.primary,
                  }}
                >
                  {state.workspaces.find(
                    (w) => w.id === state.activeWorkspaceId
                  )?.name || "Pessoal"}
                </div>
              </div> */}
              <WorkspaceSelector />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
