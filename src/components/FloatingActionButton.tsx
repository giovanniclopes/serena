import { Plus } from "lucide-react";
import { useHapticFeedback } from "../hooks/useHapticFeedback";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export default function FloatingActionButton({
  onClick,
  className = "",
}: FloatingActionButtonProps) {
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = () => {
    triggerHaptic("medium");
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-24 right-4 z-50
        w-14 h-14 rounded-full
        bg-pink-400 hover:bg-pink-600
        shadow-lg hover:shadow-xl
        transition-all duration-200
        active:scale-95
        border-0
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
        ${className}
      `}
      aria-label="Adicionar item"
    >
      <Plus className="w-6 h-6 text-white" />
    </button>
  );
}
