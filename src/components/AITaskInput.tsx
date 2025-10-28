import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import InlineLoadingSpinner from "./InlineLoadingSpinner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AITaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isProcessing: boolean;
}

export default function AITaskInput({
  value,
  onChange,
  onSubmit,
  onClose,
  isProcessing,
}: AITaskInputProps) {
  const { state } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !isProcessing) {
      onSubmit();
    }
  };

  return (
    <div
      className="fixed bottom-32 right-4 z-50 max-w-sm w-full"
      style={{
        backgroundColor: state.currentTheme.colors.surface,
        border: `1px solid ${state.currentTheme.colors.border}`,
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: state.currentTheme.colors.primary + "20",
            }}
          >
            <Sparkles
              className="w-4 h-4"
              style={{ color: state.currentTheme.colors.primary }}
            />
          </div>
          <h3
            className="text-sm font-medium"
            style={{ color: state.currentTheme.colors.text }}
          >
            Criar tarefa com IA
          </h3>
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: 'Reunião amanhã às 14h no projeto App v2 com prioridade alta'"
            disabled={isProcessing}
            className="w-full"
            style={{
              backgroundColor: state.currentTheme.colors.background,
              borderColor: state.currentTheme.colors.border,
              color: state.currentTheme.colors.text,
            }}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!value.trim() || isProcessing}
              className="flex-1"
              style={{
                backgroundColor: state.currentTheme.colors.primary,
                color: "white",
              }}
            >
              {isProcessing ? (
                <>
                  <InlineLoadingSpinner size={16} className="mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Criar tarefa
                </>
              )}
            </Button>
          </div>

          <p
            className="text-xs"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            A IA preencherá automaticamente título, data, prioridade e projeto
          </p>
        </div>
      </div>
    </div>
  );
}
