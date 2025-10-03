import { Camera, Trash2, User, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  useCreateProfile,
  useDeleteAvatar,
  useUpdateProfile,
  useUploadAvatar,
} from "../features/profile/useProfile";
import type {
  CreateUserProfileData,
  UpdateUserProfileData,
  UserProfile,
  UserStatus,
} from "../types";
import DateInput from "./DateInput";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile | null;
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
}: ProfileModalProps) {
  const { state } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    birthDate: profile?.birthDate
      ? profile.birthDate.toISOString().split("T")[0]
      : "",
    status: (profile?.status || "active") as UserStatus,
  });
  const [isUploading, setIsUploading] = useState(false);

  const createProfileMutation = useCreateProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const deleteAvatarMutation = useDeleteAvatar();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("O arquivo deve ter no máximo 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem");
      return;
    }

    setIsUploading(true);
    try {
      const avatarUrl = await uploadAvatarMutation.mutateAsync(file);
      if (profile) {
        await updateProfileMutation.mutateAsync({ avatarUrl });
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatarUrl) return;

    try {
      await deleteAvatarMutation.mutateAsync();
    } catch (error) {
      console.error("Erro ao remover avatar:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const profileData = {
      username: formData.username || undefined,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      status: formData.status,
    };

    try {
      if (profile) {
        await updateProfileMutation.mutateAsync(
          profileData as UpdateUserProfileData
        );
      } else {
        await createProfileMutation.mutateAsync(
          profileData as CreateUserProfileData
        );
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: state.currentTheme.colors.surface,
          borderColor: state.currentTheme.colors.border,
        }}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-semibold"
              style={{ color: state.currentTheme.colors.text }}
            >
              {profile ? "Editar Perfil" : "Criar Perfil"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.primary + "20",
                color: state.currentTheme.colors.primary,
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2"
                    style={{ borderColor: state.currentTheme.colors.primary }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center border-2"
                    style={{
                      backgroundColor: state.currentTheme.colors.primary + "20",
                      borderColor: state.currentTheme.colors.primary,
                    }}
                  >
                    <User
                      className="w-8 h-8"
                      style={{ color: state.currentTheme.colors.primary }}
                    />
                  </div>
                )}

                <label
                  className="absolute -bottom-2 -right-2 p-2 rounded-full cursor-pointer transition-colors"
                  style={{ backgroundColor: state.currentTheme.colors.primary }}
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {profile?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.error + "20",
                    color: state.currentTheme.colors.error,
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remover Avatar</span>
                </button>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                Nome de usuário
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
                placeholder="Digite seu nome de usuário"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                Nome
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
                placeholder="Digite seu nome"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                Sobrenome
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
                placeholder="Digite seu sobrenome"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                Email
              </label>
              <input
                type="email"
                value={(user as { email?: string })?.email || ""}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.textSecondary,
                }}
                placeholder="Email do usuário"
                disabled
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                Data de nascimento
              </label>
              <DateInput
                value={formData.birthDate}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, birthDate: value }))
                }
                placeholder="DD/MM/AAAA"
                className="w-full"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: state.currentTheme.colors.text }}
              >
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
              >
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
                <option value="suspended">Suspensa</option>
              </select>
            </div>

            {profile && (
              <div
                className="pt-4 border-t"
                style={{ borderColor: state.currentTheme.colors.border }}
              >
                <div className="text-sm space-y-1">
                  <div
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    <strong>Data de cadastro:</strong>{" "}
                    {profile.createdAt.toLocaleDateString("pt-BR")}
                  </div>
                  <div
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    <strong>Última atualização:</strong>{" "}
                    {profile.updatedAt.toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: state.currentTheme.colors.background,
                  borderColor: state.currentTheme.colors.border,
                  color: state.currentTheme.colors.text,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  createProfileMutation.isPending ||
                  updateProfileMutation.isPending
                }
                className="w-full sm:flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: state.currentTheme.colors.primary }}
              >
                {createProfileMutation.isPending ||
                updateProfileMutation.isPending
                  ? "Salvando..."
                  : profile
                  ? "Atualizar"
                  : "Criar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
