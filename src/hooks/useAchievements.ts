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

  // Carregar conquistas salvas
  useEffect(() => {
    const savedAchievements = localStorage.getItem("serena_achievements");
    const savedProgress = localStorage.getItem("serena_achievement_progress");

    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      // Inicializar com conquistas não desbloqueadas
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

  // Salvar conquistas
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

  // Calcular progresso das conquistas
  const calculateProgress = useCallback(() => {
    setAchievements((currentAchievements) => {
      const newProgress: AchievementProgress[] = [];
      const newAchievements = [...currentAchievements];
      const newlyUnlockedAchievements: Achievement[] = [];

      // Conquistas de tarefas
      const completedTasks = tasks.filter((task) => task.isCompleted);
      const completedTasksCount = completedTasks.length;

      // Conquistas de hábitos
      const completedHabits = habits.filter((habit) => {
        const today = new Date();
        const todayEntry = habitEntries.find(
          (entry) =>
            entry.habitId === habit.id &&
            new Date(entry.date).toDateString() === today.toDateString()
        );
        return todayEntry && todayEntry.value >= habit.target;
      });

      // Conquistas de streak (baseado em dias consecutivos com tarefas completadas)
      const today = new Date();
      const streakDays = (() => {
        let currentStreak = 0;
        let checkDate = new Date(today);

        // Verificar dias consecutivos começando de hoje
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

      // Conquistas de marcos
      const earlyBirdTasks = completedTasks.filter(
        (task) => task.completedAt && new Date(task.completedAt).getHours() < 8
      );
      const nightOwlTasks = completedTasks.filter(
        (task) =>
          task.completedAt && new Date(task.completedAt).getHours() >= 22
      );

      // Calcular tarefas por dia
      const tasksByDay = new Map<string, number>();
      completedTasks.forEach((task) => {
        if (task.completedAt) {
          const day = new Date(task.completedAt).toDateString();
          tasksByDay.set(day, (tasksByDay.get(day) || 0) + 1);
        }
      });

      const maxTasksInDay = Math.max(...Array.from(tasksByDay.values()), 0);

      // Verificar cada conquista
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
            // Verificar se houve dias com todas as tarefas completadas
            const perfectDays = Array.from(tasksByDay.entries()).filter(
              ([day, count]) => {
                // Buscar todas as tarefas que tinham prazo para esse dia
                const dayTasks = tasks.filter(
                  (task) =>
                    task.dueDate &&
                    new Date(task.dueDate).toDateString() === day
                );
                // Um dia perfeito é quando todas as tarefas com prazo foram completadas
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
            // Verificar se há projetos completados (todas as tarefas do projeto completadas)
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
            // Verificar se houve dias com tarefas de 3+ categorias diferentes completadas
            const multitaskDays = Array.from(tasksByDay.entries()).filter(
              ([day, count]) => {
                if (count < 3) return false; // Precisa de pelo menos 3 tarefas

                // Buscar tarefas completadas nesse dia
                const dayTasks = completedTasks.filter(
                  (task) =>
                    task.completedAt &&
                    new Date(task.completedAt).toDateString() === day
                );

                // Contar categorias únicas (usando tags como categorias)
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

          // Conquistas Geek
          case "ill_be_back":
            // Verificar se há tarefas que foram desmarcadas e marcadas novamente
            // Por simplicidade, vamos contar tarefas completadas nos últimos 3 dias
            // (assumindo que se foi completada recentemente, pode ter sido re-completada)
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
            // Já calculado acima como streak_7, mas vamos manter separado
            currentValue = streakDays;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "to_infinity_beyond":
            // Já calculado acima como task_master_100
            currentValue = completedTasksCount;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "great_power_responsibility":
            // Já calculado acima como project_completer
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
            // Já calculado acima como speed_demon
            currentValue = maxTasksInDay;
            isCompleted = currentValue >= achievement.requirement;
            break;

          case "back_to_future":
            // Verificar se há tarefas que estavam atrasadas e foram completadas
            const overdueCompletedTasks = completedTasks.filter((task) => {
              if (!task.completedAt || !task.dueDate) return false;
              const completedDate = new Date(task.completedAt);
              const dueDate = new Date(task.dueDate);
              // Tarefa estava atrasada se foi completada após o prazo
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

        // Verificar se a conquista foi desbloqueada
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

        // Celebrar conquistas desbloqueadas
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

  // Executar cálculo de progresso quando as dependências mudarem
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
