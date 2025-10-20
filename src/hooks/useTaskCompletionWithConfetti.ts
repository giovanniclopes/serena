import { useCallback, useRef } from "react";
import { useCompleteTask, useUncompleteTask } from "../features/tasks/useTasks";
import { useCelebrationSound } from "./useCelebrationSound";
import { useConfetti } from "./useConfetti";

export function useTaskCompletionWithConfetti() {
  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();
  const { triggerCelebration, isActive, stopConfetti } = useConfetti();
  const { playSuccessSound } = useCelebrationSound();
  const isCelebratingRef = useRef(false);

  const completeTaskWithConfetti = useCallback(
    (taskId: string) => {
      if (isCelebratingRef.current) return;

      completeTaskMutation.mutate(taskId, {
        onSuccess: () => {
          if (!isCelebratingRef.current) {
            isCelebratingRef.current = true;
            // Trigger confetti celebration and sound
            triggerCelebration("task");
            playSuccessSound();

            // Reset flag after celebration
            setTimeout(() => {
              isCelebratingRef.current = false;
            }, 3000);
          }
        },
      });
    },
    [completeTaskMutation, triggerCelebration, playSuccessSound]
  );

  const uncompleteTaskWithoutConfetti = useCallback(
    (taskId: string) => {
      uncompleteTaskMutation.mutate(taskId);
    },
    [uncompleteTaskMutation]
  );

  return {
    completeTask: completeTaskWithConfetti,
    uncompleteTask: uncompleteTaskWithoutConfetti,
    isCompleting: completeTaskMutation.isPending,
    isUncompleting: uncompleteTaskMutation.isPending,
    confettiActive: isActive,
    stopConfetti,
  };
}
