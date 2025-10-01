import { Calendar, Edit, User } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useProfile } from "../features/profile/useProfile";
import { useAutoProfile } from "../hooks/useAutoProfile";
import ProfileModal from "./ProfileModal";

interface ProfileCardProps {
  showEditButton?: boolean;
  compact?: boolean;
}

export default function ProfileCard({
  showEditButton = true,
  compact = false,
}: ProfileCardProps) {
  const { state } = useApp();
  const { profile, isLoading } = useProfile();
  const { isChecking } = useAutoProfile();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div
          className="text-sm"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          {isChecking ? "Configurando perfil..." : "Carregando perfil..."}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-4">
        <div
          className="text-sm"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Carregando perfil...
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return state.currentTheme.colors.success;
      case "inactive":
        return state.currentTheme.colors.warning;
      case "suspended":
        return state.currentTheme.colors.error;
      default:
        return state.currentTheme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "inactive":
        return "Inativa";
      case "suspended":
        return "Suspensa";
      default:
        return status;
    }
  };

  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={`rounded-lg border p-4 ${compact ? "p-3" : "p-4"}`}
        style={{
          backgroundColor: state.currentTheme.colors.surface,
          borderColor: state.currentTheme.colors.border,
        }}
      >
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className={`rounded-full object-cover border-2 ${
                  compact ? "w-12 h-12" : "w-16 h-16"
                }`}
                style={{ borderColor: state.currentTheme.colors.primary }}
              />
            ) : (
              <div
                className={`rounded-full flex items-center justify-center border-2 ${
                  compact ? "w-12 h-12" : "w-16 h-16"
                }`}
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "20",
                  borderColor: state.currentTheme.colors.primary,
                }}
              >
                <User
                  className={compact ? "w-6 h-6" : "w-8 h-8"}
                  style={{ color: state.currentTheme.colors.primary }}
                />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    compact ? "text-base" : "text-lg"
                  }`}
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {fullName || profile.username || "Usuário"}
                </h3>

                {profile.username && fullName && (
                  <p
                    className="text-sm"
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    @{profile.username}
                  </p>
                )}

                {/* Status */}
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(profile.status) }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: getStatusColor(profile.status) }}
                  >
                    {getStatusText(profile.status)}
                  </span>
                </div>
              </div>

              {showEditButton && (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                  style={{
                    backgroundColor: state.currentTheme.colors.primary + "20",
                    color: state.currentTheme.colors.primary,
                  }}
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Additional Info */}
            {!compact && (
              <div className="mt-3 space-y-2">
                {profile.birthDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: state.currentTheme.colors.textSecondary }}
                    >
                      Nascido em {profile.birthDate.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}

                <div className="text-xs space-y-1">
                  <div
                    style={{ color: state.currentTheme.colors.textSecondary }}
                  >
                    <strong>Membro desde:</strong>{" "}
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
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
      />
    </>
  );
}
