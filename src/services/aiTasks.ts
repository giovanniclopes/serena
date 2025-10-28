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

export interface ParsedTask {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "P1" | "P2" | "P3" | "P4";
  projectName?: string;
}

export interface ParseTaskResult {
  success: boolean;
  data?: ParsedTask;
  partialData?: Partial<ParsedTask>;
  suggestions?: string[];
  error?: string;
}

export async function parseTaskFromNaturalLanguage(
  input: string
): Promise<ParseTaskResult> {
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

  const prompt = `
Analise o seguinte texto em linguagem natural e extraia informações estruturadas para uma tarefa.

Texto: "${input}"

Retorne APENAS um JSON válido com os seguintes campos:
- title: string (título da tarefa)
- description: string (opcional, descrição detalhada)
- dueDate: string (opcional, formato ISO 8601, ex: "2024-01-15T14:00:00")
- priority: string (opcional, "P1", "P2", "P3" ou "P4")
- projectName: string (opcional, nome do projeto mencionado)

Regras:
- Se não houver data específica, omita dueDate
- Prioridade: P1=urgente, P2=alta, P3=média, P4=baixa
- Se não mencionar prioridade, omita o campo
- Se não mencionar projeto, omita projectName
- Seja conciso mas preciso
- SEMPRE extraia pelo menos o título da tarefa

Exemplo de resposta:
{
  "title": "Revisar design do onboarding",
  "description": "Revisar e melhorar o fluxo de onboarding dos usuários",
  "dueDate": "2024-01-15T15:00:00",
  "priority": "P2",
  "projectName": "App v2"
}
`;

  try {
    const result = await geminiModel!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: "Resposta da IA não contém JSON válido",
        suggestions: ["Tente ser mais específico na descrição da tarefa"],
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.title || typeof parsed.title !== "string") {
      return {
        success: false,
        error: "Não foi possível identificar o título da tarefa",
        suggestions: ["Inclua um título claro para a tarefa"],
      };
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    console.error("Erro ao processar linguagem natural:", error);

    const partialData: Partial<ParsedTask> = {};
    const suggestions: string[] = [];

    if (
      input.toLowerCase().includes("amanhã") ||
      input.toLowerCase().includes("hoje")
    ) {
      partialData.title = input.split(" ")[0] || input;
      suggestions.push(
        "Tente especificar a data completa: 'Reunião amanhã às 14h'"
      );
    } else if (input.length > 0) {
      partialData.title = input;
      suggestions.push("Adicione mais detalhes como data, hora ou prioridade");
    }

    return {
      success: false,
      error: "Falha ao processar entrada. Tente novamente.",
      partialData:
        Object.keys(partialData).length > 0 ? partialData : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }
}

export async function suggestSubtasks(
  taskTitle: string,
  taskDescription?: string
): Promise<string[]> {
  if (!isGeminiAvailable()) {
    throw new Error("IA não disponível");
  }

  checkRateLimit();

  const context = taskDescription
    ? `Título: ${taskTitle}\nDescrição: ${taskDescription}`
    : `Título: ${taskTitle}`;

  const prompt = `
Com base na seguinte tarefa, sugira 3 a 5 subtarefas específicas e acionáveis:

${context}

Retorne APENAS um JSON válido com um array de strings:
["Subtarefa 1", "Subtarefa 2", "Subtarefa 3"]

Regras:
- Cada subtarefa deve ser específica e acionável
- Use linguagem clara e direta
- Foque em passos práticos para completar a tarefa principal
- Evite subtarefas muito genéricas como "Planejar" ou "Organizar"
- Máximo 5 subtarefas, mínimo 3

Exemplo:
["Reservar voos para a conferência", "Confirmar reserva do hotel", "Preparar apresentação dos slides", "Verificar documentação necessária"]
`;

  try {
    const result = await geminiModel!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Resposta da IA não contém JSON válido");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (
      !Array.isArray(parsed) ||
      !parsed.every((item) => typeof item === "string")
    ) {
      throw new Error("Formato de resposta inválido");
    }

    return parsed;
  } catch (error) {
    console.error("Erro ao sugerir subtarefas:", error);
    throw new Error("Falha ao gerar sugestões. Tente novamente.");
  }
}
