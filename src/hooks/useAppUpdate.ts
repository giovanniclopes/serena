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

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "UPDATE_AVAILABLE") {
        handleServiceWorkerUpdate();
      }
    });

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        handleServiceWorkerUpdate();
      }

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

    const checkForUpdates = () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CHECK_UPDATE",
        });
      }
    };

    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateApp = () => {
    setIsUpdating(true);

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      window.location.reload();
    }
  };

  return {
    hasUpdate,
    isUpdating,
    updateApp,
  };
}
