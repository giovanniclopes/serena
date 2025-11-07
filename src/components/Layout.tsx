import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useCreateCountdown } from "../features/countdowns/useCountdowns";
import { useCreateHabit } from "../features/habits/useHabits";
import { useCreateProject } from "../features/projects/useProjects";
import { useCreateTask } from "../features/tasks/useTasks";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useOfflineOperations } from "../hooks/useOfflineOperations";
import type { Countdown, Habit, Project, Task } from "../types";
import BottomNavbar from "./BottomNavbar";
import CountdownModal from "./CountdownModal";
import GlobalSearch from "./GlobalSearch";
import HabitModal from "./HabitModal";
import LogoutModal from "./LogoutModal";
import OfflineIndicator from "./OfflineIndicator";
import OfflineStatusModal from "./OfflineStatusModal";
import PageTitle from "./PageTitle";
import PageTransition from "./PageTransition";
import ProjectModal from "./ProjectModal";
import SideMenu from "./SideMenu";
import TaskModal from "./TaskModal";
import TopNavbar from "./TopNavbar";
import WorkspaceColorProvider from "./WorkspaceColorProvider";
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
  "A persistência vence a resistência",
  "Sonhe grande, comece pequeno",
  "A excelência é um hábito, não um acidente",
  "Sua mente é seu maior ativo",
  "Ação gera motivação",
  "O impossível só existe até ser feito",
  "Cada dia é uma nova chance",
  "Você é o autor da sua história",
  "A consistência supera a intensidade",
  "Pequenos passos, grandes mudanças",
  "Sua determinação define seu destino",
  "O sucesso é a soma de pequenos esforços",
  "Acredite em si mesmo primeiro",
  "Transforme obstáculos em degraus",
  "A disciplina liberta",
  "Seu futuro começa agora",
  "A coragem é contagiante",
  "Pare de esperar, comece a agir",
  "Você tem o poder de mudar",
  "A gratidão multiplica a felicidade",
  "Seja a mudança que deseja ver",
  "O tempo é seu maior investimento",
  "A paixão move montanhas",
  "Cada escolha importa",
  "Sua energia atrai sua realidade",
  "O fracasso é apenas feedback",
  "Aprenda, cresça, evolua",
  "Seu potencial é ilimitado",
  "A simplicidade é sofisticada",
  "Foque no que você controla",
  "A paciência é uma virtude ativa",
  "Você é único, seja autêntico",
  "A humildade abre portas",
  "Celebre cada pequena vitória",
  "A mente sã, corpo são",
  "O equilíbrio é a chave",
  "Sua jornada é sua força",
  "Aprenda com cada experiência",
  "O presente é um presente",
  "Seja grato, seja feliz",
  "A bondade é poderosa",
  "Você é suficiente",
];

