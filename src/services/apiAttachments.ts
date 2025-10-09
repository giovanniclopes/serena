import { supabase } from "../lib/supabaseClient";
import type { Attachment } from "../types";

const BUCKET_NAME = "attachment";

export interface UploadAttachmentParams {
  file: File;
  workspaceId: string;
  taskId?: string;
}

export interface UploadAttachmentResult {
  success: boolean;
  attachment?: Attachment;
  error?: string;
}

/**
 * Faz upload de um arquivo para o Supabase Storage
 */
export const uploadAttachment = async ({
  file,
  workspaceId,
  taskId,
}: UploadAttachmentParams): Promise<UploadAttachmentResult> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const filePath = `${workspaceId}/${taskId || "temp"}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      return {
        success: false,
        error: `Erro no upload: ${uploadError.message}`,
      };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Erro ao obter URL pública do arquivo",
      };
    }

    const attachment: Attachment = {
      id: `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
    };

    return {
      success: true,
      attachment,
    };
  } catch (error) {
    console.error("Erro inesperado no upload:", error);
    return {
      success: false,
      error: `Erro inesperado: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    };
  }
};

/**
 * Remove um arquivo do Supabase Storage
 */
export const deleteAttachment = async (
  attachment: Attachment
): Promise<boolean> => {
  try {
    const url = new URL(attachment.url);
    const pathParts = url.pathname.split("/");
    const filePath = pathParts
      .slice(pathParts.indexOf(BUCKET_NAME) + 1)
      .join("/");

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Erro ao deletar arquivo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro inesperado ao deletar arquivo:", error);
    return false;
  }
};

/**
 * Faz upload de múltiplos arquivos
 */
export const uploadMultipleAttachments = async (
  files: File[],
  workspaceId: string,
  taskId?: string
): Promise<UploadAttachmentResult[]> => {
  const results: UploadAttachmentResult[] = [];

  for (const file of files) {
    const result = await uploadAttachment({
      file,
      workspaceId,
      taskId,
    });
    results.push(result);
  }

  return results;
};

/**
 * Valida se o arquivo é permitido
 */
export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: 10MB`,
    };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${file.type}`,
    };
  }

  return { valid: true };
};
