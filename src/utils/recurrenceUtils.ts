import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import type { Recurrence, RecurringTaskCompletion, Task } from "../types";

const STORAGE_KEY = "recurring_task_completions";

export function getRecurringTaskCompletions(): RecurringTaskCompletion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveRecurringTaskCompletions(
  completions: RecurringTaskCompletion[]
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completions));
  } catch (error) {
    console.error("Erro ao salvar completions de tasks recorrentes:", error);
  }
}

export function markRecurringTaskInstanceComplete(
  taskId: string,
  date: Date,
  isCompleted: boolean = true
): void {
  const completions = getRecurringTaskCompletions();
  const dateKey = format(date, "yyyy-MM-dd");

  const existingIndex = completions.findIndex(
    (c) => c.taskId === taskId && c.date === dateKey
  );

  if (isCompleted) {
    const completion: RecurringTaskCompletion = {
      taskId,
      date: dateKey,
      isCompleted: true,
      completedAt: new Date(),
    };

    if (existingIndex >= 0) {
      completions[existingIndex] = completion;
    } else {
      completions.push(completion);
    }
  } else {
    if (existingIndex >= 0) {
      completions.splice(existingIndex, 1);
    }
  }

  saveRecurringTaskCompletions(completions);
}

export function isRecurringTaskInstanceCompleted(
  taskId: string,
  date: Date
): boolean {
  const completions = getRecurringTaskCompletions();
  const dateKey = format(date, "yyyy-MM-dd");

  return completions.some(
    (c) => c.taskId === taskId && c.date === dateKey && c.isCompleted
  );
}

export function shouldTaskAppearOnDate(task: Task, targetDate: Date): boolean {
  if (!task.recurrence || !task.dueDate) {
    return false;
  }

  const recurrence = task.recurrence;
  const startBase = recurrence.startDate
    ? startOfDay(new Date(recurrence.startDate))
    : startOfDay(task.dueDate);
  const target = startOfDay(targetDate);

  if (
    recurrence.excludeWeekends &&
    (target.getDay() === 0 || target.getDay() === 6)
  ) {
    return false;
  }

  if (isBefore(target, startBase)) {
    return false;
  }

  if (recurrence.endType === "date" && recurrence.endDate) {
    const endDate = startOfDay(recurrence.endDate);
    if (isAfter(target, endDate)) {
      return false;
    }
  }

  if (recurrence.endType === "count" && recurrence.endCount && recurrence.endCount > 0) {
    let occurrences = 0;
    let current = startBase;
    const safetyLimit = 10000;
    let steps = 0;

    while (steps < safetyLimit && !isAfter(current, target)) {
      const appears = (() => {
        switch (recurrence.type) {
          case "daily":
            return shouldAppearDaily(startBase, current, recurrence);
          case "weekly":
            return shouldAppearWeekly(startBase, current, recurrence);
          case "monthly":
            return shouldAppearMonthly(startBase, current, recurrence);
          case "yearly":
            return shouldAppearYearly(startBase, current, recurrence);
          default:
            return false;
        }
      })();

      if (appears) {
        occurrences++;
        if (occurrences > recurrence.endCount) {
          return false;
        }
        if (current.getTime() === target.getTime()) {
          return true;
        }
      }

      switch (recurrence.type) {
        case "daily":
          current = addDays(current, 1);
          break;
        case "weekly":
          current = addDays(current, 1);
          break;
        case "monthly":
          current = addDays(current, 1);
          break;
        case "yearly":
          current = addDays(current, 1);
          break;
        default:
          return false;
      }

      steps++;
    }

    return false;
  }

  switch (recurrence.type) {
    case "daily":
      return shouldAppearDaily(startBase, target, recurrence);
    case "weekly":
      return shouldAppearWeekly(startBase, target, recurrence);
    case "monthly":
      return shouldAppearMonthly(startBase, target, recurrence);
    case "yearly":
      return shouldAppearYearly(startBase, target, recurrence);
    default:
      return false;
  }
}

