import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Priority, Task } from "../types";
import DateTimeInput from "./DateTimeInput";
import ResponsiveModal from "./ResponsiveModal";
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

interface SubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtask?: Task;
  onSave: (subtask: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}

export default function SubtaskModal({
  isOpen,
  onClose,
  subtask,
  onSave,
}: SubtaskModalProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    title: subtask?.title || "",
    description: subtask?.description || "",
    dueDate: subtask?.dueDate
      ? new Date(
          subtask.dueDate.getTime() -
            subtask.dueDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16)
      : "",
    priority: subtask?.priority || ("P3" as Priority),
  });

  useEffect(() => {
    if (isOpen) {
      if (subtask) {
        setFormData({
          title: subtask.title || "",
          description: subtask.description || "",
          dueDate: subtask.dueDate
            ? new Date(
                subtask.dueDate.getTime() -
                  subtask.dueDate.getTimezoneOffset() * 60000
              )
                .toISOString()
                .slice(0, 16)
            : "",
          priority: subtask.priority || ("P3" as Priority),
        });
      } else {
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          priority: "P3" as Priority,
        });
      }
    }
  }, [subtask, isOpen]);

  const handleSave = () => {
    if (!formData.title.trim()) return;

    const subtaskData: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      projectId: subtask?.projectId,
      parentTaskId: subtask?.parentTaskId,
      subtasks: [],
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      priority: formData.priority,
      reminders: subtask?.reminders || [],
      tags: subtask?.tags || [],
      attachments: subtask?.attachments || [],
      isCompleted: subtask?.isCompleted || false,
      completedAt: subtask?.completedAt,
      workspaceId: subtask?.workspaceId || state.activeWorkspaceId,
      order: subtask?.order || 0,
      timeEntries: subtask?.timeEntries || [],
      totalTimeSpent: subtask?.totalTimeSpent || 0,
      isTimerRunning: subtask?.isTimerRunning || false,
      currentSessionStart: subtask?.currentSessionStart,
    };

    onSave(subtaskData);
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={subtask ? "Editar Subtarefa" : "Nova Subtarefa"}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Título da subtarefa"
            className="w-full"
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
            placeholder="Descrição da subtarefa"
            className="w-full"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Priority) =>
              setFormData((prev) => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P1">Alta</SelectItem>
              <SelectItem value="P2">Média</SelectItem>
              <SelectItem value="P3">Baixa</SelectItem>
              <SelectItem value="P4">Muito Baixa</SelectItem>
            </SelectContent>
          </Select>
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

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.title.trim()}
            className="w-full sm:w-auto"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            {subtask ? "Salvar" : "Criar"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
