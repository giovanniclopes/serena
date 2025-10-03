import {
  addDays,
  endOfMonth,
  format,
  isAfter,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  CalendarEvent,
  Countdown,
  Filter,
  Habit,
  HabitEntry,
  Priority,
  Project,
  Recurrence,
  Task,
} from "../types";

export function formatDate(
  date: Date,
  formatStr: string = "dd/MM/yyyy"
): string {
  return format(date, formatStr, { locale: ptBR });
}

export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

export function formatDateTime(date: Date): string {
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function getPriorityColor(priority: Priority): string {
  const colors = {
    P1: "#ef4444",
    P2: "#f59e0b",
    P3: "#3b82f6",
    P4: "#6b7280",
  };
  return colors[priority];
}

export function getPriorityLabel(priority: Priority): string {
  const labels = {
    P1: "Urgente",
    P2: "Alta",
    P3: "Média",
    P4: "Baixa",
  };
  return labels[priority];
}

export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  const allTasks: Task[] = [];

  tasks.forEach((task) => {
    if (!task.dueDate) return;

    // Tarefa original
    if (isSameDay(task.dueDate, date)) {
      allTasks.push(task);
    }

    // Tarefas recorrentes
    if (task.recurrence) {
      const recurringInstances = generateRecurringInstances(task, date);
      allTasks.push(...recurringInstances);
    }
  });

  return allTasks;
}

/**
 * Gera instâncias de uma tarefa recorrente para uma data específica
 */
function generateRecurringInstances(task: Task, targetDate: Date): Task[] {
  if (!task.recurrence || !task.dueDate) {
    return [];
  }

  const instances: Task[] = [];
  const recurrence = task.recurrence;
  const originalDate = task.dueDate;

  // Converter endDate para Date se necessário
  if (recurrence.endDate && !(recurrence.endDate instanceof Date)) {
    recurrence.endDate = new Date(recurrence.endDate);
  }

  // Verificar se a data alvo está dentro do período de recorrência
  if (
    recurrence.endType === "date" &&
    recurrence.endDate &&
    recurrence.endDate instanceof Date &&
    isAfter(targetDate, recurrence.endDate)
  ) {
    return instances;
  }

  // Gerar instâncias baseadas no tipo de recorrência
  switch (recurrence.type) {
    case "daily":
      instances.push(
        ...generateDailyInstances(task, originalDate, targetDate, recurrence)
      );
      break;
    case "weekly":
      instances.push(
        ...generateWeeklyInstances(task, originalDate, targetDate, recurrence)
      );
      break;
    case "monthly":
      instances.push(
        ...generateMonthlyInstances(task, originalDate, targetDate, recurrence)
      );
      break;
    case "yearly":
      instances.push(
        ...generateYearlyInstances(task, originalDate, targetDate, recurrence)
      );
      break;
  }

  return instances;
}

