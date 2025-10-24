import {
  Calendar,
  Clock,
  Folder,
  Home,
  List,
  MoreHorizontal,
  ShoppingCart,
  Target,
  User,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { adjustColorBrightness } from "../utils/colorUtils";

export default function Navigation() {
  const { state } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/calendar", icon: Calendar, label: "Calendário" },
    { path: "/tasks", icon: List, label: "Tarefas" },
    { path: "/habits", icon: Target, label: "Hábitos" },
  ];

  const moreNavItems = [
    { path: "/projects", icon: Folder, label: "Projetos" },
    { path: "/shopping-lists", icon: ShoppingCart, label: "Compras" },
    { path: "/countdowns", icon: Clock, label: "Contagem" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-lg z-40">
        <div className="flex justify-around">
          {mainNavItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
                flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200
                ${isActive ? "" : "hover:bg-gray-50"}
              `}
              style={({ isActive }) => ({
                color: isActive ? state.currentTheme.colors.primary : "#6B7280",
                backgroundColor: isActive
                  ? adjustColorBrightness(
                      state.currentTheme.colors.primary,
                      0.1
                    )
                  : undefined,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isActive
                        ? state.currentTheme.colors.primary
                        : undefined,
                    }}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50"
            style={{ color: "#6B7280" }}
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">Mais</span>
          </button>
        </div>
      </nav>

      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowMoreMenu(false)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-25" />

          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 px-2">
                Mais opções
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {moreNavItems.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
