import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export default function FloatingActionButton({
  onClick,
  className = "",
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={`
        fixed bottom-24 right-4 z-50
        w-16 h-16 rounded-full
        bg-gradient-to-r from-pink-500 to-purple-600
        hover:from-pink-600 hover:to-purple-700
        shadow-2xl hover:shadow-3xl
        transition-all duration-300
        active:scale-95
        border-2 border-white
        ${className}
      `}
      aria-label="Adicionar item"
    >
      <Plus className="w-7 h-7 text-white" />
    </Button>
  );
}
