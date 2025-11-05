import { Check, Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { generateImplementationPrompt } from "../services/aiPromptGeneration";
import type { Task } from "../types";

interface PromptImplementationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function PromptImplementationModal({
  isOpen,
  onClose,
  task,
}: PromptImplementationModalProps) {
  const { state } = useApp();
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setLoading(true);
      setPrompt("");
      setCopied(false);

      generateImplementationPrompt(task)
        .then((generatedPrompt) => {
          setPrompt(generatedPrompt);
        })
        .catch((error) => {
          console.error("Erro ao gerar prompt:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Erro ao gerar prompt de implementação"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPrompt("");
      setCopied(false);
    }
  }, [isOpen, task]);

  const handleCopy = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Prompt copiado para área de transferência");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast.error("Erro ao copiar prompt");
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col"
        style={{ backgroundColor: state.currentTheme.colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: state.currentTheme.colors.text }}
        >
          Prompt de Implementação
        </h3>

        <div className="flex-1 overflow-auto mb-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: state.currentTheme.colors.primary }}
              />
              <span
                className="ml-3 text-sm"
                style={{ color: state.currentTheme.colors.textSecondary }}
              >
                Gerando prompt...
              </span>
            </div>
          ) : prompt ? (
            <div
              className="p-4 rounded-lg border overflow-auto max-h-[60vh]"
              style={{
                borderColor: state.currentTheme.colors.border,
                backgroundColor: state.currentTheme.colors.surface,
              }}
            >
              <pre
                className="whitespace-pre-wrap text-sm font-mono"
                style={{ color: state.currentTheme.colors.text }}
              >
                {prompt}
              </pre>
            </div>
          ) : (
            <div
              className="text-sm text-center py-12"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Nenhum prompt disponível
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCopy}
            disabled={!prompt || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: state.currentTheme.colors.primary,
              color: "white",
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              color: state.currentTheme.colors.textSecondary,
              border: `1px solid ${state.currentTheme.colors.border}`,
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
