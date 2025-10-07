import { Download, RefreshCw } from "lucide-react";
import { useAppUpdate } from "../hooks/useAppUpdate";
import { Button } from "./ui/button";

export default function AppUpdateNotification() {
  const { hasUpdate, isUpdating, updateApp } = useAppUpdate();

  if (!hasUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Download className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Nova versão disponível
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Uma nova versão do app está disponível. Atualize para ter acesso
              às últimas funcionalidades.
            </p>
          </div>
        </div>

        <div className="mt-4 flex space-x-3">
          <Button
            onClick={updateApp}
            disabled={isUpdating}
            size="sm"
            className="flex-1"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Atualizar Agora
              </>
            )}
          </Button>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Recarregar
          </Button>
        </div>
      </div>
    </div>
  );
}
