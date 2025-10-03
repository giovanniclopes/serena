import { useOnboarding } from "../hooks/useOnboarding";
import Layout from "./Layout";
import OnboardingModal from "./OnboardingModal";

export default function AppWithOnboarding() {
  const { showOnboarding, markOnboardingAsSeen } = useOnboarding();

  return (
    <>
      <Layout />
      <OnboardingModal isOpen={showOnboarding} onClose={markOnboardingAsSeen} />
    </>
  );
}
