import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useHapticFeedback } from "./useHapticFeedback";

interface NavigationGesturesOptions {
  enableSwipeNavigation?: boolean;
}

export function useNavigationGestures({
  enableSwipeNavigation = true,
}: NavigationGesturesOptions = {}) {
  const navigate = useNavigate();
  const { triggerHaptic } = useHapticFeedback();

  const handleSwipeLeft = useCallback(() => {
    if (!enableSwipeNavigation) return;

    triggerHaptic("light");
    // Navegar para próxima página (ex: Home -> Calendar -> Tasks)
    const currentPath = window.location.pathname;
    const navigationOrder = [
      "/",
      "/calendar",
      "/tasks",
      "/habits",
      "/projects",
      "/profile",
    ];
    const currentIndex = navigationOrder.indexOf(currentPath);

    if (currentIndex < navigationOrder.length - 1) {
      navigate(navigationOrder[currentIndex + 1]);
    }
  }, [navigate, triggerHaptic, enableSwipeNavigation]);

  const handleSwipeRight = useCallback(() => {
    if (!enableSwipeNavigation) return;

    triggerHaptic("light");
    // Navegar para página anterior
    const currentPath = window.location.pathname;
    const navigationOrder = [
      "/",
      "/calendar",
      "/tasks",
      "/habits",
      "/projects",
      "/profile",
    ];
    const currentIndex = navigationOrder.indexOf(currentPath);

    if (currentIndex > 0) {
      navigate(navigationOrder[currentIndex - 1]);
    }
  }, [navigate, triggerHaptic, enableSwipeNavigation]);

  return {
    handleSwipeLeft,
    handleSwipeRight,
  };
}
