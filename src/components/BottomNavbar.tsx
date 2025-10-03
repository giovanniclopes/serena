import { motion } from "framer-motion";
import { Calendar, Folder, Home, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import CentralActionButton from "./CentralActionButton";

interface BottomNavbarProps {
  onTaskClick: () => void;
  onHabitClick: () => void;
  onCountdownClick: () => void;
  onProjectClick: () => void;
}

export default function BottomNavbar({
  onTaskClick,
  onHabitClick,
  onCountdownClick,
  onProjectClick,
}: BottomNavbarProps) {
  const { state } = useApp();
  const { triggerHaptic } = useHapticFeedback();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/calendar", icon: Calendar, label: "Calendário" },
    { path: "/projects", icon: Folder, label: "Projetos" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 px-4 py-3 z-40"
      style={{
        backgroundColor: state.currentTheme.colors.background,
        borderTop: `1px solid ${state.currentTheme.colors.border}`,
      }}
    >
      <div className="flex justify-around items-center">
        {navItems.slice(0, 2).map(({ path, icon: Icon }, index) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.3,
              type: "spring",
              damping: 20,
            }}
          >
            <NavLink
              to={path}
              className="flex flex-col items-center justify-center transition-all duration-200 w-10 h-10"
            >
              {({ isActive }) => (
                <motion.div
                  className={`
                    flex items-center justify-center rounded-full transition-all duration-200 w-10 h-10
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${isActive ? "bg-gray-100 dark:bg-gray-700" : ""}
                  `}
                  style={{
                    color: isActive
                      ? state.currentTheme.colors.primary
                      : state.currentTheme.colors.textSecondary,
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 0.9,
                    transition: { duration: 0.1 },
                  }}
                  onTap={() => triggerHaptic("light")}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              )}
            </NavLink>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.3,
            type: "spring",
            damping: 20,
          }}
        >
          <CentralActionButton
            onTaskClick={onTaskClick}
            onHabitClick={onHabitClick}
            onCountdownClick={onCountdownClick}
            onProjectClick={onProjectClick}
          />
        </motion.div>

        {navItems.slice(2).map(({ path, icon: Icon }, index) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: (index + 3) * 0.1,
              duration: 0.3,
              type: "spring",
              damping: 20,
            }}
          >
            <NavLink
              to={path}
              className="flex flex-col items-center justify-center transition-all duration-200 w-10 h-10"
            >
              {({ isActive }) => (
                <motion.div
                  className={`
                    flex items-center justify-center rounded-full transition-all duration-200 w-10 h-10
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${isActive ? "bg-gray-100 dark:bg-gray-700" : ""}
                  `}
                  style={{
                    color: isActive
                      ? state.currentTheme.colors.primary
                      : state.currentTheme.colors.textSecondary,
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{
                    scale: 0.9,
                    transition: { duration: 0.1 },
                  }}
                  onTap={() => triggerHaptic("light")}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              )}
            </NavLink>
          </motion.div>
        ))}
      </div>
    </nav>
  );
}
