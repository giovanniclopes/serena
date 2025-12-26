import { STICKY_NOTE_COLORS } from "../constants/stickyNoteColors";
import { geminiModel, isGeminiAvailable } from "../lib/geminiClient";

let requestCount = 0;
let resetTime = Date.now() + 60000;

function checkRateLimit(): boolean {
  const now = Date.now();

  if (now > resetTime) {
    requestCount = 0;
    resetTime = now + 60000;
  }

  if (requestCount >= 60) {
    throw new Error(
      "Limite de requisições excedido. Tente novamente em alguns minutos."
    );
  }

  requestCount++;
  return true;
}

export interface ParsedNote {
  title?: string;
  content: string;
  tags?: string[];
  checklist?: string[];
  color?: string;
  reminderDate?: string;
}

export interface ParseNoteResult {
  success: boolean;
  data?: ParsedNote;
  partialData?: Partial<ParsedNote>;
  error?: string;
}

export async function parseNoteFromNaturalLanguage(
  input: string
): Promise<ParseNoteResult> {
  if (!isGeminiAvailable()) {
    return {
      success: false,
      error: "IA não disponível",
    };
  }

  try {
    checkRateLimit();
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Limite de requisições excedido",
    };
  }

  const currentDate = new Date();
  const currentDateISO = currentDate.toISOString();
  const availableColors = STICKY_NOTE_COLORS.map((c) => c.name.toLowerCase());

  const prompt = `
 ANALISE o texto abaixo e converta em JSON estruturado para criação de nota estilo Google Keep. Siga ESTRITAMENTE as regras listadas.

 IMPORTANTE:
 - SEMPRE retorne apenas o JSON, nunca adicione explicações, comentários, markdown ou texto fora do JSON!
 - Nunca use aspas duplas ("") dentro dos valores do JSON. Se houver aspas duplas no texto de entrada, troque por aspas simples ou remova-as.

 DATA/HORA ATUAL (referência para datas relativas): ${currentDateISO}

 ENTRADA (real):
 "${input}"

 ENTRADA (exemplo 1):
 "Nota amarela sobre reunião de equipe amanhã às 14h. Lista: preparar apresentação, enviar convites, reservar sala. Tags: #trabalho #reunião"

 SAÍDA (formato):
 {
   "title": "Reunião de equipe",
   "content": "Reunião amanhã às 14h",
   "tags": ["trabalho", "reunião"],
   "checklist": ["preparar apresentação", "enviar convites", "reservar sala"],
   "color": "#fffacd",
   "reminderDate": "${
     new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
   }T14:00:00"
 }

 ENTRADA (exemplo 2):
 "Lembrar de comprar leite, pão e ovos no supermercado. Nota azul para lista de compras"

 SAÍDA ESPERADA:
 {
   "title": "Lista de compras",
   "content": "",
   "checklist": ["leite", "pão", "ovos"],
   "color": "#bae1ff",
   "tags": ["compras"]
 }

 ENTRADA (exemplo 3):
 "Ideias para projeto: pesquisar mercado, criar protótipo, validar com usuários. Tag: #projeto"

 SAÍDA ESPERADA:
 {
   "title": "Ideias para projeto",
   "content": "Pesquisar mercado, criar protótipo, validar com usuários",
   "tags": ["projeto"]
 }

 REGRAS PARA O JSON:
 - title: título curto e claro (máx. 60 caracteres), opcional. Se não houver título claro, omita o campo.
 - content: conteúdo principal da nota. Se houver checklist, o conteúdo pode ser vazio ou conter contexto adicional.
 - tags: array de strings extraídas de hashtags (#tag) ou palavras-chave relevantes (máx. 5). Normalize para minúsculas, remova #.
 - checklist: array de strings quando mencionar lista, itens de checklist ou tarefas numeradas. Cada item deve ser uma string simples.
 - color: cor em hexadecimal. Cores disponíveis: ${availableColors.join(
   ", "
 )}. Mapeie: amarelo/amarela -> #fffacd, rosa -> #ffb3ba, vermelho/vermelha -> #ff6b6b, azul -> #bae1ff, verde -> #baffc9, laranja -> #ffdfba, roxo -> #e0bbff, branco -> #ffffff, cinza -> #f0f0f0. Se não mencionar cor, omita o campo.
 - reminderDate: formato ISO (AAAA-MM-DDTHH:MM:SS) quando mencionar lembretes, datas ou horários. Use a data/hora atual como referência para "hoje", "amanhã", etc. Se não houver lembrete, omita o campo.

 REGRAS AVANÇADAS:
 - Se mencionar "lista" ou itens numerados, extraia como checklist
 - Se mencionar hashtags (#tag), extraia como tags
 - Se mencionar cor (ex: "nota amarela", "cor azul"), mapeie para hexadecimal
 - Se mencionar data/hora (ex: "lembrar amanhã", "nota para quinta às 15h"), extraia como reminderDate
 - Nunca invente informações que não estão no texto
 - Se o texto for muito simples, retorne apenas content (obrigatório)
 - Normalize tags para minúsculas e remova caracteres especiais além de letras/números
 - Se houver checklist, o content pode ser vazio ou conter contexto adicional

 Caso a entrada seja muito simples, retorne JSON só com o campo content obrigatório.
 `;

  try {
    const result = await geminiModel!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error:
          "Resposta da IA não contém JSON válido. Tente reformular sua descrição.",
        partialData: {
          content: input,
        },
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (typeof parsed.content !== "string") {
      return {
        success: false,
        error: "Não foi possível identificar o conteúdo da nota",
        partialData: {
          content: input,
        },
      };
    }

    if (
      parsed.color &&
      !STICKY_NOTE_COLORS.some((c) => c.value === parsed.color)
    ) {
      const colorName = parsed.color.toLowerCase();
      const matchedColor = STICKY_NOTE_COLORS.find(
        (c) => c.name.toLowerCase() === colorName
      );
      if (matchedColor) {
        parsed.color = matchedColor.value;
      } else {
        delete parsed.color;
      }
    }

    if (parsed.reminderDate) {
      try {
        const date = new Date(parsed.reminderDate);
        if (isNaN(date.getTime())) {
          delete parsed.reminderDate;
        } else {
          parsed.reminderDate = date.toISOString().slice(0, 16);
        }
      } catch {
        delete parsed.reminderDate;
      }
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error("Erro ao processar linguagem natural:", error);

    const partialData: Partial<ParsedNote> = {
      content: input,
    };

    return {
      success: false,
      error: "Falha ao processar entrada. Tente novamente.",
      partialData,
    };
  }
}
