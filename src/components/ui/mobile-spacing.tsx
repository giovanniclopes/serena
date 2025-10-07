"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface MobileSpacingProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  margin?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  direction?: "vertical" | "horizontal" | "both";
}

export function MobileSpacing({
  children,
  className = "",
  padding = "none",
  margin = "none",
  gap = "none",
  direction = "both",
}: MobileSpacingProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const spacingValues = {
    none: "0",
    xs: isMobile ? "0.5rem" : "0.25rem", // 8px mobile, 4px desktop
    sm: isMobile ? "0.75rem" : "0.5rem", // 12px mobile, 8px desktop
    md: isMobile ? "1rem" : "0.75rem", // 16px mobile, 12px desktop
    lg: isMobile ? "1.5rem" : "1rem", // 24px mobile, 16px desktop
    xl: isMobile ? "2rem" : "1.5rem", // 32px mobile, 24px desktop
  };

  const getPaddingClasses = () => {
    if (padding === "none") return "";

    const value = spacingValues[padding];
    switch (direction) {
      case "vertical":
        return `py-[${value}]`;
      case "horizontal":
        return `px-[${value}]`;
      case "both":
      default:
        return `p-[${value}]`;
    }
  };

  const getMarginClasses = () => {
    if (margin === "none") return "";

    const value = spacingValues[margin];
    switch (direction) {
      case "vertical":
        return `my-[${value}]`;
      case "horizontal":
        return `mx-[${value}]`;
      case "both":
      default:
        return `m-[${value}]`;
    }
  };

  const getGapClasses = () => {
    if (gap === "none") return "";
    return `gap-[${spacingValues[gap]}]`;
  };

  return (
    <div
      className={cn(
        getPaddingClasses(),
        getMarginClasses(),
        getGapClasses(),
        className
      )}
    >
      {children}
    </div>
  );
}

// Hook para usar espaçamentos mobile-optimized
export function useMobileSpacing() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return {
    spacing: {
      xs: isMobile ? "0.5rem" : "0.25rem",
      sm: isMobile ? "0.75rem" : "0.5rem",
      md: isMobile ? "1rem" : "0.75rem",
      lg: isMobile ? "1.5rem" : "1rem",
      xl: isMobile ? "2rem" : "1.5rem",
    },
    touchTarget: isMobile ? "44px" : "32px", // Área mínima de toque
    isMobile,
  };
}
