import { motion } from "framer-motion";
import { Bell, Folder, Home, Plus, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function BottomNavbar() {
  const { state } = useApp();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/projects", icon: Folder, label: "Projetos" },
    { path: "/new-task", icon: Plus, label: "Nova Tarefa", isCentral: true },
    { path: "/notifications", icon: Bell, label: "Notificações" },
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
        {navItems.map(({ path, icon: Icon, isCentral }, index) => (
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
              className={`
                flex flex-col items-center justify-center transition-all duration-200
                ${isCentral ? "w-12 h-12" : "w-10 h-10"}
              `}
            >
              {({ isActive }) => (
                <motion.div
                  className={`
                    flex items-center justify-center rounded-full transition-all duration-200
                    ${
                      isCentral
                        ? "w-12 h-12 bg-white shadow-lg"
                        : "w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                    ${
                      isActive && !isCentral
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }
                  `}
                  style={{
                    color: isCentral
                      ? "#000000"
                      : isActive
                      ? state.currentTheme.colors.primary
                      : state.currentTheme.colors.textSecondary,
                  }}
                  whileHover={{
                    scale: isCentral ? 1.05 : 1.1,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{
                    scale: isCentral ? 0.95 : 0.9,
                    transition: { duration: 0.1 },
                  }}
                >
                  <Icon className={`${isCentral ? "w-6 h-6" : "w-5 h-5"}`} />
                </motion.div>
              )}
            </NavLink>
          </motion.div>
        ))}
      </div>
    </nav>
  );
}
