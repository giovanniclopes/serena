"use client";

import { useApp } from "@/context/AppContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  color?: string;
  onClick?: () => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function MobileCard({
  children,
  className = "",
  color,
  onClick,
  onDoubleClick,
  hover = true,
  padding = "md",
}: MobileCardProps) {
  const { state } = useApp();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const paddingClasses = {
    sm: isMobile ? "p-4" : "p-3",
    md: isMobile ? "p-5" : "p-4",
    lg: isMobile ? "p-6" : "p-5",
  };

  const minHeight = isMobile ? "min-h-[60px]" : "min-h-[48px]";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 border",
        minHeight,
        paddingClasses[padding],
        hover && "hover:shadow-lg",
        onClick && "cursor-pointer active:scale-[0.98]",
        isMobile && "touch-manipulation",
        className
      )}
      style={{
        backgroundColor: state.currentTheme.colors.surface,
        borderColor: state.currentTheme.colors.border,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {color && (
        <div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-transparent to-transparent"
          style={{
            background: `linear-gradient(90deg, ${color}20, ${color}40, ${color}20)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
