import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, RefreshCw, WifiOff } from "lucide-react";
import { useOfflineMode } from "../hooks/useOfflineMode";

export default function OfflineIndicator() {
  const {
    isOnline,
    isOfflineMode,
    pendingActions,
    syncInProgress,
    syncPendingActions,
  } = useOfflineMode();

  const getStatusInfo = () => {
    if (syncInProgress) {
      return {
        icon: RefreshCw,
        text: "Sincronizando...",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        animate: true,
      };
    }

    if (!isOnline || isOfflineMode) {
      return {
        icon: WifiOff,
        text:
          pendingActions.length > 0
            ? `${pendingActions.length} ação(ões) pendente(s)`
            : "Modo offline",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        animate: false,
      };
    }

    if (pendingActions.length > 0) {
      return {
        icon: AlertCircle,
        text: `${pendingActions.length} ação(ões) aguardando sincronização`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        animate: false,
      };
    }

    return {
      icon: CheckCircle,
      text: "Sincronizado",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      animate: false,
    };
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  if (isOnline && pendingActions.length === 0 && !syncInProgress) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg border shadow-lg ${statusInfo.bgColor} ${statusInfo.borderColor}`}
      >
        <div className="flex items-center space-x-2">
          <motion.div
            animate={statusInfo.animate ? { rotate: 360 } : {}}
            transition={
              statusInfo.animate
                ? { duration: 1, repeat: Infinity, ease: "linear" }
                : {}
            }
          >
            <IconComponent className={`w-4 h-4 ${statusInfo.color}`} />
          </motion.div>

          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>

          {!isOnline && pendingActions.length > 0 && (
            <button
              onClick={syncPendingActions}
              className="ml-2 p-1 rounded-full hover:bg-orange-100 transition-colors"
              title="Tentar sincronizar agora"
            >
              <RefreshCw className="w-3 h-3 text-orange-600" />
            </button>
          )}
        </div>

        {/* Barra de progresso para sincronização */}
        {syncInProgress && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-lg"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
