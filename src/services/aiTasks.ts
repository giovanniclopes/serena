import { geminiModel, isGeminiAvailable } from "../lib/geminiClient";
import { validateDateTime, validateProject } from "../utils/validation";

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
  input: string,
  availableProjects?: Array<{ id: string; name: string }>
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

  const currentDate = new Date();
  const currentDateString = currentDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `
Analise o seguinte texto em linguagem natural e extraia informações estruturadas para uma tarefa.

Data atual: ${currentDateString} (${currentDate.toISOString().split("T")[0]})

Texto: "${input}"

Retorne APENAS um JSON válido com os seguintes campos:
- title: string (título objetivo, curto, CLARO e descritivo da tarefa, com no máximo 60 caracteres. Não repita frases extensas ou informações excessivas aqui—apenas um resumo direto do objetivo principal.)
- description: string (opcional, gerar apenas se necessário: inclua aqui informações adicionais, requisitos, contexto ou detalhes do prompt original que NÃO couberam no título. Sempre reescreva de modo mais conciso, SEM PERDER O SENTIDO E O OBJETIVO do usuário. Resuma sem modificar o contexto e nunca repita o título aqui)
- dueDate: string (opcional, formato ISO 8601, ex: "2024-01-15T14:00:00")
- priority: string (opcional, "P1", "P2", "P3" ou "P4")
- projectName: string (opcional, nome do projeto mencionado)

Regras para títulos e descrições:
- O título NUNCA deve ultrapassar 60 caracteres, ser genérico ou repetitivo.
- O texto inserido muito grande ou cheio de detalhes deve ser dividido: extraia o objetivo principal como título e transfira todas as outras orientações/contexto para a descrição.
- Na descrição: Resuma o que for possível mantendo o significado. Melhore a clareza, nunca altere a intenção.
- NUNCA coloque frases enormes no título.
- Exemplo: Se o texto recebido for muito longo, produza um título enxuto e passe os detalhes para a descrição:

Exemplo de entrada longa:
"Escrever uma análise detalhada sobre o impacto das tecnologias verdes nos processos industriais e criar um checklist de ações sustentáveis para as operações da fábrica ABC até o final do trimestre. Não esquecer de citar cases reais e sugerir metas para redução de emissão de CO2."

Exemplo de resposta:
{
  "title": "Análise do impacto de tecnologias verdes nas indústrias",
  "description": "Criar checklist de ações sustentáveis para a fábrica ABC até o fim do trimestre, citar cases reais e sugerir metas de redução de CO2.",
  "dueDate": "2024-03-31T23:59:00"
}

Regras para datas:
- "amanhã" = próxima data após hoje (${
    new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  })
- "próxima semana" = data da próxima semana
- Use sempre a data atual como referência para datas relativas
- Se não houver data específica, omita dueDate

Regras para projetos:
- Extraia o nome do projeto exatamente como mencionado
- Se mencionar "no projeto X" ou "projeto X", use "X" como projectName
- Mantenha a capitalização original do nome do projeto
- Se não mencionar projeto, omita projectName

Regras gerais:
- Prioridade: P1=urgente, P2=alta, P3=média, P4=baixa
- Se não mencionar prioridade, omita o campo
- Seja conciso mas preciso
- SEMPRE extraia pelo menos o título da tarefa
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

    const validationErrors: string[] = [];
    const validationSuggestions: string[] = [];

    if (parsed.dueDate) {
      const dateValidation = validateDateTime(parsed.dueDate);
      if (!dateValidation.isValid) {
        validationErrors.push(dateValidation.error || "Data inválida");
        if (dateValidation.suggestion) {
          validationSuggestions.push(dateValidation.suggestion);
        }
        delete parsed.dueDate;
      }
    }

    if (parsed.projectName && availableProjects) {
      const projectValidation = validateProject(
        parsed.projectName,
        availableProjects
      );
      if (!projectValidation.isValid) {
        validationErrors.push(projectValidation.error || "Projeto inválido");
        if (projectValidation.suggestion) {
          validationSuggestions.push(projectValidation.suggestion);
        }
        delete parsed.projectName;
      } else if (projectValidation.suggestion) {
        validationSuggestions.push(projectValidation.suggestion);
      }
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join("; "),
        partialData: parsed,
        suggestions: validationSuggestions,
      };
    }

    return {
      success: true,
      data: parsed,
      suggestions:
        validationSuggestions.length > 0 ? validationSuggestions : undefined,
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
