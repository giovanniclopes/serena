import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Trash2,
  Upload,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useOfflineMode } from "../hooks/useOfflineMode";

interface OfflineStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OfflineStatusModal({
  isOpen,
  onClose,
}: OfflineStatusModalProps) {
  const { state } = useApp();
  const {
    isOnline,
    isOfflineMode,
    pendingActions,
    lastSyncTime,
    syncInProgress,
    syncPendingActions,
    clearOfflineData,
  } = useOfflineMode();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const getStatusIcon = () => {
    if (syncInProgress) return RefreshCw;
    if (!isOnline || isOfflineMode) return WifiOff;
    if (pendingActions.length > 0) return AlertTriangle;
    return CheckCircle;
  };

  const getStatusColor = () => {
    if (syncInProgress) return "text-blue-600";
    if (!isOnline || isOfflineMode) return "text-orange-600";
    if (pendingActions.length > 0) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusText = () => {
    if (syncInProgress) return "Sincronizando dados...";
    if (!isOnline || isOfflineMode) return "Modo offline ativo";
    if (pendingActions.length > 0) return "Ações pendentes de sincronização";
    return "Tudo sincronizado";
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return "Nunca";
    const date = new Date(lastSyncTime);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Agora mesmo";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "CREATE":
        return Upload;
      case "UPDATE":
        return RefreshCw;
      case "DELETE":
        return Trash2;
      default:
        return Clock;
    }
  };

  const getActionText = (type: string, entity: string) => {
    const entityText =
      {
        task: "tarefa",
        project: "projeto",
        habit: "hábito",
        countdown: "contador",
      }[entity] || entity;

    switch (type) {
      case "CREATE":
        return `Criar ${entityText}`;
      case "UPDATE":
        return `Atualizar ${entityText}`;
      case "DELETE":
        return `Remover ${entityText}`;
      default:
        return `${type} ${entityText}`;
    }
  };

  const handleClearData = () => {
    clearOfflineData();
    setShowClearConfirm(false);
    onClose();
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
      >
        <div
          className="p-6 border-b"
          style={{ borderColor: state.currentTheme.colors.border }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${statusColor
                  .replace("text-", "bg-")
                  .replace("-600", "-100")}`}
              >
                <StatusIcon className={`w-5 h-5 ${statusColor}`} />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Status de Conectividade
                </h2>
                <p
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {getStatusText()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: state.currentTheme.colors.text }}
              >
                Conexão
              </span>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-orange-600" />
                )}
                <span
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: state.currentTheme.colors.text }}
              >
                Última sincronização
              </span>
              <span
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                {formatLastSync()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: state.currentTheme.colors.text }}
              >
                Ações pendentes
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    pendingActions.length > 0
                      ? state.currentTheme.colors.warning
                      : state.currentTheme.colors.success,
                }}
              >
                {pendingActions.length}
              </span>
            </div>
          </div>

          {pendingActions.length > 0 && (
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: state.currentTheme.colors.text }}
              >
                Ações Pendentes
              </h3>
              <div className="space-y-2">
                {pendingActions.slice(0, 5).map((action) => {
                  const ActionIcon = getActionIcon(action.type);
                  return (
                    <div
                      key={action.id}
                      className="flex items-center space-x-3 p-3 rounded-lg"
                      style={{
                        backgroundColor: state.currentTheme.colors.background,
                      }}
                    >
                      <ActionIcon className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: state.currentTheme.colors.text }}
                        >
                          {getActionText(action.type, action.entity)}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {new Date(action.timestamp).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      {action.retryCount > 0 && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              state.currentTheme.colors.warning + "20",
                            color: state.currentTheme.colors.warning,
                          }}
                        >
                          {action.retryCount} tentativas
                        </span>
                      )}
                    </div>
                  );
                })}
                {pendingActions.length > 5 && (
                  <p
                    className="text-xs text-center py-2"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    E mais {pendingActions.length - 5} ações...
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {!isOnline && pendingActions.length > 0 && (
              <button
                onClick={syncPendingActions}
                disabled={syncInProgress}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: state.currentTheme.colors.primary,
                  color: "white",
                }}
              >
                <RefreshCw
                  className={`w-4 h-4 ${syncInProgress ? "animate-spin" : ""}`}
                />
                <span>
                  {syncInProgress ? "Sincronizando..." : "Tentar Sincronizar"}
                </span>
              </button>
            )}

            {pendingActions.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: state.currentTheme.colors.error + "10",
                  color: state.currentTheme.colors.error,
                  border: `1px solid ${state.currentTheme.colors.error}30`,
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Dados Offline</span>
              </button>
            )}
          </div>
        </div>

        {showClearConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
              style={{ backgroundColor: state.currentTheme.colors.surface }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                Confirmar Limpeza
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Tem certeza que deseja limpar todos os dados offline? Esta ação
                não pode ser desfeita.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.background,
                    color: state.currentTheme.colors.textSecondary,
                    border: `1px solid ${state.currentTheme.colors.border}`,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearData}
                  className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.error,
                    color: "white",
                  }}
                >
                  Limpar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
