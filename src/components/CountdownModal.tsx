import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Countdown } from "../types";
import DateTimeInput from "./DateTimeInput";
import ResponsiveModal from "./ResponsiveModal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdown?: Countdown;
  onSave: (
    countdown: Omit<Countdown, "id" | "createdAt" | "updatedAt">
  ) => void;
}

const colors = [
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

export default function CountdownModal({
  isOpen,
  onClose,
  countdown,
  onSave,
}: CountdownModalProps) {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    title: countdown?.title || "",
    description: countdown?.description || "",
    targetDate: countdown?.targetDate
      ? countdown.targetDate.toISOString().slice(0, 16)
      : "",
    color: countdown?.color || colors[0],
  });

  useEffect(() => {
    if (countdown) {
      setFormData({
        title: countdown.title || "",
        description: countdown.description || "",
        targetDate: countdown.targetDate
          ? countdown.targetDate.toISOString().slice(0, 16)
          : "",
        color: countdown.color || colors[0],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        targetDate: "",
        color: colors[0],
      });
    }
  }, [countdown]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        targetDate: "",
        color: colors[0],
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.targetDate) return;

    const countdownData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      targetDate: new Date(formData.targetDate),
      color: formData.color,
      workspaceId: state.activeWorkspaceId,
    };

    onSave(countdownData);
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        countdown ? "Editar Contagem Regressiva" : "Nova Contagem Regressiva"
      }
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
            placeholder="Ex: Viagem para o Japão, Aniversário, Prova"
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
            placeholder="Descrição do evento (opcional)"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="targetDate">Data e Hora *</Label>
          <DateTimeInput
            value={formData.targetDate}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, targetDate: value }))
            }
            placeholder="DD/MM/AAAA HH:MM"
            className="w-full"
            required
          />
        </div>

        <div>
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color ? "scale-110" : ""
                }`}
                style={{
                  backgroundColor: color,
                  borderColor:
                    formData.color === color
                      ? state.currentTheme.colors.text
                      : "transparent",
                }}
              />
            ))}
          </div>
        </div>

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
            {countdown ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
