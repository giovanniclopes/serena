import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, Clock, Folder, Plus, Target, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useClickOutside } from "../hooks/useClickOutside";
import { useHapticFeedback } from "../hooks/useHapticFeedback";
import { useWorkspaceColors } from "../hooks/useWorkspaceColors";

interface CentralActionButtonProps {
  onTaskClick: () => void;
  onHabitClick: () => void;
  onCountdownClick: () => void;
  onProjectClick: () => void;
}

export default function CentralActionButton({
  onTaskClick,
  onHabitClick,
  onCountdownClick,
  onProjectClick,
}: CentralActionButtonProps) {
  const { state } = useApp();
  const { triggerHaptic } = useHapticFeedback();
  const colors = useWorkspaceColors();
  const [isExpanded, setIsExpanded] = useState(false);

  const containerRef = useClickOutside<HTMLDivElement>(() => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  const subButtons = [
    {
      id: "task",
      icon: CheckSquare,
      label: "Tarefa",
      color: colors.accent.blue + "20",
      textColor: colors.accent.blue,
      onClick: onTaskClick,
    },
    {
      id: "habit",
      icon: Target,
      label: "Hábito",
      color: colors.accent.green + "20",
      textColor: colors.accent.green,
      onClick: onHabitClick,
    },
    {
      id: "countdown",
      icon: Clock,
      label: "Contagem",
      color: colors.accent.orange + "20",
      textColor: colors.accent.orange,
      onClick: onCountdownClick,
    },
    {
      id: "project",
      icon: Folder,
      label: "Projeto",
      color: colors.accent.purple + "20",
      textColor: colors.accent.purple,
      onClick: onProjectClick,
    },
  ];

  const handleMainButtonClick = () => {
    triggerHaptic("medium");
    setIsExpanded(!isExpanded);
  };

  const handleSubButtonClick = (onClick: () => void) => {
    triggerHaptic("light");
    onClick();
    setIsExpanded(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        onClick={handleMainButtonClick}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center border transition-all duration-200"
        style={{
          backgroundColor: isExpanded
            ? state.currentTheme.colors.primary
            : colors.primary + "15",
          color: isExpanded ? "white" : colors.primary,
          borderColor: colors.primary + "30",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isExpanded ? 45 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {isExpanded ? <X className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col gap-2 items-start">
              {subButtons.map((button, index) => (
                <motion.button
                  key={button.id}
                  onClick={() => handleSubButtonClick(button.onClick)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: button.color,
                    color: button.textColor,
                    borderColor: button.textColor + "40",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button.icon className="w-4 h-4" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {button.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
