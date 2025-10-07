/**
 * Utilitários para manipulação de tarefas e IDs
 */

/**
 * Extrai o ID original da tarefa removendo sufixos de recorrência
 * @param taskId - ID da tarefa (pode ser original ou de recorrência)
 * @returns ID original da tarefa (UUID válido)
 */
export function extractOriginalTaskId(taskId: string): string {
  // Se o ID contém "_recurring_", extrai apenas a parte do UUID original
  if (taskId.includes("_recurring_")) {
    return taskId.split("_recurring_")[0];
  }
  return taskId;
}

/**
 * Verifica se um ID de tarefa é uma instância recorrente
 * @param taskId - ID da tarefa
 * @returns true se for uma instância recorrente
 */
export function isRecurringInstance(taskId: string): boolean {
  return taskId.includes("_recurring_");
}

/**
 * Gera um ID para uma instância recorrente
 * @param originalTaskId - ID original da tarefa
 * @param instanceDate - Data da instância
 * @returns ID da instância recorrente
 */
export function generateRecurringInstanceId(
  originalTaskId: string,
  instanceDate: Date
): string {
  return `${originalTaskId}_recurring_${instanceDate.getTime()}`;
}

/**
 * Valida se um ID é um UUID válido
 * @param id - ID para validar
 * @returns true se for um UUID válido
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Sanitiza um ID de tarefa para uso em APIs
 * @param taskId - ID da tarefa
 * @returns ID sanitizado (UUID válido)
 */
export function sanitizeTaskIdForAPI(taskId: string): string {
  const originalId = extractOriginalTaskId(taskId);

  if (!isValidUUID(originalId)) {
    console.warn(`ID de tarefa inválido: ${taskId}`);
    throw new Error(`ID de tarefa inválido: ${taskId}`);
  }

  return originalId;
}