function shouldAppearDaily(
  originalDate: Date,
  targetDate: Date,
  recurrence: Recurrence
): boolean {
  const interval = recurrence.interval || 1;
  const daysDiff = Math.floor(
    (targetDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDiff >= 0 && daysDiff % interval === 0;
}

function shouldAppearWeekly(
  originalDate: Date,
  targetDate: Date,
  recurrence: Recurrence
): boolean {
  const interval = recurrence.interval || 1;
  const daysOfWeek = recurrence.daysOfWeek || [originalDate.getDay()];

  if (!daysOfWeek.includes(targetDate.getDay())) {
    return false;
  }

  const weeksDiff = Math.floor(
    (targetDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );

  return weeksDiff >= 0 && weeksDiff % interval === 0;
}

function shouldAppearMonthly(
  originalDate: Date,
  targetDate: Date,
  recurrence: Recurrence
): boolean {
  const interval = recurrence.interval || 1;
  const dayOfMonth = recurrence.dayOfMonth || originalDate.getDate();

  if (targetDate.getDate() !== dayOfMonth) {
    return false;
  }

  const monthsDiff =
    (targetDate.getFullYear() - originalDate.getFullYear()) * 12 +
    (targetDate.getMonth() - originalDate.getMonth());

  return monthsDiff >= 0 && monthsDiff % interval === 0;
}

function shouldAppearYearly(
  originalDate: Date,
  targetDate: Date,
  recurrence: Recurrence
): boolean {
  const interval = recurrence.interval || 1;

  if (
    targetDate.getDate() !== originalDate.getDate() ||
    targetDate.getMonth() !== originalDate.getMonth()
  ) {
    return false;
  }

  const yearsDiff = targetDate.getFullYear() - originalDate.getFullYear();
  return yearsDiff >= 0 && yearsDiff % interval === 0;
}

export function getRecurringTaskInstancesForDate(
  tasks: Task[],
  targetDate: Date
): Task[] {
  const recurringTasks = tasks.filter((task) => task.recurrence);
  const instances: Task[] = [];

  for (const task of recurringTasks) {
    if (shouldTaskAppearOnDate(task, targetDate)) {
      const instanceCompleted = isRecurringTaskInstanceCompleted(
        task.id,
        targetDate
      );

      const isCompleted = instanceCompleted || task.isCompleted;

      const instance: Task = {
        ...task,
        id: `${task.id}_${format(targetDate, "yyyy-MM-dd")}`,
        dueDate: targetDate,
        isCompleted,
        completedAt: isCompleted
          ? instanceCompleted
            ? new Date()
            : task.completedAt
          : undefined,
        subtasks: task.subtasks || [],
      };

      instances.push(instance);
    }
  }

  return instances;
}

export function getNextRecurringDate(
  task: Task,
  fromDate: Date = new Date()
): Date | null {
  if (!task.recurrence || !task.dueDate) {
    return null;
  }

  const recurrence = task.recurrence;
  const originalDate = recurrence.startDate
    ? startOfDay(new Date(recurrence.startDate))
    : startOfDay(task.dueDate);
  const start = startOfDay(fromDate);

  if (recurrence.endType === "date" && recurrence.endDate) {
    const endDate = startOfDay(recurrence.endDate);
    if (isAfter(start, endDate)) {
      return null;
    }
  }

  let currentDate = isBefore(start, originalDate) ? originalDate : start;
  const maxIterations = 1000;
  let iterations = 0;
  let occurrences = 0;

  while (iterations < maxIterations) {
    if (shouldTaskAppearOnDate(task, currentDate)) {
      occurrences++;
      if (recurrence.endType === "count" && recurrence.endCount && occurrences > recurrence.endCount) {
        return null;
      }
      return currentDate;
    }

    switch (recurrence.type) {
      case "daily":
        currentDate = addDays(currentDate, 1);
        break;
      case "weekly":
        currentDate = addWeeks(currentDate, 1);
        break;
      case "monthly":
        currentDate = addMonths(currentDate, 1);
        break;
      case "yearly":
        currentDate = addYears(currentDate, 1);
        break;
      default:
        return null;
    }

    if (recurrence.endType === "date" && recurrence.endDate) {
      const endDate = startOfDay(recurrence.endDate);
      if (isAfter(currentDate, endDate)) {
        return null;
      }
    }

    iterations++;
  }

  return null;
}

export function getRecurringTaskInstancesForDateRange(
  tasks: Task[],
  startDate: Date,
  endDate: Date
): { [date: string]: Task[] } {
  const result: { [date: string]: Task[] } = {};
  const current = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (current <= end) {
    const dateKey = format(current, "yyyy-MM-dd");
    result[dateKey] = getRecurringTaskInstancesForDate(tasks, current);
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export function getRecurrenceDescription(recurrence: Recurrence): string {
  const { type, interval, daysOfWeek, dayOfMonth, endType, endCount, endDate } =
    recurrence;

  let description = "";

  if (interval > 1) {
    description += `A cada ${interval} `;
  } else {
    description += "A cada ";
  }

  switch (type) {
    case "daily":
      description += interval === 1 ? "dia" : "dias";
      break;
    case "weekly":
      description += interval === 1 ? "semana" : "semanas";
      if (daysOfWeek && daysOfWeek.length > 0) {
        const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const selectedDays = daysOfWeek.map((day) => weekDays[day]).join(", ");
        description += ` (${selectedDays})`;
      }
      break;
    case "monthly":
      description += interval === 1 ? "mês" : "meses";
      if (dayOfMonth) {
        description += ` (dia ${dayOfMonth})`;
      }
      break;
    case "yearly":
      description += interval === 1 ? "ano" : "anos";
      break;
  }

  if (endType === "date" && endDate) {
    description += ` até ${format(endDate, "dd/MM/yyyy")}`;
  } else if (endType === "count") {
    description += ` (${endCount} ocorrências)`;
  }

  if (recurrence.excludeWeekends) {
    description += " (sem finais de semana)";
  }

  return description;
}
