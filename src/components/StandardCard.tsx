import { type ReactNode } from "react";
import { useApp } from "../context/AppContext";

interface StandardCardProps {
  children: ReactNode;
  className?: string;
  color?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function StandardCard({
  children,
  className = "",
  color,
  onClick,
  hover = true,
}: StandardCardProps) {
  const { state } = useApp();

  return (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl shadow-sm transition-all duration-300 border border-gray-100 ${
        hover ? "hover:shadow-lg" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        backgroundColor: state.currentTheme.colors.surface,
        borderColor: state.currentTheme.colors.border,
      }}
      onClick={onClick}
    >
      {color && (
        <div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-transparent to-transparent"
          style={{
            background: `linear-gradient(90deg, ${color}20, ${color}40, ${color}20)`,
          }}
        />
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
