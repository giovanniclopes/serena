import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import BottomNavbar from "./BottomNavbar";
import LogoutModal from "./LogoutModal";
import PageTransition from "./PageTransition";
import SideMenu from "./SideMenu";
import TopNavbar from "./TopNavbar";
import WorkspaceLoadingOverlay from "./WorkspaceLoadingOverlay";

export default function Layout() {
  const { state } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/":
        return "Gerenciar suas tarefas";
      case "/tasks":
        return "Tarefas";
      case "/new-task":
        return "Nova Tarefa";
      case "/projects":
        return "Projetos";
      case "/habits":
        return "Hábitos";
      case "/calendar":
        return "Calendário";
      case "/countdowns":
        return "Contagem";
      case "/profile":
        return "Perfil";
      case "/notifications":
        return "Notificações";
      default:
        return null;
    }
  };

  const shouldShowBottomNav = ![
    "/login",
    "/register",
    "/email-verification",
  ].includes(location.pathname);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: state.currentTheme.colors.background,
        color: state.currentTheme.colors.text,
      }}
    >
      <TopNavbar
        title={getPageTitle() ?? undefined}
        showCancelDone={location.pathname === "/new-task"}
        onMenuClick={() => setShowMenu(!showMenu)}
        onCancel={() => navigate("/tasks")}
        onDone={() => {
        }}
      />

      <main
        className="flex-1 flex pt-16"
        style={{ paddingBottom: shouldShowBottomNav ? "80px" : "0" }}
      >
        <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>

      {shouldShowBottomNav && <BottomNavbar />}
      <SideMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />
      <WorkspaceLoadingOverlay />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
