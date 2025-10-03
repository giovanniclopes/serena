import { useEffect, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage(
    "hasSeenOnboarding",
    false
  );
  const [isNewUser, setIsNewUser] = useLocalStorage("isNewUser", false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isNewUser && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [isNewUser, hasSeenOnboarding]);

  const markOnboardingAsSeen = () => {
    setHasSeenOnboarding(true);
    setIsNewUser(false);
    setShowOnboarding(false);
  };

  const showOnboardingAgain = () => {
    setShowOnboarding(true);
  };

  const hideOnboarding = () => {
    setShowOnboarding(false);
  };

  const markAsNewUser = () => {
    setIsNewUser(true);
    setHasSeenOnboarding(false);
  };

  return {
    showOnboarding,
    hasSeenOnboarding,
    isNewUser,
    markOnboardingAsSeen,
    showOnboardingAgain,
    hideOnboarding,
    markAsNewUser,
  };
}
