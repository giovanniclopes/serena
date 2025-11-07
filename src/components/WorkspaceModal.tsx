import { useEffect, useState } from "react";
import { WORKSPACE_COLORS } from "../constants/workspaceColors";
import { useApp } from "../context/AppContext";
import type { Workspace } from "../types";
import ColorPicker from "./ColorPicker";
import ResponsiveModal from "./ResponsiveModal";

interface FormData {
  name: string;
  description: string;
  color: string;
}

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace?: Workspace;
  onSave: (
    workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">
  ) => void;
}

export default function WorkspaceModal({
  isOpen,
  onClose,
  workspace,
  onSave,
}: WorkspaceModalProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    color: WORKSPACE_COLORS[0],
  });

  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        description: workspace.description || "",
        color: workspace.color || WORKSPACE_COLORS[0],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        color: WORKSPACE_COLORS[0],
      });
    }
  }, [workspace]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        color: WORKSPACE_COLORS[0],
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const workspaceData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      isDefault: workspace?.isDefault || false,
    };

    onSave(workspaceData);
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={workspace ? "Editar Workspace" : "Novo Workspace"}
      size="md"
      description="Organize seus espaços de trabalho"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Nome *
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
            placeholder="Nome do workspace"
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
            placeholder="Descrição do workspace (opcional)"
            rows={3}
          />
        </div>

        <ColorPicker
          value={formData.color}
          onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
          predefinedColors={WORKSPACE_COLORS}
          label="Cor"
        />

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              color: state.currentTheme.colors.text,
              borderColor: state.currentTheme.colors.border,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors text-white"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
            }}
          >
            {workspace ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
