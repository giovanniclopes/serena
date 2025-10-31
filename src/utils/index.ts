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
  Project,
  ShoppingList,
  Task,
} from "../types";
import { getRecurringTaskInstancesForDate } from "./recurrenceUtils";
export { isRecurringInstance } from "./taskUtils";

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
    if (!task.dueDate || task.recurrence) return;

    if (isSameDay(task.dueDate, date)) {
      allTasks.push(task);
    }
  });

  const recurringInstances = getRecurringTaskInstancesForDate(tasks, date);
  allTasks.push(...recurringInstances);

  return sortTasksByPriority(allTasks);
}

export function getTasksForWeek(tasks: Task[], startDate: Date): Task[] {
  const endDate = addDays(startDate, 6);
  const weekTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isWithinInterval(task.dueDate, { start: startDate, end: endDate });
  });
  return sortTasksByPriority(weekTasks);
}

export function getTasksForMonth(tasks: Task[], date: Date): Task[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const monthTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    return isWithinInterval(task.dueDate, { start, end });
  });
  return sortTasksByPriority(monthTasks);
}

export function getTodayTasks(tasks: Task[]): Task[] {
  return getTasksForDate(tasks, new Date());
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = startOfDay(new Date());
  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.isCompleted) return false;
    return task.dueDate < today;
  });
  return sortTasksByPriority(overdueTasks);
}

export function getUpcomingTasks(tasks: Task[], days: number = 7): Task[] {
  const today = startOfDay(new Date());
  const future = addDays(today, days);
  const upcomingTasks = tasks.filter((task) => {
    if (!task.dueDate || task.isCompleted) return false;
    return isWithinInterval(task.dueDate, { start: today, end: future });
  });
  return sortTasksByPriority(upcomingTasks);
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };

  return tasks.sort((a, b) => {
    const priorityA =
      priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
    const priorityB =
      priorityOrder[b.priority as keyof typeof priorityOrder] || 5;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function filterTasks(
  tasks: Task[],
  filter: Filter,
  applySorting: boolean = true,
  sharedTaskIds: string[] = []
): Task[] {
  let filtered = tasks;

  if (filter.workspaceId) {
    filtered = filtered.filter(
      (task) =>
        task.workspaceId === filter.workspaceId ||
        sharedTaskIds.includes(task.id)
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

  return applySorting ? sortTasksByPriority(filtered) : filtered;
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks;

  const searchTerm = query.toLowerCase();
  const searchResults = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm))
  );
  return sortTasksByPriority(searchResults);
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
  let timeout: number;
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

  return habits.filter((habit) => {
    if (habit.recurrenceType === "infinite") {
      return true;
    }

    if (habit.recurrenceType === "until_date" && habit.recurrenceEndDate) {
      const today = startOfDay(new Date());
      return habit.recurrenceEndDate >= today;
    }

    return true;
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
    return countdown.targetDate > now;
  });
}

export function searchShoppingLists(
  shoppingLists: ShoppingList[],
  query: string
): ShoppingList[] {
  if (!query.trim()) return shoppingLists;

  const searchTerm = query.toLowerCase();
  return shoppingLists.filter(
    (list) =>
      list.name.toLowerCase().includes(searchTerm) ||
      (list.description &&
        list.description.toLowerCase().includes(searchTerm)) ||
      list.category.toLowerCase().includes(searchTerm)
  );
}

export function filterShoppingLists(
  shoppingLists: ShoppingList[],
  showCompleted: boolean
): ShoppingList[] {
  if (showCompleted) return shoppingLists;

  return shoppingLists.filter((list) => !list.isCompleted);
}
