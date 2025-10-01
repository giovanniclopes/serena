import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useProjects } from "../features/projects/useProjects";
import type { Priority, Task } from "../types";
import Modal from "./Modal";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}

export default function TaskModal({
  isOpen,
  onClose,
  task,
  onSave,
}: TaskModalProps) {
  const { state } = useApp();
  const { projects } = useProjects();
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    projectId: task?.projectId || "",
    dueDate: task?.dueDate ? task.dueDate.toISOString().slice(0, 16) : "",
    priority: task?.priority || ("P3" as Priority),
    tags: task?.tags || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      projectId: formData.projectId || undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      priority: formData.priority,
      tags: formData.tags,
      subtasks: task?.subtasks || [],
      reminders: task?.reminders || [],
      isCompleted: task?.isCompleted || false,
      completedAt: task?.completedAt,
      workspaceId: state.activeWorkspaceId,
    };

    onSave(taskData);
    onClose();
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const availableProjects =
    projects?.filter((p) => p.workspaceId === state.activeWorkspaceId) || [];
  const availableTags = state.tags.filter(
    (t) => t.workspaceId === state.activeWorkspaceId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Editar Tarefa" : "Nova Tarefa"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Título *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
            placeholder="Digite o título da tarefa"
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
            placeholder="Descrição da tarefa (opcional)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Projeto
            </label>
            <select
              value={formData.projectId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, projectId: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
              }}
            >
              <option value="">Sem projeto</option>
              {availableProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Prioridade
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as Priority,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
                color: state.currentTheme.colors.text,
              }}
            >
              <option value="P1">P1 - Urgente</option>
              <option value="P2">P2 - Alta</option>
              <option value="P3">P3 - Média</option>
              <option value="P4">P4 - Baixa</option>
            </select>
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: state.currentTheme.colors.text }}
          >
            Data de Vencimento
          </label>
          <input
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-lg border transition-colors"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          />
        </div>

        {availableTags.length > 0 && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: state.currentTheme.colors.text }}
            >
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.tags.includes(tag.id) ? "text-white" : ""
                  }`}
                  style={{
                    backgroundColor: formData.tags.includes(tag.id)
                      ? tag.color
                      : tag.color + "20",
                    color: formData.tags.includes(tag.id) ? "white" : tag.color,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
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
            className="px-4 py-2 rounded-lg font-medium transition-colors text-white"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
            }}
          >
            {task ? "Salvar" : "Criar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
