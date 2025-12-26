import { toast } from "sonner";
import { uploadAttachment } from "../services/apiAttachments";
import type { Attachment } from "../types";
import DrawingCanvas from "./DrawingCanvas";
import ResponsiveModal from "./ResponsiveModal";

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attachment: Attachment) => void;
  workspaceId: string;
}

export default function DrawingModal({
  isOpen,
  onClose,
  onSave,
  workspaceId,
}: DrawingModalProps) {
  const handleSave = async (imageData: string) => {
    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], `desenho-${Date.now()}.png`, {
        type: "image/png",
      });

      const result = await uploadAttachment({
        file,
        workspaceId,
      });

      if (result.success && result.attachment) {
        onSave(result.attachment);
        onClose();
        toast.success("Desenho salvo com sucesso!");
      } else {
        toast.error(result.error || "Erro ao salvar desenho");
      }
    } catch (error) {
      console.error("Erro ao salvar desenho:", error);
      toast.error("Erro ao salvar desenho");
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Nota com Desenho"
    >
      <div style={{ minHeight: "400px", height: "60vh" }}>
        <DrawingCanvas onSave={handleSave} onCancel={onClose} />
      </div>
    </ResponsiveModal>
  );
}
