export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatSecondsCompact(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

export function calculateAverageTime(
  tasks: { totalTimeSpent: number }[]
): number {
  if (tasks.length === 0) return 0;
  const total = tasks.reduce((sum, task) => sum + task.totalTimeSpent, 0);
  return Math.floor(total / tasks.length);
}

export function getTotalTime(tasks: { totalTimeSpent: number }[]): number {
  return tasks.reduce((sum, task) => sum + task.totalTimeSpent, 0);
}
