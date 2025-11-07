import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import {
  getShoppingListOwner,
  getShoppingListShares,
  isShoppingListOwner,
  revokeShoppingListShare,
  shareShoppingList,
  updateShoppingListShareRole,
} from "../services/shoppingListSharing";
import { findUserByEmailOrUsername } from "../services/users";
import type { ShareRole, ShoppingList } from "../types";

interface ShareShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingList | null;
}

export default function ShareShoppingListModal({
  isOpen,
  onClose,
  list,
}: ShareShoppingListModalProps) {
  const { state } = useApp();
  const queryClient = useQueryClient();
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
  const [owner, setOwner] = useState<{
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null>(null);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
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
      if (!list || !isOpen) return;
      setLoading(true);
      try {
        const [sharesData, ownerData, ownerCheck] = await Promise.all([
          getShoppingListShares(list.id),
          getShoppingListOwner(list.id),
          isShoppingListOwner(list.id),
        ]);
        setShares(sharesData);
        setOwner(ownerData);
        setIsCurrentUserOwner(ownerCheck);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [list, isOpen]);

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

  if (!isOpen || !list) return null;

  const handleAdd = async () => {
    if (!identifier.trim()) return;
    setLoading(true);
    const res = await shareShoppingList({
      shoppingListId: list.id,
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
    const data = await getShoppingListShares(list.id);
    setShares(data);
    queryClient.invalidateQueries({ queryKey: ["shopping-lists"] });
    queryClient.invalidateQueries({ queryKey: ["sharedShoppingListIds"] });
  };

  const handleChangeRole = async (shareId: string, newRole: ShareRole) => {
    try {
      await updateShoppingListShareRole(shareId, newRole);
      toast.success("Permissão atualizada");
      const data = await getShoppingListShares(list.id);
      setShares(data);
      queryClient.invalidateQueries({ queryKey: ["shoppingLists"] });
      queryClient.invalidateQueries({ queryKey: ["sharedShoppingListIds"] });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar permissão");
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      await revokeShoppingListShare(shareId);
      toast.success("Acesso revogado");
      setShares((prev) => prev.filter((s) => s.id !== shareId));
      queryClient.invalidateQueries({ queryKey: ["shoppingLists"] });
      queryClient.invalidateQueries({ queryKey: ["sharedShoppingListIds"] });
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
          Compartilhar lista de compras
        </h3>

        {isCurrentUserOwner && (
          <div className="space-y-3">
            <div>
              <label
                className="text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Usuário (username ou e-mail)
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
              aria-label="Identificador do usuário"
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
                aria-label="Nível de permissão"
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
              aria-label="Adicionar compartilhamento"
            >
              {loading ? "Adicionando..." : "Adicionar compartilhamento"}
            </button>
          </div>
        )}
        {!isCurrentUserOwner && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              color: state.currentTheme.colors.textSecondary,
            }}
          >
            Apenas o proprietário da lista pode gerenciar compartilhamentos.
          </div>
        )}

        <div className="mt-6">
          {owner && (
            <div className="mb-4">
              <h4
                className="font-medium mb-2 text-xs uppercase"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Proprietário
              </h4>
              <div
                className="flex items-center gap-3 p-2 rounded border"
                style={{ borderColor: state.currentTheme.colors.border }}
              >
                {owner.avatarUrl ? (
                  <img
                    src={owner.avatarUrl}
                    alt={owner.username || "avatar"}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      background: state.currentTheme.colors.primary + "20",
                      color: state.currentTheme.colors.primary,
                    }}
                  >
                    {(owner.username || owner.firstName || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div
                    className="text-sm font-medium"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    {owner.firstName && owner.lastName
                      ? `${owner.firstName} ${owner.lastName}`
                      : owner.firstName || owner.username || owner.id}
                  </div>
                  {owner.username && (owner.firstName || owner.lastName) && (
                    <div
                      className="text-xs"
                      style={{
                        color: state.currentTheme.colors.textSecondary,
                      }}
                    >
                      @{owner.username}
                    </div>
                  )}
                </div>
                <div
                  className="text-xs px-2 py-1 rounded-md"
                  style={{
                    backgroundColor: state.currentTheme.colors.primary + "20",
                    color: state.currentTheme.colors.primary,
                  }}
                >
                  Proprietário
                </div>
              </div>
            </div>
          )}

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
                    {s.user.firstName && s.user.lastName
                      ? `${s.user.firstName} ${s.user.lastName}`
                      : s.user.firstName || s.user.username || s.user.id}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    {s.user.username && (s.user.firstName || s.user.lastName) && (
                      <>@{s.user.username} • </>
                    )}
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
                {isCurrentUserOwner && (
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
                      aria-label={`Alterar permissão de ${s.user.username || s.user.id}`}
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
                      aria-label={`Revogar acesso de ${s.user.username || s.user.id}`}
                    >
                      Revogar
                    </button>
                  </div>
                )}
                {!isCurrentUserOwner && (
                  <div
                    className="text-xs px-2 py-1 rounded-md"
                    style={{
                      backgroundColor: state.currentTheme.colors.surface,
                      color: state.currentTheme.colors.textSecondary,
                      border: `1px solid ${state.currentTheme.colors.border}`,
                    }}
                  >
                    {s.role === "editor" ? "Editor" : "Visualizador"}
                  </div>
                )}
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
            aria-label="Fechar modal"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

