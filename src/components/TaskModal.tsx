import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useProjects } from "../features/projects/useProjects";
import type { Priority, Task } from "../types";
import DateTimeInput from "./DateTimeInput";
import Modal from "./Modal";
import SubtaskManager from "./SubtaskManager";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

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
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Digite o título da tarefa"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Descrição da tarefa (opcional)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="project">Projeto</Label>
            <Select
              value={formData.projectId || "none"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  projectId: value === "none" ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem projeto</SelectItem>
                {availableProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: value as Priority,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 - Urgente</SelectItem>
                <SelectItem value="P2">P2 - Alta</SelectItem>
                <SelectItem value="P3">P3 - Média</SelectItem>
                <SelectItem value="P4">P4 - Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="dueDate">Data de Vencimento</Label>
          <DateTimeInput
            value={formData.dueDate}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, dueDate: value }))
            }
            placeholder="DD/MM/AAAA HH:MM"
            className="w-full"
          />
        </div>

        {availableTags.length > 0 && (
          <div>
            <Label>Tags</Label>
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

        {task && (
          <div className="pt-4 border-t">
            <SubtaskManager
              taskId={task.id}
              workspaceId={state.activeWorkspaceId}
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{task ? "Salvar" : "Criar"}</Button>
        </div>
      </form>
    </Modal>
  );
}
