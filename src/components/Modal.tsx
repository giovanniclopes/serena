import { Modal as ShadcnModal } from "./ui/modal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  return (
    <ShadcnModal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      {children}
    </ShadcnModal>
  );
}
