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
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(sizeClasses[size], "max-h-[90vh] overflow-y-auto")}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {title.includes("Tarefa")
              ? "Gerencie suas tarefas"
              : title.includes("Contagem")
              ? "Configure eventos importantes"
              : title.includes("Perfil")
              ? "Atualize suas informações"
              : "Configure as opções"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
