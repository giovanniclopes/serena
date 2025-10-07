"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    const baseClasses = cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      isMobile && "touch-manipulation active:scale-95",
      fullWidth && "w-full"
    );

    const variantClasses = {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    };

    const sizeClasses = {
      sm: isMobile ? "h-10 px-4 text-sm" : "h-8 px-3 text-xs",
      md: isMobile ? "h-12 px-6 text-base" : "h-10 px-4 text-sm",
      lg: isMobile ? "h-14 px-8 text-lg" : "h-12 px-6 text-base",
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

MobileButton.displayName = "MobileButton";
