import { FileCode, Share2 } from "lucide-react";
import React, { useState } from "react";
import { canUserGeneratePrompt } from "../config/features";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ShareMenuProps {
  task: Task;
  onShare: () => void;
  onGeneratePrompt: () => void;
  children: React.ReactNode;
}

export default function ShareMenu({
  onShare,
  onGeneratePrompt,
  children,
}: ShareMenuProps) {
  const { state } = useApp();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const userId = (user as { id?: string })?.id;
  const canGenerate = canUserGeneratePrompt(userId);

  const handleShare = () => {
    setIsOpen(false);
    onShare();
  };

  const handleGeneratePrompt = () => {
    setIsOpen(false);
    onGeneratePrompt();
  };

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
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
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
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
          {canGenerate && (
            <button
              onClick={handleGeneratePrompt}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
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
            >
              <FileCode className="w-4 h-4" />
              <span>Gerar Prompt</span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