function generateDailyInstances(
  task: Task,
  originalDate: Date,
  targetDate: Date,
  recurrence: Recurrence
): Task[] {
  const instances: Task[] = [];
  const interval = recurrence.interval || 1;

  // Calcular quantos dias se passaram desde a data original
  const daysDiff = Math.floor(
    (targetDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Verificar se a data alvo corresponde ao padrão de recorrência
  if (daysDiff >= 0 && daysDiff % interval === 0) {
    const instanceDate = addDays(originalDate, daysDiff);
    if (isSameDay(instanceDate, targetDate)) {
      instances.push(createRecurringInstance(task, instanceDate));
    }
  }

  return instances;
}

function generateWeeklyInstances(
  task: Task,
  originalDate: Date,
  targetDate: Date,
  recurrence: Recurrence
): Task[] {
  const instances: Task[] = [];
  const interval = recurrence.interval || 1;
  const daysOfWeek = recurrence.daysOfWeek || [];

  // Se não há dias específicos, usar o dia da semana original
  if (daysOfWeek.length === 0) {
    daysOfWeek.push(originalDate.getDay());
  }

  // Verificar se o dia da semana da data alvo está nos dias permitidos
  if (daysOfWeek.includes(targetDate.getDay())) {
    // Calcular quantas semanas se passaram desde a data original
    const weeksDiff = Math.floor(
      (targetDate.getTime() - originalDate.getTime()) /
        (1000 * 60 * 60 * 24 * 7)
    );

    if (weeksDiff >= 0 && weeksDiff % interval === 0) {
      const instanceDate = addDays(originalDate, weeksDiff * 7);
      if (isSameDay(instanceDate, targetDate)) {
        instances.push(createRecurringInstance(task, instanceDate));
      }
    }
  }

  return instances;
}

function generateMonthlyInstances(
  task: Task,
  originalDate: Date,
  targetDate: Date,
  recurrence: Recurrence
): Task[] {
  const instances: Task[] = [];
  const interval = recurrence.interval || 1;
  const dayOfMonth = recurrence.dayOfMonth || originalDate.getDate();

  // Verificar se o dia do mês corresponde
  if (targetDate.getDate() === dayOfMonth) {
    // Calcular quantos meses se passaram desde a data original
    const monthsDiff =
      (targetDate.getFullYear() - originalDate.getFullYear()) * 12 +
      (targetDate.getMonth() - originalDate.getMonth());

    if (monthsDiff >= 0 && monthsDiff % interval === 0) {
      instances.push(createRecurringInstance(task, targetDate));
    }
  }

  return instances;
}

function generateYearlyInstances(
  task: Task,
  originalDate: Date,
  targetDate: Date,
  recurrence: Recurrence
): Task[] {
  const instances: Task[] = [];
  const interval = recurrence.interval || 1;

  // Verificar se o dia e mês correspondem
  if (
    targetDate.getDate() === originalDate.getDate() &&
    targetDate.getMonth() === originalDate.getMonth()
  ) {
    // Calcular quantos anos se passaram desde a data original
    const yearsDiff = targetDate.getFullYear() - originalDate.getFullYear();

    if (yearsDiff >= 0 && yearsDiff % interval === 0) {
      instances.push(createRecurringInstance(task, targetDate));
    }
  }

  return instances;
}

function createRecurringInstance(originalTask: Task, instanceDate: Date): Task {
  return {
    ...originalTask,
    id: `${originalTask.id}_recurring_${instanceDate.getTime()}`,
    dueDate: instanceDate,
    // Marcar como instância recorrente para identificação
    isRecurringInstance: true,
  } as Task & { isRecurringInstance: boolean };
}

export function getTasksForWeek(tasks: Task[], startDate: Date): Task[] {
  const endDate = addDays(startDate, 6);
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isWithinInterval(task.dueDate, { start: startDate, end: endDate });
  });
}

export function getTasksForMonth(tasks: Task[], date: Date): Task[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isWithinInterval(task.dueDate, { start, end });
  });
}

export function getTodayTasks(tasks: Task[]): Task[] {
  return getTasksForDate(tasks, new Date());
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = startOfDay(new Date());
  return tasks.filter((task) => {
    if (!task.dueDate || task.isCompleted) return false;
    return task.dueDate < today;
  });
}

export function getUpcomingTasks(tasks: Task[], days: number = 7): Task[] {
  const today = startOfDay(new Date());
  const future = addDays(today, days);
  return tasks.filter((task) => {
    if (!task.dueDate || task.isCompleted) return false;
    return isWithinInterval(task.dueDate, { start: today, end: future });
  });
}

export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  let filtered = tasks;

  if (filter.workspaceId) {
    filtered = filtered.filter(
      (task) => task.workspaceId === filter.workspaceId
    );
  }

  if (filter.projectIds && filter.projectIds.length > 0) {
    filtered = filtered.filter(
      (task) => task.projectId && filter.projectIds!.includes(task.projectId)
    );
  }

  if (filter.tagIds && filter.tagIds.length > 0) {
    filtered = filtered.filter((task) =>
      task.tags.some((tagId) => filter.tagIds!.includes(tagId))
    );
  }

  if (filter.priorities && filter.priorities.length > 0) {
    filtered = filtered.filter((task) =>
      filter.priorities!.includes(task.priority)
    );
  }

  if (filter.dateRange) {
    filtered = filtered.filter((task) => {
      if (!task.dueDate) return false;
      return isWithinInterval(task.dueDate, filter.dateRange!);
    });
  }

  if (filter.isCompleted !== undefined) {
    filtered = filtered.filter(
      (task) => task.isCompleted === filter.isCompleted
    );
  }

  return filtered;
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks;

  const searchTerm = query.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm))
  );
}

