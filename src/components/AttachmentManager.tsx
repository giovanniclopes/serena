import { Download, File, FileText, Image, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import {
  deleteAttachment,
  uploadAttachment,
  validateFile,
} from "../services/apiAttachments";
import type { Attachment } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";

interface AttachmentManagerProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  workspaceId: string;
}

export default function AttachmentManager({
  attachments,
  onAttachmentsChange,
  workspaceId,
}: AttachmentManagerProps) {
  const { state } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const newAttachments: Attachment[] = [];
      const uploadPromises: Promise<void>[] = [];
      const errors: string[] = [];

      for (const file of Array.from(files)) {
        const validation = validateFile(file);
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`);
          continue;
        }

        const uploadPromise = uploadAttachment({
          file,
          workspaceId,
        }).then((result) => {
          if (result.success && result.attachment) {
            newAttachments.push(result.attachment);
          } else {
            errors.push(`${file.name}: ${result.error || "Erro desconhecido"}`);
          }
        });

        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises);

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
      }

      if (errors.length > 0) {
        setUploadError(errors.join("; "));
      }
    } catch (error) {
      console.error("Erro ao fazer upload dos arquivos:", error);
      setUploadError("Erro inesperado ao fazer upload dos arquivos");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    const attachment = attachments.find((att) => att.id === attachmentId);
    if (!attachment) return;

    try {
      const success = await deleteAttachment(attachment);
      if (success) {
        onAttachmentsChange(
          attachments.filter((att) => att.id !== attachmentId)
        );
      } else {
        console.error("Erro ao remover arquivo do storage");
        toast.error("Erro ao remover arquivo");
      }
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
      toast.error("Erro ao remover arquivo");
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="w-4 h-4" />;
    } else if (type.startsWith("text/") || type.includes("pdf")) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          className="text-sm font-medium"
          style={{ color: state.currentTheme.colors.text }}
        >
          Anexos
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs"
        >
          <Paperclip className="w-3 h-3 mr-1" />
          {isUploading ? "Enviando..." : "Adicionar"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx"
      />

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card
              key={attachment.id}
              className="p-2"
              style={{
                backgroundColor: state.currentTheme.colors.surface,
                borderColor: state.currentTheme.colors.border,
              }}
            >
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div
                      className="flex-shrink-0"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      {getFileIcon(attachment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: state.currentTheme.colors.text }}
                      >
                        {attachment.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          color: state.currentTheme.colors.textSecondary,
                        }}
                      >
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(attachment)}
                      className="h-6 w-6"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {uploadError && (
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: state.currentTheme.colors.error + "10",
            borderColor: state.currentTheme.colors.error + "30",
          }}
        >
          <p
            className="text-sm"
            style={{ color: state.currentTheme.colors.error }}
          >
            {uploadError}
          </p>
        </div>
      )}

      {attachments.length === 0 && (
        <div
          className="text-center py-4 rounded-lg border-2 border-dashed"
          style={{
            backgroundColor: state.currentTheme.colors.surface + "50",
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <Paperclip
            className="w-8 h-8 mx-auto mb-2"
            style={{ color: state.currentTheme.colors.textSecondary }}
          />
          <p
            className="text-sm"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Nenhum anexo adicionado
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Clique em "Adicionar" para anexar arquivos
          </p>
        </div>
      )}
    </div>
  );
}
