import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  parseTaskFromNaturalLanguage,
  type ParseTaskResult,
} from "../services/aiTasks";

interface UseParseTaskInputOptions {
  availableProjects?: Array<{ id: string; name: string }>;
}

export function useParseTaskInput(options?: UseParseTaskInputOptions) {
  return useMutation({
    mutationFn: (input: string) =>
      parseTaskFromNaturalLanguage(input, options?.availableProjects),
    onSuccess: (result: ParseTaskResult) => {
      if (result.success && result.data) {
        console.log("Tarefa processada com sucesso:", result.data);
      } else {
        console.warn("Processamento parcial:", result);
        if (result.error) {
          toast.error(result.error);
        }
        if (result.suggestions && result.suggestions.length > 0) {
          toast.info(result.suggestions[0]);
        }
      }
    },
    onError: (error: Error) => {
      console.error("Erro ao processar entrada:", error);
      toast.error(
        error.message || "Falha ao processar entrada. Tente novamente."
      );
    },
  });
}
