import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Folder,
  Home,
  List,
  LogOut,
  // Settings,
  Target,
  User,
  Wifi,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../features/profile/useProfile";
import { useOfflineMode } from "../hooks/useOfflineMode";
import LogoutModal from "./LogoutModal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onShowOfflineStatus?: () => void;
}

export default function SideMenu({
  isOpen,
  onClose,
  onShowOfflineStatus,
}: SideMenuProps) {
  const { state } = useApp();
  const { user } = useAuth();
  const { pendingActions } = useOfflineMode();
  const { profile } = useProfile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/tasks", icon: List, label: "Tarefas" },
    { path: "/projects", icon: Folder, label: "Projetos" },
    { path: "/habits", icon: Target, label: "Hábitos" },
    { path: "/calendar", icon: Calendar, label: "Calendário" },
    { path: "/countdowns", icon: Clock, label: "Contagem" },
    { path: "/profile", icon: User, label: "Perfil" },
    // { path: "/notifications", icon: Settings, label: "Notificações" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="absolute left-0 top-0 bottom-0 w-80 shadow-2xl flex flex-col"
              style={{
                backgroundColor: state.currentTheme.colors.background,
              }}
              onClick={(e) => e.stopPropagation()}
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                duration: 0.3,
              }}
            >
              <div className="flex items-center justify-between mb-2 md:mb-6 p-6 py-2 pb-0">
                <h2
                  className="text-xl font-bold"
                  style={{ color: state.currentTheme.colors.primary }}
                >
                  Serena
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 px-6">
                <motion.div
                  className="mb-1 md:mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                ></motion.div>

                <div className="mb-8">
                  <div
                    className="flex items-center space-x-3 p-3 rounded-xl"
                    style={{
                      backgroundColor: state.currentTheme.colors.primary + "10",
                      border: `1px solid ${state.currentTheme.colors.primary}20`,
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile?.avatarUrl} alt="Avatar" />
                      <AvatarFallback
                        className="text-white"
                        style={{
                          backgroundColor: state.currentTheme.colors.primary,
                        }}
                      >
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
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
                        style={{
                          color: state.currentTheme.colors.textSecondary,
                        }}
                      >
                        {(user as unknown as { email: string })?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                <nav className="space-y-2">
                  {menuItems.map(({ path, icon: Icon, label }, index) => (
                    <motion.div
                      key={path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                      }}
                    >
                      <NavLink
                        to={path}
                        onClick={onClose}
                        className={({ isActive }) => `
                      flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }
                    `}
                        style={({ isActive }) => ({
                          color: isActive
                            ? state.currentTheme.colors.primary
                            : state.currentTheme.colors.text,
                        })}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{label}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>
              </div>

              <div
                className="px-6 py-2 md:pb-6 pt-4 border-t space-y-2"
                style={{ borderColor: state.currentTheme.colors.border }}
              >
                {onShowOfflineStatus && (
                  <button
                    onClick={() => {
                      onShowOfflineStatus();
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    <div className="flex items-center space-x-3">
                      <Wifi className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Status Offline
                      </span>
                    </div>
                    {pendingActions.length > 0 && (
                      <span
                        className="px-2 py-1 text-xs rounded-full font-semibold"
                        style={{
                          backgroundColor:
                            state.currentTheme.colors.warning + "20",
                          color: state.currentTheme.colors.warning,
                        }}
                      >
                        {pendingActions.length}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                  style={{ color: state.currentTheme.colors.error }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Sair da conta</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
}
