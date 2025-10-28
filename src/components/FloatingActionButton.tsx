import { Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { adjustColorBrightness } from "../utils/colorUtils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export default function FloatingActionButton({
  onClick,
  className = "",
}: FloatingActionButtonProps) {
  const { state } = useApp();
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = () => {
    triggerHaptic("medium");
    onClick();
  };

  const primaryColor = state.currentTheme.colors.primary;
  const hoverColor = adjustColorBrightness(primaryColor, 0.8);

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-16 right-4 z-50
        w-14 h-14 rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-200
        active:scale-95
        border-0
        flex items-center justify-center
        ${className}
      `}
      style={{
        backgroundColor: primaryColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = primaryColor;
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${primaryColor}`;
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
      aria-label="Adicionar item"
    >
      <Plus className="w-6 h-6 text-white" />
    </button>
  );
}
