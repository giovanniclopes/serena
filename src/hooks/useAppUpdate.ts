import { useEffect, useState } from "react";

interface AppUpdateInfo {
  hasUpdate: boolean;
  isUpdating: boolean;
  updateApp: () => void;
}

export function useAppUpdate(): AppUpdateInfo {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const handleServiceWorkerUpdate = () => {
      setHasUpdate(true);
    };

    // Verifica se há uma nova versão do service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "UPDATE_AVAILABLE") {
        handleServiceWorkerUpdate();
      }
    });

    // Verifica se o service worker está esperando para ativar
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        handleServiceWorkerUpdate();
      }

      // Escuta por novos service workers
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              handleServiceWorkerUpdate();
            }
          });
        }
      });
    });

    // Verifica por atualizações periodicamente
    const checkForUpdates = () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CHECK_UPDATE",
        });
      }
    };

    // Verifica a cada 5 minutos
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateApp = () => {
    setIsUpdating(true);

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      // Envia mensagem para o service worker pular a espera
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });

      // Recarrega a página após um pequeno delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      // Fallback: recarrega a página
      window.location.reload();
    }
  };

  return {
    hasUpdate,
    isUpdating,
    updateApp,
  };
}
