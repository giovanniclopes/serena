import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { adjustColorBrightness } from "../utils/colorUtils";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const { state } = useApp();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("Usuário aceitou a instalação do PWA");
    } else {
      console.log("Usuário rejeitou a instalação do PWA");
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 mx-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Download
              className="h-6 w-6"
              style={{ color: state.currentTheme.colors.primary }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Instalar Serena
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Instale o app para uma experiência mais rápida e acesso offline.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 flex space-x-3">
        <Button
          onClick={handleInstallClick}
          className="flex-1 text-white"
          style={{
            backgroundColor: state.currentTheme.colors.primary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = adjustColorBrightness(
              state.currentTheme.colors.primary,
              0.8
            );
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              state.currentTheme.colors.primary;
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Instalar App
        </Button>
        <Button onClick={handleDismiss} variant="outline" className="flex-1">
          Agora não
        </Button>
      </div>
    </div>
  );
}
