import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  onToggle?: (expanded: boolean) => void;
  theme?: {
    colors: {
      text: string;
      textSecondary: string;
      border: string;
      surface: string;
      primary: string;
    };
  };
}

export default function Accordion({
  title,
  children,
  defaultExpanded = false,
  badge,
  className = "",
  headerClassName = "",
  contentClassName = "",
  onToggle,
  theme,
}: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const accordionId = React.useId();
  const contentId = `${accordionId}-content`;

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        id={accordionId}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          headerClassName
        )}
        style={
          {
            color: theme?.colors.text || "#000",
            backgroundColor: theme?.colors.surface || "transparent",
            borderColor: theme?.colors.border || "#e5e7eb",
            "--tw-ring-color": theme?.colors.primary || "#3b82f6",
          } as React.CSSProperties
        }
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{title}</span>
          {badge !== undefined && badge > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
              style={{
                backgroundColor: theme?.colors.primary || "#3b82f6",
                color: "white",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 flex-shrink-0 transition-transform duration-200",
            isExpanded && "transform rotate-180"
          )}
          style={{ color: theme?.colors.textSecondary || "#6b7280" }}
          aria-hidden="true"
        />
      </button>
      <div
        id={contentId}
        role="region"
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        )}
        style={{
          transitionProperty: "max-height, opacity",
        }}
      >
        <div className={cn("pt-2", contentClassName)}>{children}</div>
      </div>
    </div>
  );
}
