import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  parseTaskFromNaturalLanguage,
  type ParsedTask,
} from "../services/aiTasks";

export function useParseTaskInput() {
  return useMutation({
    mutationFn: parseTaskFromNaturalLanguage,
    onSuccess: (data: ParsedTask) => {
      console.log("Tarefa processada com sucesso:", data);
    },
    onError: (error: Error) => {
      console.error("Erro ao processar entrada:", error);
      toast.error(
        error.message || "Falha ao processar entrada. Tente novamente."
      );
    },
  });
}
