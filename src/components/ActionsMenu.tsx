import { Calendar, Download, FileCode, Share2 } from "lucide-react";
import React, { useState } from "react";
import { canUserGeneratePrompt } from "../config/features";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useTaskShareCount } from "../hooks/useTaskShareCount";
import type { Task } from "../types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ActionsMenuProps {
  task: Task;
  onExport: () => void;
  onShare: () => void;
  onGeneratePrompt?: () => void;
  onAddToGoogleCalendar: () => void;
  children: React.ReactNode;
}

export default function ActionsMenu({
  task,
  onExport,
  onShare,
  onGeneratePrompt,
  onAddToGoogleCalendar,
  children,
}: ActionsMenuProps) {
  const { state } = useApp();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { shareCount } = useTaskShareCount(task.id);

  const userId = (user as { id?: string })?.id;
  const canGenerate = canUserGeneratePrompt(userId);

  const handleExport = () => {
    setIsOpen(false);
    onExport();
  };

  const handleShare = () => {
    setIsOpen(false);
    onShare();
  };

  const handleGeneratePrompt = () => {
    setIsOpen(false);
    if (onGeneratePrompt) {
      onGeneratePrompt();
    }
  };

  const handleAddToGoogleCalendar = () => {
    setIsOpen(false);
    onAddToGoogleCalendar();
  };

  const menuItems = [
    {
      icon: Download,
      label: "Baixar",
      onClick: handleExport,
    },
    {
      icon: Share2,
      label: "Compartilhar",
      onClick: handleShare,
      badge: shareCount > 0 ? shareCount : undefined,
    },
    {
      icon: Calendar,
      label: "Adicionar ao Google Agenda",
      onClick: handleAddToGoogleCalendar,
    },
  ];

  if (canGenerate && onGeneratePrompt) {
    menuItems.push({
      icon: FileCode,
      label: "Gerar Prompt",
      onClick: handleGeneratePrompt,
    });
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-64 p-2"
        style={{
          backgroundColor: state.currentTheme.colors.surface,
          borderColor: state.currentTheme.colors.border,
        }}
        align="end"
      >
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80 relative"
              style={{
                color: state.currentTheme.colors.text,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  state.currentTheme.colors.border + "40";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label={item.label}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span
                  className="absolute right-3 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: state.currentTheme.colors.primary,
                    color: "white",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.625rem",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
