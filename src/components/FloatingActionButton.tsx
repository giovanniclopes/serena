import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export default function FloatingActionButton({
  onClick,
  className = "",
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-20 right-6 z-50
        w-14 h-14 rounded-full
        bg-pink-500 hover:bg-pink-600
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200
        active:scale-95
        ${className}
      `}
      aria-label="Adicionar item"
    >
      <Plus className="w-6 h-6 text-white" />
    </button>
  );
}
