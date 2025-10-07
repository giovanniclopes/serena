"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "small";
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "muted" | "accent";
  style?: React.CSSProperties;
}

export function ResponsiveText({
  children,
  className = "",
  variant = "body",
  as: Component = "p",
  weight = "normal",
  color = "primary",
  style,
}: ResponsiveTextProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const variantClasses = {
    h1: isMobile ? "text-2xl leading-tight" : "text-xl leading-tight",
    h2: isMobile ? "text-xl leading-tight" : "text-lg leading-tight",
    h3: isMobile ? "text-lg leading-snug" : "text-base leading-snug",
    h4: isMobile ? "text-base leading-snug" : "text-sm leading-snug",
    body: isMobile ? "text-base leading-relaxed" : "text-sm leading-relaxed",
    caption: isMobile ? "text-sm leading-normal" : "text-xs leading-normal",
    small: isMobile ? "text-xs leading-normal" : "text-xs leading-normal",
  };

  const weightClasses = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const colorClasses = {
    primary: "text-foreground",
    secondary: "text-foreground/80",
    muted: "text-muted-foreground",
    accent: "text-accent-foreground",
  };

  return (
    <Component
      className={cn(
        variantClasses[variant],
        weightClasses[weight],
        colorClasses[color],
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
}
