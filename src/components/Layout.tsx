import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import BottomNavbar from "./BottomNavbar";
import LogoutModal from "./LogoutModal";
import PageTransition from "./PageTransition";
import SideMenu from "./SideMenu";
import TopNavbar from "./TopNavbar";
import WorkspaceLoadingOverlay from "./WorkspaceLoadingOverlay";

const motivationalMessages = [
  "Cada tarefa é um passo rumo aos seus sonhos",
  "Transforme hoje em algo extraordinário",
  "Disciplina é a ponte para conquistas",
  "Sua dedicação de hoje é o sucesso de amanhã",
  "Foque no progresso, não na perfeição",
  "Cada ação te aproxima dos objetivos",
  "Transforme desafios em oportunidades",
  "Você é mais forte do que imagina",
];

export default function Layout() {
  const { state } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const motivationalMessage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return `"${motivationalMessages[randomIndex]}"`;
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/":
        return motivationalMessage;
      case "/tasks":
        return "Tarefas";
      case "/new-task":
        return "Nova Tarefa";
      case "/projects":
        return "";
      case "/habits":
        return "Háitos";
      case "/calendar":
        return "Calndário";
      case "/countdowns":
        return "";
      case "/profile":
        return "";
      case "/notifications":
        return "";
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
        onDone={() => {}}
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
