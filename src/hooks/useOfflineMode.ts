import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface OfflineAction {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  entity: "task" | "project" | "habit" | "countdown";
  data: unknown;
  timestamp: number;
  retryCount: number;
}

interface OfflineState {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingActions: OfflineAction[];
  lastSyncTime: number | null;
  syncInProgress: boolean;
}

const OFFLINE_STORAGE_KEY = "serena_offline_data";
const PENDING_ACTIONS_KEY = "serena_pending_actions";
const LAST_SYNC_KEY = "serena_last_sync";

export function useOfflineMode() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOfflineMode: false,
    pendingActions: [],
    lastSyncTime: null,
    syncInProgress: false,
  });
  const syncInProgressRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true, isOfflineMode: false }));
      toast.success("Conexão restaurada! Sincronizando dados...", {
        duration: 3000,
      });
      syncPendingActions();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false, isOfflineMode: true }));
      toast.warning(
        "Modo offline ativado. Suas alterações serão sincronizadas quando a conexão for restaurada.",
        {
          duration: 5000,
        }
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    loadOfflineState();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadOfflineState = useCallback(() => {
    try {
      const pendingActions = JSON.parse(
        localStorage.getItem(PENDING_ACTIONS_KEY) || "[]"
      );
      const lastSyncTime = localStorage.getItem(LAST_SYNC_KEY);

      setState((prev) => ({
        ...prev,
        pendingActions,
        lastSyncTime: lastSyncTime ? parseInt(lastSyncTime) : null,
      }));
    } catch (error) {
      console.error("Erro ao carregar estado offline:", error);
    }
  }, []);

  const saveOfflineState = useCallback(
    (pendingActions: OfflineAction[], lastSyncTime?: number) => {
      try {
        localStorage.setItem(
          PENDING_ACTIONS_KEY,
          JSON.stringify(pendingActions)
        );
        if (lastSyncTime) {
          localStorage.setItem(LAST_SYNC_KEY, lastSyncTime.toString());
        }
      } catch (error) {
        console.error("Erro ao salvar estado offline:", error);
      }
    },
    []
  );

  const addPendingAction = useCallback(
    (action: Omit<OfflineAction, "id" | "timestamp" | "retryCount">) => {
      const newAction: OfflineAction = {
        ...action,
        id: `${action.type}_${action.entity}_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      setState((prev) => {
        const newPendingActions = [...prev.pendingActions, newAction];
        saveOfflineState(newPendingActions);
        return { ...prev, pendingActions: newPendingActions };
      });

      if (state.isOnline) {
        syncPendingActions();
      }
    },
    [state.isOnline, saveOfflineState]
  );

  const syncPendingActions = useCallback(async () => {
    if (
      syncInProgressRef.current ||
      !state.isOnline ||
      state.pendingActions.length === 0
    ) {
      return;
    }

    syncInProgressRef.current = true;
    setState((prev) => ({ ...prev, syncInProgress: true }));

    try {
      const actionsToSync = [...state.pendingActions];
      const successfulActions: string[] = [];
      const failedActions: OfflineAction[] = [];

      for (const action of actionsToSync) {
        try {
          await executeOfflineAction(action);
          successfulActions.push(action.id);
        } catch (error) {
          console.error(`Erro ao sincronizar ação ${action.id}:`, error);

          const updatedAction = {
            ...action,
            retryCount: action.retryCount + 1,
          };

          if (updatedAction.retryCount >= 3) {
            console.warn(
              `Ação ${action.id} removida após 3 tentativas falhadas`
            );
          } else {
            failedActions.push(updatedAction);
          }
        }
      }

      const remainingActions = failedActions;
      setState((prev) => ({
        ...prev,
        pendingActions: remainingActions,
        lastSyncTime: Date.now(),
        syncInProgress: false,
      }));
      syncInProgressRef.current = false;

      saveOfflineState(remainingActions, Date.now());

      if (successfulActions.length > 0) {
        toast.success(
          `${successfulActions.length} ação(ões) sincronizada(s) com sucesso!`,
          {
            duration: 3000,
          }
        );
      }

      if (failedActions.length > 0) {
        toast.error(
          `${failedActions.length} ação(ões) falharam na sincronização. Tentando novamente...`,
          {
            duration: 5000,
          }
        );
      }
    } catch (error) {
      console.error("Erro durante sincronização:", error);
      setState((prev) => ({ ...prev, syncInProgress: false }));
      syncInProgressRef.current = false;
      toast.error(
        "Erro durante sincronização. Tentando novamente em alguns segundos..."
      );
    }
  }, [
    state.pendingActions,
    state.isOnline,
    state.syncInProgress,
    saveOfflineState,
  ]);

  const executeOfflineAction = async (action: OfflineAction) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Executando ação offline:", action);
  };

  const clearOfflineData = useCallback(() => {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
    localStorage.removeItem(PENDING_ACTIONS_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);

    setState((prev) => ({
      ...prev,
      pendingActions: [],
      lastSyncTime: null,
    }));

    toast.success("Dados offline limpos com sucesso!");
  }, []);

  const getOfflineData = useCallback((key: string) => {
    try {
      const data = localStorage.getItem(`${OFFLINE_STORAGE_KEY}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erro ao recuperar dados offline:", error);
      return null;
    }
  }, []);

  const setOfflineData = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(
        `${OFFLINE_STORAGE_KEY}_${key}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("Erro ao salvar dados offline:", error);
    }
  }, []);

  return {
    ...state,
    addPendingAction,
    syncPendingActions,
    clearOfflineData,
    getOfflineData,
    setOfflineData,
  };
}
