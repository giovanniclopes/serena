import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useHabitEntries, useHabits } from "../features/habits/useHabits";
import { useProjects } from "../features/projects/useProjects";
import { useTasks } from "../features/tasks/useTasks";
import {
  ACHIEVEMENTS,
  type Achievement,
  type AchievementProgress,
} from "../types/achievements";
import { useCelebrationSound } from "./useCelebrationSound";
import { useConfetti } from "./useConfetti";

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { entries: habitEntries } = useHabitEntries();
  const { projects } = useProjects();
  const { triggerCelebration } = useConfetti();
  const { playAchievementSound, playMilestoneSound } = useCelebrationSound();

  useEffect(() => {
    const savedAchievements = localStorage.getItem("serena_achievements");
    const savedProgress = localStorage.getItem("serena_achievement_progress");

    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      const initialAchievements = ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        currentProgress: 0,
        isUnlocked: false,
      }));
      setAchievements(initialAchievements);
    }

    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem("serena_achievements", JSON.stringify(achievements));
    }
  }, [achievements]);

  useEffect(() => {
    if (progress.length > 0) {
      localStorage.setItem(
        "serena_achievement_progress",
        JSON.stringify(progress)
      );
    }
  }, [progress]);

  const calculateProgress = useCallback(() => {
    setAchievements((currentAchievements) => {
      const newProgress: AchievementProgress[] = [];
      const newAchievements = [...currentAchievements];
      const newlyUnlockedAchievements: Achievement[] = [];

      const completedTasks = tasks.filter((task) => task.isCompleted);
      const completedTasksCount = completedTasks.length;

      const completedHabits = habits.filter((habit) => {
        const today = new Date();
        const todayEntry = habitEntries.find(
          (entry) =>
            entry.habitId === habit.id &&
            new Date(entry.date).toDateString() === today.toDateString()
        );
        return todayEntry && todayEntry.value >= habit.target;
      });

      const today = new Date();
      const streakDays = (() => {
        let currentStreak = 0;
        let checkDate = new Date(today);

        for (let i = 0; i < 100; i++) {
          const dayTasks = tasks.filter(
            (task) =>
              task.isCompleted &&
              task.completedAt &&
              new Date(task.completedAt).toDateString() ===
                checkDate.toDateString()
          );

          if (dayTasks.length > 0) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return currentStreak;
      })();

      const earlyBirdTasks = completedTasks.filter(
        (task) => task.completedAt && new Date(task.completedAt).getHours() < 8
      );
      const nightOwlTasks = completedTasks.filter(
        (task) =>
          task.completedAt && new Date(task.completedAt).getHours() >= 22
      );

      const tasksByDay = new Map<string, number>();
      completedTasks.forEach((task) => {
        if (task.completedAt) {
          const day = new Date(task.completedAt).toDateString();
          tasksByDay.set(day, (tasksByDay.get(day) || 0) + 1);
        }
      });

      const maxTasksInDay = Math.max(...Array.from(tasksByDay.values()), 0);

      ACHIEVEMENTS.forEach((achievement) => {
        let currentValue = 0;
        let isCompleted = false;

        switch (achievement.id) {
          case "first_task":
          case "task_master_10":
          case "task_master_50":
          case "task_master_100":
          case "task_master_500":
            currentValue = completedTasksCount;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "streak_3":
          case "streak_30":
          case "streak_100":
            currentValue = streakDays;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "habit_creator":
            currentValue = habits.length;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "habit_master_5":
            currentValue = completedHabits.length;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "early_bird":
            currentValue = earlyBirdTasks.length;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "night_owl":
            currentValue = nightOwlTasks.length;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "speed_demon":
            currentValue = maxTasksInDay;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "perfectionist":
            const perfectDays = Array.from(tasksByDay.entries()).filter(
              ([day, count]) => {
                const dayTasks = tasks.filter(
                  (task) =>
                    task.dueDate &&
                    new Date(task.dueDate).toDateString() === day
                );
                return dayTasks.length > 0 && count === dayTasks.length;
              }
            ).length;
            currentValue = perfectDays;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "weekend_warrior":
            const weekendDays = Array.from(tasksByDay.entries()).filter(
              ([day, count]) => {
                const date = new Date(day);
                return (
                  (date.getDay() === 0 || date.getDay() === 6) && count > 0
                );
              }
            ).length;
            currentValue = weekendDays;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "project_creator":
            currentValue = projects?.length || 0;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "project_master_5":
            currentValue = projects?.length || 0;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "project_completer":
            const completedProjects = (projects || []).filter((project) => {
              const projectTasks = tasks.filter(
                (task) => task.projectId === project.id
              );
              return (
                projectTasks.length > 0 &&
                projectTasks.every((task) => task.isCompleted)
              );
            });
            currentValue = completedProjects.length;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "multitasker":
            const multitaskDays = Array.from(tasksByDay.entries()).filter(
              ([day, count]) => {
                if (count < 3) return false;

                const dayTasks = completedTasks.filter(
                  (task) =>
                    task.completedAt &&
                    new Date(task.completedAt).toDateString() === day
                );

                const uniqueCategories = new Set(
                  dayTasks
                    .filter((task) => task.tags && task.tags.length > 0)
                    .flatMap((task) => task.tags)
                );

                return uniqueCategories.size >= 3;
              }
            ).length;
            currentValue = multitaskDays;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "ill_be_back":
            const recentCompletedTasks = completedTasks.filter((task) => {
              return (
                task.completedAt &&
                new Date(task.completedAt) >
                  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
              );
            });
            currentValue = recentCompletedTasks.length > 0 ? 1 : 0;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "may_the_force":
            currentValue = streakDays;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "to_infinity_beyond":
            currentValue = completedTasksCount;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "great_power_responsibility":
            const completedProjectsCount = (projects || []).filter(
              (project) => {
                const projectTasks = tasks.filter(
                  (task) => task.projectId === project.id
                );
                return (
                  projectTasks.length > 0 &&
                  projectTasks.every((task) => task.isCompleted)
                );
              }
            ).length;
            currentValue = completedProjectsCount;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "i_am_iron_man":
            currentValue = maxTasksInDay;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "back_to_future":
            const overdueCompletedTasks = completedTasks.filter((task) => {
              if (!task.completedAt || !task.dueDate) return false;
              const completedDate = new Date(task.completedAt);
              const dueDate = new Date(task.dueDate);
              return completedDate > dueDate;
            });
            currentValue = overdueCompletedTasks.length > 0 ? 1 : 0;
            isCompleted = currentValue >= achievement.requirement;
            break;
        }

        newProgress.push({
          achievementId: achievement.id,
          currentValue,
          isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
        });

        const existingAchievement = newAchievements.find(
          (a) => a.id === achievement.id
        );
        if (
          existingAchievement &&
          !existingAchievement.isUnlocked &&
          isCompleted
        ) {
          const unlockedAchievement = {
            ...existingAchievement,
            currentProgress: currentValue,
            isUnlocked: true,
            unlockedAt: new Date(),
          };

          newAchievements[
            newAchievements.findIndex((a) => a.id === achievement.id)
          ] = unlockedAchievement;
          newlyUnlockedAchievements.push(unlockedAchievement);
        } else if (existingAchievement) {
          newAchievements[
            newAchievements.findIndex((a) => a.id === achievement.id)
          ] = {
            ...existingAchievement,
            currentProgress: currentValue,
          };
        }
      });

      setProgress(newProgress);

      if (newlyUnlockedAchievements.length > 0) {
        setNewlyUnlocked(newlyUnlockedAchievements);

        newlyUnlockedAchievements.forEach((achievement) => {
          const rarity = achievement.rarity;

          if (rarity === "legendary") {
            triggerCelebration("achievement");
            playMilestoneSound();
            toast.success(`🏆 Conquista Desbloqueada!`, {
              description: `${achievement.icon} ${achievement.title} - ${achievement.description}`,
              duration: 5000,
            });
          } else if (rarity === "epic") {
            triggerCelebration("milestone");
            playAchievementSound();
            toast.success(`🎉 Conquista Desbloqueada!`, {
              description: `${achievement.icon} ${achievement.title} - ${achievement.description}`,
              duration: 4000,
            });
          } else {
            playAchievementSound();
            toast.success(`✨ Conquista Desbloqueada!`, {
              description: `${achievement.icon} ${achievement.title} - ${achievement.description}`,
              duration: 3000,
            });
          }
        });
      }

      return newAchievements;
    });
  }, [
    tasks,
    habits,
    habitEntries,
    projects,
    triggerCelebration,
    playAchievementSound,
    playMilestoneSound,
  ]);

  useEffect(() => {
    if (achievements.length > 0) {
      calculateProgress();
    }
  }, [calculateProgress, achievements.length]);

  const getAchievementById = useCallback(
    (id: string) => {
      return achievements.find((a) => a.id === id);
    },
    [achievements]
  );

  const getProgressById = useCallback(
    (id: string) => {
      return progress.find((p) => p.achievementId === id);
    },
    [progress]
  );

  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter((a) => a.isUnlocked);
  }, [achievements]);

  const getLockedAchievements = useCallback(() => {
    return achievements.filter((a) => !a.isUnlocked);
  }, [achievements]);

  const getAchievementsByCategory = useCallback(
    (category: string) => {
      return achievements.filter((a) => a.category === category);
    },
    [achievements]
  );

  const getTotalXP = useCallback(() => {
    return achievements
      .filter((a) => a.isUnlocked)
      .reduce((total, achievement) => total + achievement.xpReward, 0);
  }, [achievements]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  return {
    achievements,
    progress,
    newlyUnlocked,
    getAchievementById,
    getProgressById,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsByCategory,
    getTotalXP,
    clearNewlyUnlocked,
  };
}