export default function Layout() {
  const { state } = useApp();
  const { triggerHaptic } = useHapticFeedback();
  const {
    createTaskOffline,
    createHabitOffline,
    createCountdownOffline,
    createProjectOffline,
  } = useOfflineOperations();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showOfflineStatus, setShowOfflineStatus] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const createTaskMutation = useCreateTask();
  const createHabitMutation = useCreateHabit();
  const createCountdownMutation = useCreateCountdown();
  const createProjectMutation = useCreateProject();

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
        return "";
      case "/new-task":
        return "Nova Tarefa";
      case "/projects":
        return "";
      case "/habits":
        return "";
      case "/calendar":
        return "";
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

  const hasOpenModal =
    isTaskModalOpen ||
    isHabitModalOpen ||
    isCountdownModalOpen ||
    isProjectModalOpen ||
    showLogoutModal ||
    showOfflineStatus ||
    showMenu;

  const closeAllModals = () => {
    setIsTaskModalOpen(false);
    setIsHabitModalOpen(false);
    setIsCountdownModalOpen(false);
    setIsProjectModalOpen(false);
    setShowLogoutModal(false);
    setShowOfflineStatus(false);
    setShowMenu(false);
    setShowGlobalSearch(false);
  };

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "Escape",
        action: () => {
          if (hasOpenModal) {
            closeAllModals();
          }
        },
        description: "Fechar modais",
      },
      {
        key: "k",
        ctrlKey: true,
        action: () => {
          setShowGlobalSearch(true);
        },
        description: "Busca global",
      },
      {
        key: "n",
        ctrlKey: true,
        action: () => {
          if (
            !hasOpenModal &&
            !["/login", "/register", "/email-verification"].includes(
              location.pathname
            )
          ) {
            handleTaskClick();
          }
        },
        description: "Nova tarefa",
      },
    ],
    enabled: shouldShowBottomNav,
  });

  const handleTaskClick = () => {
    triggerHaptic("medium");
    setIsTaskModalOpen(true);
  };

  const handleHabitClick = () => {
    triggerHaptic("medium");
    setIsHabitModalOpen(true);
  };

  const handleCountdownClick = () => {
    triggerHaptic("medium");
    setIsCountdownModalOpen(true);
  };

  const handleProjectClick = () => {
    triggerHaptic("medium");
    setIsProjectModalOpen(true);
  };

  const handleSaveTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> => {
    const offlineResult = createTaskOffline({
      ...taskData,
      workspaceId: state.activeWorkspaceId,
    });

    if (offlineResult.shouldExecute) {
      return new Promise((resolve, reject) => {
        createTaskMutation.mutate(
          {
            ...taskData,
            workspaceId: state.activeWorkspaceId,
          },
          {
            onSuccess: (data) => {
              setIsTaskModalOpen(false);
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    } else {
      setIsTaskModalOpen(false);
      return {
        ...taskData,
        id: `offline-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task;
    }
  };

  const handleSaveHabit = (
    habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">
  ) => {
    const offlineResult = createHabitOffline({
      ...habitData,
      workspaceId: state.activeWorkspaceId,
    });

    if (offlineResult.shouldExecute) {
      createHabitMutation.mutate(
        {
          ...habitData,
          workspaceId: state.activeWorkspaceId,
        },
        {
          onSuccess: () => {
            setIsHabitModalOpen(false);
          },
        }
      );
    } else {
      setIsHabitModalOpen(false);
    }
  };

  const handleSaveCountdown = (
    countdownData: Omit<Countdown, "id" | "createdAt" | "updatedAt">
  ) => {
    const offlineResult = createCountdownOffline({
      ...countdownData,
      workspaceId: state.activeWorkspaceId,
    });

    if (offlineResult.shouldExecute) {
      createCountdownMutation.mutate(
        {
          ...countdownData,
          workspaceId: state.activeWorkspaceId,
        },
        {
          onSuccess: () => {
            setIsCountdownModalOpen(false);
          },
        }
      );
    } else {
      setIsCountdownModalOpen(false);
    }
  };

  const handleSaveProject = (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    const offlineResult = createProjectOffline({
      ...projectData,
      workspaceId: state.activeWorkspaceId,
    });

    if (offlineResult.shouldExecute) {
      createProjectMutation.mutate(
        {
          project: {
            ...projectData,
            workspaceId: state.activeWorkspaceId,
          },
        },
        {
          onSuccess: () => {
            setIsProjectModalOpen(false);
          },
        }
      );
    } else {
      setIsProjectModalOpen(false);
    }
  };

  return (
    <>
      <PageTitle />
      <OfflineIndicator />
      <WorkspaceColorProvider />
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
          <div
            className="flex-1 max-w-7xl mx-auto w-full"
            style={{
              padding: "1rem",
              paddingTop: "1rem",
              paddingBottom: "1rem",
            }}
          >
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>

        {shouldShowBottomNav && (
          <BottomNavbar
            onTaskClick={handleTaskClick}
            onHabitClick={handleHabitClick}
            onCountdownClick={handleCountdownClick}
            onProjectClick={handleProjectClick}
          />
        )}
        <SideMenu
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onShowOfflineStatus={() => setShowOfflineStatus(true)}
        />
        <WorkspaceLoadingOverlay />

        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
        />

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
        />

        <HabitModal
          isOpen={isHabitModalOpen}
          onClose={() => setIsHabitModalOpen(false)}
          onSave={handleSaveHabit}
        />

        <CountdownModal
          isOpen={isCountdownModalOpen}
          onClose={() => setIsCountdownModalOpen(false)}
          onSave={handleSaveCountdown}
        />

        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
          workspaceId={state.activeWorkspaceId}
        />

        <OfflineStatusModal
          isOpen={showOfflineStatus}
          onClose={() => setShowOfflineStatus(false)}
        />

        <GlobalSearch
          isOpen={showGlobalSearch}
          onClose={() => setShowGlobalSearch(false)}
        />
      </div>
    </>
  );
}
