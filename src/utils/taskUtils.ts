export function extractOriginalTaskId(taskId: string): string {
  if (taskId.includes("_") && taskId.split("_").length === 2) {
    const parts = taskId.split("_");
    if (parts[1].match(/^\d{4}-\d{2}-\d{2}$/)) {
      return parts[0];
    }
  }

  if (taskId.includes("_recurring_")) {
    return taskId.split("_recurring_")[0];
  }

  return taskId;
}

export function isRecurringInstance(taskId: string): boolean {
  if (taskId.includes("_") && taskId.split("_").length === 2) {
    const parts = taskId.split("_");
    return parts[1].match(/^\d{4}-\d{2}-\d{2}$/) !== null;
  }

  return taskId.includes("_recurring_");
}

export function generateRecurringInstanceId(
  originalTaskId: string,
  instanceDate: Date
): string {
  return `${originalTaskId}_recurring_${instanceDate.getTime()}`;
}

export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function sanitizeTaskIdForAPI(taskId: string): string {
  const originalId = extractOriginalTaskId(taskId);

  if (!isValidUUID(originalId)) {
    console.warn(`ID de tarefa inválido: ${taskId}`);
    throw new Error(`ID de tarefa inválido: ${taskId}`);
  }

  return originalId;
}