export function getHabitEntriesForDate(
  entries: HabitEntry[],
  date: Date
): HabitEntry[] {
  return entries.filter((entry) => isSameDay(entry.date, date));
}

export function getHabitProgress(
  habit: Habit,
  entries: HabitEntry[],
  date: Date
): number {
  const normalizedDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  const dayEntries = entries.filter((entry) => {
    const entryDate = new Date(
      Date.UTC(
        entry.date.getUTCFullYear(),
        entry.date.getUTCMonth(),
        entry.date.getUTCDate()
      )
    );
    return (
      entry.habitId === habit.id &&
      entryDate.getTime() === normalizedDate.getTime()
    );
  });

  const totalValue = dayEntries.reduce((sum, entry) => sum + entry.value, 0);
  const progress = Math.min(totalValue / habit.target, 1);

  return progress;
}

export function getHabitStreak(habit: Habit, entries: HabitEntry[]): number {
  const sortedEntries = entries
    .filter((entry) => entry.habitId === habit.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  let streak = 0;
  let currentDate = startOfDay(new Date());

  for (const entry of sortedEntries) {
    const entryDate = new Date(
      Date.UTC(
        entry.date.getUTCFullYear(),
        entry.date.getUTCMonth(),
        entry.date.getUTCDate()
      )
    );
    const normalizedCurrentDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate()
      )
    );

    if (entryDate.getTime() === normalizedCurrentDate.getTime()) {
      if (entry.value >= habit.target) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    } else if (entryDate < normalizedCurrentDate) {
      break;
    }
  }

  return streak;
}

export function getCountdownDays(countdown: Countdown): number {
  const now = new Date();
  const diffTime = countdown.targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function createCalendarEvents(
  tasks: Task[],
  countdowns: Countdown[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  tasks.forEach((task) => {
    if (task.dueDate) {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate,
        time: task.dueDate,
        type: "task",
        priority: task.priority,
        color: task.projectId ? "#ec4899" : getPriorityColor(task.priority),
        projectId: task.projectId,
      });
    }
  });

  countdowns.forEach((countdown) => {
    events.push({
      id: `countdown-${countdown.id}`,
      title: countdown.title,
      date: countdown.targetDate,
      type: "countdown",
      color: countdown.color,
    });
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function searchProjects(projects: Project[], query: string): Project[] {
  if (!query.trim()) return projects;

  const searchTerm = query.toLowerCase();
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm) ||
      (project.description &&
        project.description.toLowerCase().includes(searchTerm))
  );
}

export function filterProjects(
  projects: Project[],
  showCompleted: boolean
): Project[] {
  if (showCompleted) return projects;

  return projects.filter((project) => {
    const completionPercentage =
      project.tasksTotalCount > 0
        ? Math.round(
            (project.tasksCompletedCount / project.tasksTotalCount) * 100
          )
        : 0;
    return completionPercentage < 100;
  });
}

export function searchHabits(habits: Habit[], query: string): Habit[] {
  if (!query.trim()) return habits;

  const searchTerm = query.toLowerCase();
  return habits.filter(
    (habit) =>
      habit.name.toLowerCase().includes(searchTerm) ||
      (habit.description &&
        habit.description.toLowerCase().includes(searchTerm)) ||
      habit.category.toLowerCase().includes(searchTerm)
  );
}

export function filterHabits(habits: Habit[], showCompleted: boolean): Habit[] {
  if (showCompleted) return habits;

  return habits.filter(() => {
    // Para hábitos, consideramos "concluído" se atingiu a meta hoje
    // Esta lógica pode ser refinada baseada na implementação específica
    return true; // Por enquanto, mostramos todos os hábitos
  });
}

export function searchCountdowns(
  countdowns: Countdown[],
  query: string
): Countdown[] {
  if (!query.trim()) return countdowns;

  const searchTerm = query.toLowerCase();
  return countdowns.filter(
    (countdown) =>
      countdown.title.toLowerCase().includes(searchTerm) ||
      (countdown.description &&
        countdown.description.toLowerCase().includes(searchTerm))
  );
}

export function filterCountdowns(
  countdowns: Countdown[],
  showCompleted: boolean
): Countdown[] {
  if (showCompleted) return countdowns;

  return countdowns.filter((countdown) => {
    const now = new Date();
    return countdown.targetDate > now; // Mostrar apenas countdowns futuros
  });
}
