import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useProjects } from "../features/projects/useProjects";
import type { Attachment, Priority, Project, Recurrence, Task } from "../types";
import AttachmentManager from "./AttachmentManager";
import DateTimeInput from "./DateTimeInput";
import RecurrenceManager from "./RecurrenceManager";
import ResponsiveModal from "./ResponsiveModal";
import SubtaskManager from "./SubtaskManager";
import TaskTimer from "./TaskTimer";
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
    dueDate: task?.dueDate
      ? new Date(
          task.dueDate.getTime() - task.dueDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16)
      : "",
    priority: task?.priority || ("P3" as Priority),
    tags: task?.tags || [],
    attachments: task?.attachments || [],
    recurrence: task?.recurrence,
    timeEntries: task?.timeEntries || [],
    totalTimeSpent: task?.totalTimeSpent || 0,
    isTimerRunning: task?.isTimerRunning || false,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        projectId: task.projectId || "",
        dueDate: task.dueDate
          ? new Date(
              task.dueDate.getTime() - task.dueDate.getTimezoneOffset() * 60000
            )
              .toISOString()
              .slice(0, 16)
          : "",
        priority: task.priority || ("P3" as Priority),
        tags: task.tags || [],
        attachments: task.attachments || [],
        recurrence: task.recurrence,
        timeEntries: task.timeEntries || [],
        totalTimeSpent: task.totalTimeSpent || 0,
        isTimerRunning: task.isTimerRunning || false,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        projectId: "",
        dueDate: "",
        priority: "P3" as Priority,
        tags: [],
        attachments: [],
        recurrence: undefined,
        timeEntries: [],
        totalTimeSpent: 0,
        isTimerRunning: false,
      });
    }
  }, [task]);

  useEffect(() => {
    if (!isOpen && !task) {
      setFormData({
        title: "",
        description: "",
        projectId: "",
        dueDate: "",
        priority: "P3" as Priority,
        tags: [],
        attachments: [],
        recurrence: undefined,
        timeEntries: [],
        totalTimeSpent: 0,
        isTimerRunning: false,
      });
    }
  }, [isOpen, task]);

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
      attachments: formData.attachments,
      recurrence: formData.recurrence,
      subtasks: task?.subtasks || [],
      reminders: task?.reminders || [],
      isCompleted: task?.isCompleted || false,
      completedAt: task?.completedAt,
      workspaceId: state.activeWorkspaceId,
      order: task?.order || 0,
      timeEntries: formData.timeEntries,
      totalTimeSpent: formData.totalTimeSpent,
      isTimerRunning: formData.isTimerRunning,
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

  const handleAttachmentsChange = (attachments: Attachment[]) => {
    setFormData((prev) => ({
      ...prev,
      attachments,
    }));
  };

  const handleRecurrenceChange = (recurrence: Recurrence | undefined) => {
    setFormData((prev) => ({
      ...prev,
      recurrence,
    }));
  };

  const availableProjects =
    (projects as Project[])?.filter(
      (p: Project) => p.workspaceId === state.activeWorkspaceId
    ) || [];
  const availableTags = state.tags.filter(
    (t) => t.workspaceId === state.activeWorkspaceId
  );

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Editar Tarefa" : "Nova Tarefa"}
      size="md"
      description=""
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                {availableProjects.map((project: Project) => (
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

        <RecurrenceManager
          recurrence={formData.recurrence}
          onRecurrenceChange={handleRecurrenceChange}
        />

        <AttachmentManager
          attachments={formData.attachments}
          onAttachmentsChange={handleAttachmentsChange}
          workspaceId={state.activeWorkspaceId}
        />

        {task && !task.isCompleted && (
          <div className="pt-4 border-t">
            <TaskTimer task={task} variant="full" />
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

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            {task ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
