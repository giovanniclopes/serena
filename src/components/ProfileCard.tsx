import { Calendar, Edit, User } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useProfile } from "../features/profile/useProfile";
import ProfileModal from "./ProfileModal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div
          className="text-sm"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Carregando perfil...
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
      <Card className={compact ? "p-3" : "p-4"}>
        <CardContent className="p-0">
          <div className="flex items-start space-x-4">
            <Avatar className={compact ? "w-12 h-12" : "w-16 h-16"}>
              <AvatarImage src={profile.avatarUrl} alt="Avatar" />
              <AvatarFallback>
                <User
                  className={compact ? "w-6 h-6" : "w-8 h-8"}
                  style={{ color: state.currentTheme.colors.primary }}
                />
              </AvatarFallback>
            </Avatar>

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

                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: getStatusColor(profile.status) + "20",
                        color: getStatusColor(profile.status),
                        borderColor: getStatusColor(profile.status),
                      }}
                    >
                      {getStatusText(profile.status)}
                    </Badge>
                  </div>
                </div>

                {showEditButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {!compact && (
                <div className="mt-3 space-y-2">
                  {profile.birthDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar
                        className="w-4 h-4"
                        style={{
                          color: state.currentTheme.colors.textSecondary,
                        }}
                      />
                      <span
                        className="text-sm"
                        style={{
                          color: state.currentTheme.colors.textSecondary,
                        }}
                      >
                        Nascido em{" "}
                        {profile.birthDate.toLocaleDateString("pt-BR")}
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
        </CardContent>
      </Card>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
      />
    </>
  );
}
