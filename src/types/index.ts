export type Priority = "P1" | "P2" | "P3" | "P4";

export type UserStatus = "active" | "inactive" | "suspended";

export type RecurrenceType =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export type RecurrenceEndType = "never" | "date" | "count";

export interface Recurrence {
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endType: RecurrenceEndType;
  endDate?: Date;
  endCount?: number;
}

export interface Reminder {
  id: string;
  type: "before" | "at";
  value: number;
  unit: "minutes" | "hours" | "days";
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface TimeEntry {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  workspaceId: string;
  tasksCompletedCount: number;
  tasksTotalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  parentTaskId?: string;
  subtasks: Task[];
  dueDate?: Date;
  priority: Priority;
  reminders: Reminder[];
  recurrence?: Recurrence;
  tags: string[];
  attachments: Attachment[];
  isCompleted: boolean;
  completedAt?: Date;
  workspaceId: string;
  order: number;
  timeEntries: TimeEntry[];
  totalTimeSpent: number;
  isTimerRunning: boolean;
  currentSessionStart?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringTaskInstance {
  taskId: string;
  date: Date;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface RecurringTaskCompletion {
  taskId: string;
  date: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type HabitFrequency = "day" | "week" | "month";

export type HabitRecurrenceType = "infinite" | "duration" | "until_date";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  target: number;
  unit: string;
  frequency: HabitFrequency;
  recurrenceType: HabitRecurrenceType;
  recurrenceDuration?: number;
  recurrenceDurationUnit?: "days" | "weeks" | "months";
  recurrenceEndDate?: Date;
  color: string;
  icon?: string;
  category: string;
  reminders: Reminder[];
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: Date;
  value: number;
  notes?: string;
}

export interface Countdown {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  color: string;
  icon?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

export interface Filter {
  id: string;
  name: string;
  projectIds?: string[];
  tagIds?: string[];
  priorities?: Priority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  isCompleted?: boolean;
  workspaceId: string;
}

export interface AppState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  projects: Project[];
  tasks: Task[];
  habits: Habit[];
  habitEntries: HabitEntry[];
  countdowns: Countdown[];
  shoppingLists: ShoppingList[];
  tags: Tag[];
  filters: Filter[];
  currentTheme: Theme;
  availableThemes: Theme[];
  workspaceChanging: boolean;
}

export type ViewMode = "today" | "week" | "month" | "list";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: Date;
  type: "task" | "habit" | "countdown";
  priority?: Priority;
  color: string;
  projectId?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  birthDate?: Date;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  birthDate?: Date;
  status?: UserStatus;
}

export interface UpdateUserProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  birthDate?: Date;
  status?: UserStatus;
}

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  icon?: string;
  location?: string;
  isCompleted: boolean;
  completedAt?: Date;
  workspaceId: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: string;
  notes?: string;
  price?: number;
  isPurchased: boolean;
  purchasedAt?: Date;
  actualPrice?: number;
  orderIndex: number;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShoppingListData {
  name: string;
  description?: string;
  category: string;
  color: string;
  icon?: string;
  workspaceId: string;
}

export interface UpdateShoppingListData {
  name?: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
}

export interface CreateShoppingListItemData {
  shoppingListId: string;
  name: string;
  quantity?: string;
  notes?: string;
  price?: number;
  orderIndex?: number;
  workspaceId: string;
}

export interface UpdateShoppingListItemData {
  name?: string;
  quantity?: string;
  notes?: string;
  price?: number;
  isPurchased?: boolean;
  actualPrice?: number;
  orderIndex?: number;
}

export interface ShoppingStatistics {
  totalSpent: number;
  totalLists: number;
  completedLists: number;
  averageListValue: number;
  spendingByCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  mostPurchasedItems: Array<{
    name: string;
    count: number;
    totalSpent: number;
  }>;
  spendingByMonth: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  topLocations: Array<{
    location: string;
    amount: number;
    count: number;
  }>;
}

export type ShareRole = "viewer" | "editor";

export interface TaskShare {
  id: string;
  taskId: string;
  sharedWithUserId: string;
  role: ShareRole;
  createdAt: Date;
}
