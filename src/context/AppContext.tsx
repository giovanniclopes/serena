import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { availableThemes, defaultTheme } from "../constants/themes";
import { useAppStorage } from "../hooks/useLocalStorage";
import { getCountdowns } from "../services/apiCountdowns";
import { getHabitEntries, getHabits } from "../services/apiHabits";
import { getProjects } from "../services/apiProjects";
import { getTasks } from "../services/apiTasks";
import { getWorkspaces } from "../services/apiWorkspaces";
import type {
  AppState,
  Countdown,
  Filter,
  Habit,
  HabitEntry,
  Project,
  Tag,
  Task,
  Theme,
  Workspace,
} from "../types";
import { generateThemeFromWorkspaceColor } from "../utils/colorUtils";
import { useAuth } from "./AuthContext";

interface LoadDataPayload {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  projects: Project[];
  tasks: Task[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  countdowns: Countdown[];
  tags: Tag[];
  filters: Filter[];
  currentTheme: Theme;
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loading: boolean;
  error: string | null;
  workspaceChanging: boolean;
}

type AppAction =
  | { type: "LOAD_DATA"; payload: LoadDataPayload }
  | {
      type: "LOAD_SECONDARY_DATA";
      payload: {
        projects: Project[];
        habits: Habit[];
        habitEntries: HabitEntry[];
        countdowns: Countdown[];
      };
    }
  | { type: "SET_ACTIVE_WORKSPACE"; payload: string }
  | { type: "ADD_WORKSPACE"; payload: Workspace }
  | { type: "UPDATE_WORKSPACE"; payload: Workspace }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "COMPLETE_TASK"; payload: string }
  | { type: "ADD_HABIT"; payload: Habit }
  | { type: "UPDATE_HABIT"; payload: Habit }
  | { type: "DELETE_HABIT"; payload: string }
  | { type: "ADD_HABIT_ENTRY"; payload: HabitEntry }
  | { type: "UPDATE_HABIT_ENTRY"; payload: HabitEntry }
  | { type: "ADD_COUNTDOWN"; payload: Countdown }
  | { type: "UPDATE_COUNTDOWN"; payload: Countdown }
  | { type: "DELETE_COUNTDOWN"; payload: string }
  | { type: "ADD_TAG"; payload: Tag }
  | { type: "UPDATE_TAG"; payload: Tag }
  | { type: "DELETE_TAG"; payload: string }
  | { type: "ADD_FILTER"; payload: Filter }
  | { type: "UPDATE_FILTER"; payload: Filter }
  | { type: "DELETE_FILTER"; payload: string }
  | { type: "SET_THEME"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_WORKSPACE_CHANGING"; payload: boolean }
  | { type: "LOAD_DATA"; payload: Partial<AppState> };

const getInitialState = (): AppState => {
  return {
    workspaces: [],
    activeWorkspaceId: "",
    projects: [],
    tasks: [],
    habits: [],
    habitEntries: [],
    countdowns: [],
    tags: [],
    filters: [],
    currentTheme: defaultTheme,
    availableThemes,
    workspaceChanging: false,
  };
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOAD_DATA":
      return {
        ...state,
        ...action.payload,
      };

    case "LOAD_SECONDARY_DATA":
      return {
        ...state,
        projects: action.payload.projects,
        habits: action.payload.habits,
        habitEntries: action.payload.habitEntries,
        countdowns: action.payload.countdowns,
      };

    case "SET_ACTIVE_WORKSPACE":
      return { ...state, activeWorkspaceId: action.payload };

    case "ADD_WORKSPACE":
      return { ...state, workspaces: [...state.workspaces, action.payload] };

    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) =>
          w.id === action.payload.id ? action.payload : w
        ),
      };

    case "DELETE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.filter((w) => w.id !== action.payload),
        activeWorkspaceId:
          state.activeWorkspaceId === action.payload
            ? state.workspaces.find((w) => w.id !== action.payload)?.id ||
              state.workspaces[0].id
            : state.activeWorkspaceId,
      };

    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] };

    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        tasks: state.tasks.filter((t) => t.projectId !== action.payload),
      };

    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };

    case "COMPLETE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload
            ? { ...t, isCompleted: true, completedAt: new Date() }
            : t
        ),
      };

    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, action.payload] };

    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload.id ? action.payload : h
        ),
      };

    case "DELETE_HABIT":
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.payload),
        habitEntries: state.habitEntries.filter(
          (he) => he.habitId !== action.payload
        ),
      };

    case "ADD_HABIT_ENTRY":
      return {
        ...state,
        habitEntries: [...state.habitEntries, action.payload],
      };

    case "UPDATE_HABIT_ENTRY":
      return {
        ...state,
        habitEntries: state.habitEntries.map((he) =>
          he.id === action.payload.id ? action.payload : he
        ),
      };

    case "ADD_COUNTDOWN":
      return { ...state, countdowns: [...state.countdowns, action.payload] };

    case "UPDATE_COUNTDOWN":
      return {
        ...state,
        countdowns: state.countdowns.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case "DELETE_COUNTDOWN":
      return {
        ...state,
        countdowns: state.countdowns.filter((c) => c.id !== action.payload),
      };

    case "ADD_TAG":
      return { ...state, tags: [...state.tags, action.payload] };

    case "UPDATE_TAG":
      return {
        ...state,
        tags: state.tags.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case "DELETE_TAG":
      return {
        ...state,
        tags: state.tags.filter((t) => t.id !== action.payload),
        tasks: state.tasks.map((t) => ({
          ...t,
          tags: t.tags.filter((tagId) => tagId !== action.payload),
        })),
      };

    case "ADD_FILTER":
      return { ...state, filters: [...state.filters, action.payload] };

    case "UPDATE_FILTER":
      return {
        ...state,
        filters: state.filters.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
      };

    case "DELETE_FILTER":
      return {
        ...state,
        filters: state.filters.filter((f) => f.id !== action.payload),
      };
    case "SET_THEME": {
      const theme = state.availableThemes.find((t) => t.id === action.payload);
      return theme ? { ...state, currentTheme: theme } : state;
    }

    case "SET_WORKSPACE_CHANGING":
      return { ...state, workspaceChanging: action.payload };

    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { appData, setAppData } = useAppStorage();
  const { user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(appReducer, getInitialState());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  const workspaceTheme = useMemo(() => {
    const activeWorkspace = state.workspaces.find(
      (w) => w.id === state.activeWorkspaceId
    );

    if (!activeWorkspace || !activeWorkspace.color) {
      return state.currentTheme;
    }

    return generateThemeFromWorkspaceColor(
      activeWorkspace.color,
      activeWorkspace.name,
      activeWorkspace.id
    );
  }, [state.workspaces, state.activeWorkspaceId, state.currentTheme]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      dispatch({
        type: "LOAD_DATA",
        payload: {
          workspaces: [],
          activeWorkspaceId: "",
          projects: [],
          tasks: [],
          habits: [],
          habitEntries: [],
          countdowns: [],
          tags: [],
          filters: [],
          currentTheme: defaultTheme,
        },
      });
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [workspaces, tasks] = await Promise.all([
          getWorkspaces(),
          getTasks(),
        ]);

        let finalWorkspaces = workspaces;
        let activeWorkspaceId =
          appData?.activeWorkspaceId || workspaces[0]?.id || "";

        if (workspaces.length === 0) {
          const defaultWorkspace = {
            id: "default-workspace",
            name: "Pessoal",
            description: "Seu espaço pessoal",
            color: "#ec4899",
            icon: "home",
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          finalWorkspaces = [defaultWorkspace];
          activeWorkspaceId = defaultWorkspace.id;
        }

        dispatch({
          type: "LOAD_DATA",
          payload: {
            workspaces: finalWorkspaces,
            activeWorkspaceId,
            projects: [],
            tasks,
            habits: [],
            habitEntries: [],
            countdowns: [],
            tags: [],
            filters: [],
            currentTheme: appData?.currentThemeId
              ? availableThemes.find((t) => t.id === appData.currentThemeId) ||
                defaultTheme
              : defaultTheme,
          },
        });

        const [projects, habits, habitEntries, countdowns] = await Promise.all([
          getProjects(),
          getHabits(),
          getHabitEntries(),
          getCountdowns(),
        ]);

        dispatch({
          type: "LOAD_SECONDARY_DATA",
          payload: {
            projects,
            habits,
            habitEntries,
            countdowns,
          },
        });
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, appData?.activeWorkspaceId, appData.currentThemeId]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const dataToStore = {
      activeWorkspaceId: state.activeWorkspaceId,
      currentThemeId: state.currentTheme.id,
    };
    setAppData(dataToStore);
  }, [state.activeWorkspaceId, state.currentTheme.id, setAppData]);

  const contextValue = {
    state: {
      ...state,
      currentTheme: workspaceTheme,
    },
    dispatch,
    loading,
    error,
    workspaceChanging: state.workspaceChanging,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
