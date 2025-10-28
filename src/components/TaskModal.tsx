import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FEATURES } from "../config/features";
import { useApp } from "../context/AppContext";
import { useProjects } from "../features/projects/useProjects";
import { useSuggestSubtasks } from "../hooks/useSuggestSubtasks";
import type { Attachment, Priority, Project, Recurrence, Task } from "../types";
import AttachmentManager from "./AttachmentManager";
import DateTimeInput from "./DateTimeInput";
import InlineLoadingSpinner from "./InlineLoadingSpinner";
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
  onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<Task>;
  onSuccess?: () => void;
}

export default function TaskModal({
  isOpen,
  onClose,
  task,
  onSave,
  onSuccess,
}: TaskModalProps) {
  const { state } = useApp();
  const { projects } = useProjects();
  const queryClient = useQueryClient();
  const suggestSubtasksMutation = useSuggestSubtasks();
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

  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);
  const [isCreatingSubtasks, setIsCreatingSubtasks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || "",
          description: task.description || "",
          projectId: task.projectId || "",
          dueDate: task.dueDate
            ? new Date(
                task.dueDate.getTime() -
                  task.dueDate.getTimezoneOffset() * 60000
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
      setSuggestedSubtasks([]);
      setIsCreatingSubtasks(false);
    }
  }, [task, isOpen]);

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
      setSuggestedSubtasks([]);
      setIsCreatingSubtasks(false);
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const savedTask = await onSave(taskData);
      console.log("Tarefa salva:", savedTask);

      if (!savedTask || !savedTask.id) {
        console.error("Tarefa não foi salva corretamente:", savedTask);
        throw new Error("Falha ao salvar tarefa");
      }

      if (suggestedSubtasks.length > 0 && !task) {
        try {
          console.log(
            "Iniciando criação de subtarefas sugeridas:",
            suggestedSubtasks
          );
          console.log("TaskId:", savedTask.id);
          console.log("WorkspaceId:", state.activeWorkspaceId);

          setIsCreatingSubtasks(true);

          const { createSubtask } = await import("../services/apiSubtasks");
          const createPromises = suggestedSubtasks.map(async (title, index) => {
            console.log(`Criando subtarefa ${index + 1}:`, title);
            return createSubtask({
              title,
              description: undefined,
              projectId: undefined,
              parentTaskId: savedTask.id,
              subtasks: [],
              dueDate: undefined,
              priority: "P3",
              reminders: [],
              tags: [],
              attachments: [],
              isCompleted: false,
              completedAt: undefined,
              workspaceId: state.activeWorkspaceId,
              order: index,
              timeEntries: [],
              totalTimeSpent: 0,
              isTimerRunning: false,
              currentSessionStart: undefined,
            });
          });

          const results = await Promise.all(createPromises);
          console.log("Subtarefas criadas:", results);

          queryClient.invalidateQueries({
            queryKey: ["subtasks", savedTask.id],
          });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });

          toast.success(
            `${results.length} subtarefas criadas automaticamente!`
          );

          setSuggestedSubtasks([]);
        } catch (error) {
          console.error("Erro ao criar subtarefas sugeridas:", error);
        } finally {
          setIsCreatingSubtasks(false);
        }
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
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

  const handleSuggestSubtasks = async () => {
    if (!formData.title.trim()) return;

    try {
      if (!task) {
        const suggestions = await suggestSubtasksMutation.mutateAsync({
          taskTitle: formData.title,
          taskDescription: formData.description,
          taskId: "preview",
          workspaceId: state.activeWorkspaceId,
        });
        setSuggestedSubtasks(suggestions);
      } else {
        await suggestSubtasksMutation.mutateAsync({
          taskTitle: formData.title,
          taskDescription: formData.description,
          taskId: task.id,
          workspaceId: state.activeWorkspaceId,
        });
      }
    } catch (error) {
      console.error("Erro ao sugerir subtarefas:", error);
    }
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
        {FEATURES.AI_ENABLED && !task && (
          <div
            className="p-3 rounded-lg border cursor-pointer transition-colors hover:opacity-80"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "10",
              borderColor: state.currentTheme.colors.primary + "30",
            }}
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent("openAIInput"));
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className="w-4 h-4"
                style={{ color: state.currentTheme.colors.primary }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: state.currentTheme.colors.primary }}
              >
                ✨ Prefere usar IA? Experimente criar tarefas mais rápido!
              </span>
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Clique aqui para usar o assistente de IA na página principal
            </p>
          </div>
        )}

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

        {FEATURES.AI_ENABLED && !task && formData.title.trim() && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Button
              type="button"
              onClick={handleSuggestSubtasks}
              disabled={suggestSubtasksMutation.isPending}
              variant="outline"
              size="sm"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              {suggestSubtasksMutation.isPending ? (
                <InlineLoadingSpinner size={14} className="mr-1" />
              ) : (
                <Sparkles size={14} className="mr-1" />
              )}
              {suggestSubtasksMutation.isPending
                ? "Gerando..."
                : "Sugerir Subtarefas"}
            </Button>
            <span className="text-xs text-blue-600">
              IA irá sugerir subtarefas baseadas no título
            </span>
          </div>
        )}

        {suggestedSubtasks.length > 0 && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-700 mb-2">
              ✨ Subtarefas sugeridas:
            </h4>
            <ul className="text-sm text-green-600 space-y-1">
              {suggestedSubtasks.map((subtask, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {subtask}
                </li>
              ))}
            </ul>
            <p className="text-xs text-green-600 mt-2">
              {isCreatingSubtasks
                ? "Criando subtarefas automaticamente..."
                : "Estas subtarefas serão criadas automaticamente ao salvar a tarefa"}
            </p>
            {isCreatingSubtasks && (
              <div className="mt-2 flex items-center gap-2">
                <InlineLoadingSpinner size={14} />
                <span className="text-xs text-green-600">Processando...</span>
              </div>
            )}
          </div>
        )}

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
