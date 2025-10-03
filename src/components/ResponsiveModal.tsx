import { useMediaQuery } from "../hooks/useMediaQuery";
import Modal from "./Modal";
import { Drawer } from "./ui/drawer";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  description?: string;
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  description,
}: ResponsiveModalProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (isMobile) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        description={description}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      {children}
    </Modal>
  );
}
