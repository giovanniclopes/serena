import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { availableThemes, defaultTheme } from "../constants/themes";
import {
  sampleCountdowns,
  sampleHabits,
  sampleProjects,
  sampleTags,
  sampleTasks,
  sampleWorkspaces,
} from "../data/sampleData";
import { useAppStorage } from "../hooks/useLocalStorage";
import type {
  AppState,
  Countdown,
  Filter,
  Habit,
  HabitEntry,
  Project,
  Tag,
  Task,
  Workspace,
} from "../types";

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

type AppAction =
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
  | { type: "SET_THEME"; payload: string };

const getInitialState = (appData: any): AppState => {
  if (!appData || !appData.workspaces || !appData.workspaces.length) {
    return {
      workspaces: sampleWorkspaces,
      activeWorkspaceId: "default-workspace",
      projects: sampleProjects,
      tasks: sampleTasks,
      habits: sampleHabits,
      habitEntries: [],
      countdowns: sampleCountdowns,
      tags: sampleTags,
      filters: [],
      currentTheme: defaultTheme,
      availableThemes,
    };
  }

  const currentTheme =
    availableThemes.find((t) => t.id === appData.currentThemeId) ||
    defaultTheme;

  return {
    workspaces: appData.workspaces.map((w: any) => ({
      ...w,
      createdAt: new Date(w.createdAt),
      updatedAt: new Date(w.updatedAt),
    })),
    activeWorkspaceId: appData.activeWorkspaceId || "default-workspace",
    projects: appData.projects.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    })),
    tasks: appData.tasks.map((t: any) => ({
      ...t,
      dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
      completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      subtasks: t.subtasks.map((st: any) => ({
        ...st,
        dueDate: st.dueDate ? new Date(st.dueDate) : undefined,
        completedAt: st.completedAt ? new Date(st.completedAt) : undefined,
        createdAt: new Date(st.createdAt),
        updatedAt: new Date(st.updatedAt),
      })),
    })),
    habits: appData.habits.map((h: any) => ({
      ...h,
      createdAt: new Date(h.createdAt),
      updatedAt: new Date(h.updatedAt),
    })),
    habitEntries: appData.habitEntries.map((he: any) => ({
      ...he,
      date: new Date(he.date),
    })),
    countdowns: appData.countdowns.map((c: any) => ({
      ...c,
      targetDate: new Date(c.targetDate),
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    })),
    tags: appData.tags,
    filters: appData.filters.map((f: any) => ({
      ...f,
      dateRange: f.dateRange
        ? {
            start: new Date(f.dateRange.start),
            end: new Date(f.dateRange.end),
          }
        : undefined,
    })),
    currentTheme,
    availableThemes,
  };
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
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

    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { appData, setAppData } = useAppStorage();
  const [state, dispatch] = useReducer(appReducer, getInitialState(appData));
  const isInitialMount = useRef(true);

  // Persist state changes to localStorage (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const dataToStore = {
      workspaces: state.workspaces,
      activeWorkspaceId: state.activeWorkspaceId,
      projects: state.projects,
      tasks: state.tasks,
      habits: state.habits,
      habitEntries: state.habitEntries,
      countdowns: state.countdowns,
      tags: state.tags,
      filters: state.filters,
      currentThemeId: state.currentTheme.id,
    };
    setAppData(dataToStore);
  }, [state, setAppData]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
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
