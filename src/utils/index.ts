import {
  addDays,
  endOfMonth,
  format,
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
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isSameDay(task.dueDate, date);
  });
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
  const dayEntries = getHabitEntriesForDate(entries, date);
  const totalValue = dayEntries.reduce((sum, entry) => sum + entry.value, 0);
  return Math.min(totalValue / habit.target, 1);
}

export function getHabitStreak(habit: Habit, entries: HabitEntry[]): number {
  const sortedEntries = entries
    .filter((entry) => entry.habitId === habit.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  let streak = 0;
  let currentDate = startOfDay(new Date());

  for (const entry of sortedEntries) {
    if (isSameDay(entry.date, currentDate)) {
      if (entry.value >= habit.target) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    } else if (entry.date < currentDate) {
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
