import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  parseNoteFromNaturalLanguage,
  type ParseNoteResult,
} from "../services/aiStickyNotes";

export function useParseNoteInput() {
  return useMutation({
    mutationFn: (input: string) => parseNoteFromNaturalLanguage(input),
    onSuccess: (result: ParseNoteResult) => {
      if (result.success && result.data) {
        console.log("Nota processada com sucesso:", result.data);
      } else {
        console.warn("Processamento parcial:", result);
        if (result.error) {
          toast.error(result.error);
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
