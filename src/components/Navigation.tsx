import {
  Calendar,
  Clock,
  Folder,
  Home,
  List,
  Target,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Navigation() {
  const { state } = useApp();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/calendar", icon: Calendar, label: "Calendário" },
    { path: "/tasks", icon: List, label: "Tarefas" },
    { path: "/projects", icon: Folder, label: "Projetos" },
    { path: "/habits", icon: Target, label: "Hábitos" },
    { path: "/countdowns", icon: Clock, label: "Contagem" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t px-4 py-2"
      style={{
        backgroundColor: state.currentTheme.colors.surface,
        borderColor: state.currentTheme.colors.border,
      }}
    >
      <div className="flex justify-around">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors
              ${isActive ? "text-opacity-100" : "text-opacity-60"}
            `}
            style={({ isActive }) => ({
              color: isActive
                ? state.currentTheme.colors.primary
                : state.currentTheme.colors.textSecondary,
            })}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
