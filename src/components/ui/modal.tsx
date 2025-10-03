import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const sizeClasses = {
    sm: "max-w-sm sm:max-w-md",
    md: "max-w-sm sm:max-w-lg",
    lg: "max-w-sm sm:max-w-2xl",
    xl: "max-w-sm sm:max-w-4xl",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "max-h-[95vh] sm:max-h-[90vh] overflow-y-auto",
          "w-[95vw] sm:w-full",
          "mx-2 sm:mx-0",
          "p-4 sm:p-6"
        )}
      >
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {title.includes("Tarefa")
              ? "Gerencie suas tarefas"
              : title.includes("Contagem")
              ? "Configure eventos importantes"
              : title.includes("Perfil")
              ? "Atualize suas informações"
              : "Configure as opções"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
