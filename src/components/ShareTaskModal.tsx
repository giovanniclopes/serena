import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import {
  getTaskShares,
  revokeTaskShare,
  shareTask,
  updateTaskShareRole,
} from "../services/taskSharing";
import { findUserByEmailOrUsername } from "../services/users";
import type { ShareRole, Task } from "../types";

interface ShareTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function ShareTaskModal({
  isOpen,
  onClose,
  task,
}: ShareTaskModalProps) {
  const { state } = useApp();
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<ShareRole>("viewer");
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<
    Array<{
      id: string;
      role: ShareRole;
      createdAt: string;
      user: {
        id: string;
        username?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      };
    }>
  >([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUser, setPreviewUser] = useState<{
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null>(null);
  const [isPreviewSelected, setIsPreviewSelected] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!task || !isOpen) return;
      setLoading(true);
      try {
        const data = await getTaskShares(task.id);
        setShares(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [task, isOpen]);

  useEffect(() => {
    if (!identifier.trim()) {
      setPreviewUser(null);
      setIsPreviewSelected(false);
      return;
    }
    const h = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const user = await findUserByEmailOrUsername(identifier.trim());
        setPreviewUser(user);
      } catch {
        setPreviewUser(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 300);
    return () => clearTimeout(h);
  }, [identifier]);

  if (!isOpen || !task) return null;

  const handleAdd = async () => {
    if (!identifier.trim()) return;
    setLoading(true);
    const res = await shareTask({
      taskId: task.id,
      userIdentifier: identifier.trim(),
      role,
    });
    setLoading(false);
    if (!res.success) {
      toast.error(res.message || "Falha ao compartilhar");
      return;
    }
    toast.success("Compartilhamento adicionado");
    setIdentifier("");
    const data = await getTaskShares(task.id);
    setShares(data);
  };

  const handleChangeRole = async (shareId: string, newRole: ShareRole) => {
    try {
      await updateTaskShareRole(shareId, newRole);
      toast.success("Permissão atualizada");
      const data = await getTaskShares(task.id);
      setShares(data);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar permissão");
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      await revokeTaskShare(shareId);
      toast.success("Acesso revogado");
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao revogar acesso");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: state.currentTheme.colors.text }}
        >
          Compartilhar tarefa
        </h3>

        <div className="space-y-3">
          <div>
            <label
              className="text-sm"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Usuário (username)
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded border"
              style={{
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
                background: state.currentTheme.colors.surface,
              }}
              placeholder="ex: joao.silva"
            />
            <div className="mt-2">
              {previewLoading && (
                <div
                  className="h-12 w-full rounded-md animate-pulse"
                  style={{ background: state.currentTheme.colors.border }}
                />
              )}
              {!previewLoading && previewUser && (
                <div
                  className="flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer"
                  style={{
                    borderColor: isPreviewSelected
                      ? state.currentTheme.colors.primary
                      : state.currentTheme.colors.border,
                    background: state.currentTheme.colors.surface,
                  }}
                  onClick={() => {
                    setIsPreviewSelected(true);
                    if (previewUser.username) {
                      setIdentifier(previewUser.username);
                    }
                  }}
                >
                  <div className="flex items-center" style={{ gap: 12 }}>
                    {previewUser.avatarUrl ? (
                      <img
                        src={previewUser.avatarUrl}
                        alt={previewUser.username || "avatar"}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full"
                        style={{ background: state.currentTheme.colors.border }}
                      />
                    )}
                    <div className="leading-tight">
                      <div
                        className="text-sm font-medium"
                        style={{ color: state.currentTheme.colors.text }}
                      >
                        {previewUser.username ||
                          previewUser.firstName ||
                          previewUser.id}
                      </div>
                      {(previewUser.firstName || previewUser.lastName) && (
                        <div
                          className="text-xs"
                          style={{
                            color: state.currentTheme.colors.textSecondary,
                          }}
                        >
                          {[previewUser.firstName, previewUser.lastName]
                            .filter(Boolean)
                            .join(" ")}
                        </div>
                      )}
                    </div>
                  </div>
                  {isPreviewSelected ? (
                    <Check
                      className="w-4 h-4"
                      style={{ color: state.currentTheme.colors.primary }}
                    />
                  ) : (
                    <div
                      className="text-xs px-2 py-1 rounded-md"
                      style={{
                        border: `1px solid ${state.currentTheme.colors.border}`,
                        color: state.currentTheme.colors.textSecondary,
                      }}
                    >
                      Perfil encontrado
                    </div>
                  )}
                </div>
              )}
              {!previewLoading && identifier.trim() && !previewUser && (
                <div
                  className="flex items-center gap-2 p-2 rounded-lg border"
                  style={{ borderColor: state.currentTheme.colors.border }}
                >
                  <div
                    className="w-9 h-9 rounded-full"
                    style={{ background: state.currentTheme.colors.border }}
                  />
                  <div
                    className="text-xs"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    Usuário não encontrado
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label
              className="text-sm"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Permissão
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ShareRole)}
              className="w-full mt-1 px-3 py-2 rounded border"
              style={{
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
                background: state.currentTheme.colors.surface,
              }}
            >
              <option value="viewer">Visualizador</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={loading || !identifier.trim()}
            className="w-full px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            {loading ? "Adicionando..." : "Adicionar compartilhamento"}
          </button>
        </div>

        <div className="mt-6">
          <h4
            className="font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Usuários com acesso
          </h4>
          <div className="space-y-2 max-h-64 overflow-auto">
            {shares.length === 0 && (
              <div
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Nenhum usuário compartilhado
              </div>
            )}
            {shares.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 p-2 rounded border"
                style={{ borderColor: state.currentTheme.colors.border }}
              >
                <div>
                  <div
                    className="text-sm"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    {s.user.username || s.user.firstName || s.user.id}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={s.role}
                    onChange={(e) =>
                      handleChangeRole(s.id, e.target.value as ShareRole)
                    }
                    className="px-2 py-1 rounded border text-sm"
                    style={{
                      borderColor: state.currentTheme.colors.border,
                      color: state.currentTheme.colors.text,
                      background: state.currentTheme.colors.surface,
                    }}
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={() => handleRevoke(s.id)}
                    className="px-2 py-1 rounded text-sm"
                    style={{
                      color: state.currentTheme.colors.error,
                      border: `1px solid ${state.currentTheme.colors.error}`,
                    }}
                  >
                    Revogar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              color: state.currentTheme.colors.textSecondary,
              border: `1px solid ${state.currentTheme.colors.border}`,
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
