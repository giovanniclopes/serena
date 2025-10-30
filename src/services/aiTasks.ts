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
  const currentDateISO = currentDate.toISOString();

  const prompt = `
 ANALISE o texto abaixo e converta em JSON estruturado para criação de tarefa. Siga ESTRITAMENTE as regras listadas.
 
 IMPORTANTE:
 - SEMPRE retorne apenas o JSON, nunca adicione explicações, comentários, markdown ou texto fora do JSON!
 - Nunca use aspas duplas ("") dentro dos valores do JSON (em title, projectName, description, etc.). Se houver aspas duplas no texto de entrada, troque por aspas simples ou remova-as.
 
 DATA/HORA ATUAL (referência para datas relativas): ${currentDateISO}

 ENTRADA (real):
 "${input}"

 ENTRADA (exemplo 1):
 "Preciso criar uma apresentação para o board sobre vendas Q3 incluindo análise de receita, CAC, LTV, churn, metas Q4 e envio final até quinta. Anexar planilha de resultados e compartilhar link."
 
 SAÍDA (formato):
 {
   "title": "Apresentação de vendas Q3 para o board",
   "description": "Incluir análise de receita, CAC, LTV, churn e metas Q4. Anexar planilha de resultados, compartilhar link e enviar até quinta.",
   "dueDate": "2025-10-30T23:59:00"
 }
 
 ENTRADA (exemplo 2 com aspas):
 "marcar reunião hoje às 14:00 com o Alê (Ponto Forte) para tratarmos sobre o projeto "Reembolso", onde preciso mostrar a ele a alteração feita no Select das empresas. Também preciso confirmar se foi feito o necessário ou precisa de mais alguma coisa"
 
 SAÍDA ESPERADA:
 {
   "title": "Reunião projeto Reembolso com Alê (Ponto Forte)",
   "description": "Apresentar alteração no Select das empresas. Confirmar se as pendências estão resolvidas ou se há mais algo a ser feito. Reunião hoje às 14:00.",
   "dueDate": "${currentDateISO.split("T")[0]}T14:00:00",
   "projectName": "Reembolso"
 }
 
 REGRAS PARA O JSON:
 - title: objetivo, CLARO, curto (máx. 60 caracteres), SEM frases longas, SEM repetições, SEM emojis. Preferir infinitivo ou resumo. Nunca duplique em description. Nunca use aspas duplas internas.
 - description: contexto adicional, requisitos ou etapas; caso lista (mais de um requisito), use bullets (* ou -). Remova fluff, PII e repetições. Resuma e deixe conciso, mantendo o sentido do usuário. Nunca use aspas duplas internas.
 - dueDate: formato ISO (AAAA-MM-DDTHH:MM:SS), baseado em instruções (hoje/próxima semana/etc.), sempre considerando o fuso do usuário brasileiro.
 - priority: infira se texto indicar urgência/bloqueio/impacto. P1=urgente, P2=alta, P3=média, P4=baixa. Omitir se não souber.
 - projectName: extraia e normalize, ignorando stopwords tipo "de", "da", etc. Nunca use aspas duplas internas; se houver aspas duplas cite só o nome.
 - tags: sugerir se explícitas ou se houver palavras-chave recorrentes (máx. 5), nunca inventar.
 - subtasks: só sugerir se a tarefa for composta e complexa, máximo 5, nunca repetir.
 - recurrence: se padrão recorrente explícito, crie campo (ex: toda segunda, mensalmente...).
 - reminders: extrair lembretes se citados, sugerir lembrete próximo ao vencimento se importante.
 - links/anexos: se houver, liste URLs no fim da descrição sob bloco "Links/Anexos: ...".
 
 REGRAS AVANÇADAS:
 - Nunca reescreva o título/descricao com frases do tipo "tarefa para" ou "realizar"
 - Normalize unidades, use português BR, sem jargões obscuros ou linguagem burocrática
 - Não invente informação, não duplique o significado em diferentes campos
 - Se texto for ambíguo, inclua campo suggestions com perguntas objetivas ao usuário, mas nunca bloqueie a criação
 - Caso já exista tarefa igual no workspace (identificada por título), recomende deduplicar (em suggestions)
 - Capitalize apropriadamente: só a primeira letra ou nomes próprios
 - Nunca exponha dados pessoais, cartões, senhas, documentos sensíveis—remova ou oculte
 
 Caso a entrada seja muito simples, retorne JSON só com o campo title obrigatório (sem description).
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
          "Resposta da IA não contém JSON válido. Se usou aspas duplas em algum campo, remova ou troque por aspas simples.",
        suggestions: [
          'Edite a frase evitando uso de aspas duplas (") dentro do nome do projeto, título ou descrição. Ou use aspas simples.',
        ],
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
