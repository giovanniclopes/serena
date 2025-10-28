import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";

interface PullToRefreshIndicatorProps {
  progress: number;
  isRefreshing: boolean;
  pullDistance: number;
}

export default function PullToRefreshIndicator({
  progress,
  isRefreshing,
  pullDistance,
}: PullToRefreshIndicatorProps) {
  const { state } = useApp();

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4"
      style={{
        backgroundColor: state.currentTheme.colors.background,
        borderBottom: `1px solid ${state.currentTheme.colors.border}`,
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        scale: isRefreshing ? 1.1 : 1,
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : 0,
          }}
          transition={{
            duration: 1,
            repeat: isRefreshing ? Infinity : 0,
            ease: "linear",
          }}
        >
          <RefreshCw
            className="w-5 h-5"
            style={{ color: state.currentTheme.colors.primary }}
          />
        </motion.div>

        <motion.div
          className="text-sm font-medium"
          style={{ color: state.currentTheme.colors.text }}
          animate={{
            opacity: isRefreshing ? 0.7 : 1,
          }}
        >
          {isRefreshing ? "Atualizando..." : "Puxe para atualizar"}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-1 rounded-full"
        style={{
          backgroundColor: state.currentTheme.colors.primary,
          width: `${progress * 100}%`,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
