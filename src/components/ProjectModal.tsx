import { useEffect, useState } from "react";
import { WORKSPACE_COLORS } from "../constants/workspaceColors";
import {
  projectTemplates,
  type ProjectTemplate,
} from "../constants/projectTemplates";
import { useApp } from "../context/AppContext";
import type { Project } from "../types";
import ColorPicker from "./ColorPicker";
import ResponsiveModal from "./ResponsiveModal";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  workspaceId?: string;
  onSave: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
    templateId?: string
  ) => void;
}

export default function ProjectModal({
  isOpen,
  onClose,
  project,
  workspaceId,
  onSave,
}: ProjectModalProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    color: project?.color || WORKSPACE_COLORS[0],
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showTemplates, setShowTemplates] = useState(!project);

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          name: project.name || "",
          description: project.description || "",
          color: project.color || WORKSPACE_COLORS[0],
        });
        setShowTemplates(false);
      } else {
        setFormData({
          name: "",
          description: "",
          color: WORKSPACE_COLORS[0],
        });
        setShowTemplates(true);
      }
    }
  }, [project, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        color: WORKSPACE_COLORS[0],
      });
      setSelectedTemplate("");
      setShowTemplates(true);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const projectData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      workspaceId: workspaceId || state.activeWorkspaceId,
      tasksCompletedCount: 0,
      tasksTotalCount: 0,
    };

    onSave(projectData, selectedTemplate || undefined);
    onClose();
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template.id);
    setFormData({
      name: template.name,
      description: template.description,
      color: template.color,
    });
    setShowTemplates(false);
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? "Editar Projeto" : "Novo Projeto"}
      size="md"
      description="Organize suas tarefas em projetos"
    >
      {showTemplates && !project && (
        <div className="mb-6">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: state.currentTheme.colors.text }}
          >
            Escolha um template (opcional)
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:gap-3 max-h-48 sm:max-h-60 overflow-y-auto">
            {projectTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className="p-3 rounded-lg border text-left transition-all hover:shadow-md"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: template.color }}
                  >
                    {template.icon === "book-open" && "📖"}
                    {template.icon === "languages" && "🌍"}
                    {template.icon === "dumbbell" && "💪"}
                    {template.icon === "graduation-cap" && "🎓"}
                    {template.icon === "palette" && "🎨"}
                  </div>
                  <div>
                    <h3
                      className="font-medium"
                      style={{ color: state.currentTheme.colors.text }}
                    >
                      {template.name}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      {template.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowTemplates(false)}
            className="mt-3 text-sm underline"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Ou criar projeto personalizado
          </button>
        </div>
      )}

      {!showTemplates && (
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
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
              }}
              placeholder="Nome do projeto"
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
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
              }}
              placeholder="Descrição do projeto (opcional)"
              rows={3}
            />
          </div>

          <ColorPicker
            value={formData.color}
            onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
            predefinedColors={WORKSPACE_COLORS}
            label="Cor"
          />

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3 sm:pt-4">
            {!project && (
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors text-sm order-2 sm:order-1"
                style={{
                  backgroundColor: state.currentTheme.colors.surface,
                  color: state.currentTheme.colors.text,
                  borderColor: state.currentTheme.colors.border,
                }}
              >
                ← Voltar aos templates
              </button>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-auto order-1 sm:order-2">
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
                {project ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </form>
      )}
    </ResponsiveModal>
  );
}
