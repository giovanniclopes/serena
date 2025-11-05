import { geminiModel, isGeminiAvailable } from "../lib/geminiClient";
import type { Task } from "../types";

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

export async function generateImplementationPrompt(
  task: Task
): Promise<string> {
  if (!isGeminiAvailable()) {
    throw new Error("IA não disponível");
  }

  try {
    checkRateLimit();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Limite de requisições excedido"
    );
  }

  const subtasksList =
    task.subtasks && task.subtasks.length > 0
      ? task.subtasks
          .map(
            (subtask, index) =>
              `${index + 1}. ${subtask.title}${
                subtask.description ? ` - ${subtask.description}` : ""
              }`
          )
          .join("\n")
      : "Nenhuma subtarefa definida";

  const taskDescription = task.description || "Sem descrição adicional";

  const prompt = `
Você é um especialista em engenharia de software e desenvolvimento de sistemas, além de ser um especialista em IA e fullstack. Você é capaz de criar códigos de forma profissional e detalhada se baseando, principalmente, no ecossistema da aplicação. Então antes de implementar faça uma análise profunda do ecossistema da aplicação e do problema a ser resolvido. Crie um prompt de implementação profissional e detalhado baseado na seguinte tarefa:

TÍTULO DA TAREFA:
${task.title}

DESCRIÇÃO:
${taskDescription}

SUBTAREFAS:
${subtasksList}

INSTRUÇÕES PARA O PROMPT:
Crie um prompt de implementação completo que siga as melhores práticas de:
- Arquitetura de software (SOLID, Clean Architecture, Design Patterns)
- Padrões de código (nomenclatura, organização, estrutura)
- Documentação (código, APIs, README)
- Acessibilidade (WCAG, ARIA, semântica HTML)
- Performance (otimização, lazy loading, caching)
- Segurança (validação, sanitização, autenticação)
- UX/UI moderna (design responsivo, feedback visual, estados de loading)

O prompt deve ser:
1. Claro e objetivo
2. Específico sobre os requisitos técnicos
3. Incluir considerações de UI/UX
4. Mencionar boas práticas relevantes
5. Incluir requisitos de acessibilidade

FORMATO DE SAÍDA:
Retorne APENAS o prompt de implementação, sem explicações adicionais, sem markdown, sem código. O prompt deve ser direto e pronto para uso. Não deve conter nenhum comentário ou explicação adicional.
`;

  try {
    const result = await geminiModel!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("Erro ao gerar prompt de implementação:", error);
    throw new Error("Falha ao gerar prompt. Tente novamente.");
  }
}
