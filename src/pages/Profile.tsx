import { Bell, BookOpen, User } from "lucide-react";
import { Link } from "react-router-dom";
import OnboardingModal from "../components/OnboardingModal";
import ProfileCard from "../components/ProfileCard";
import { useApp } from "../context/AppContext";
import { useProfile } from "../features/profile/useProfile";
import { useAutoProfile } from "../hooks/useAutoProfile";
import { useOnboarding } from "../hooks/useOnboarding";

export default function Profile() {
  const { state } = useApp();
  const { profile, isLoading, error } = useProfile();
  const { isChecking } = useAutoProfile();
  const { showOnboarding, showOnboardingAgain, hideOnboarding } =
    useOnboarding();

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="text-lg"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            {isChecking ? "Configurando perfil..." : "Carregando perfil..."}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div
          className="text-red-500 mb-2"
          style={{ color: state.currentTheme.colors.error }}
        >
          Erro ao carregar perfil
        </div>
        <div
          className="text-sm"
          style={{ color: state.currentTheme.colors.textSecondary }}
        >
          Tente recarregar a página
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: state.currentTheme.colors.primary + "20" }}
        >
          <User
            className="w-6 h-6"
            style={{ color: state.currentTheme.colors.primary }}
          />
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: state.currentTheme.colors.text }}
          >
            Meu Perfil
          </h1>
          <p
            className="text-sm"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <ProfileCard showEditButton={true} compact={false} />
      </div>

      <div className="max-w-2xl">
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: state.currentTheme.colors.text }}
          >
            Configurações
          </h2>

          <div className="space-y-3">
            <Link
              to="/notifications"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
              }}
            >
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "20",
                }}
              >
                <Bell
                  className="w-5 h-5"
                  style={{ color: state.currentTheme.colors.primary }}
                />
              </div>
              <div className="flex-1">
                <h3
                  className="font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Notificações
                </h3>
                <p
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Configure lembretes de tarefas
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {profile && (
        <div className="max-w-2xl">
          <div
            className="rounded-lg border p-6"
            style={{
              backgroundColor: state.currentTheme.colors.surface,
              borderColor: state.currentTheme.colors.border,
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: state.currentTheme.colors.text }}
            >
              Informações da Conta
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  ID do Usuário
                </label>
                <p
                  className="text-sm font-mono"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {profile.id}
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Status da Conta
                </label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        profile.status === "active"
                          ? state.currentTheme.colors.success
                          : profile.status === "inactive"
                          ? state.currentTheme.colors.warning
                          : state.currentTheme.colors.error,
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        profile.status === "active"
                          ? state.currentTheme.colors.success
                          : profile.status === "inactive"
                          ? state.currentTheme.colors.warning
                          : state.currentTheme.colors.error,
                    }}
                  >
                    {profile.status === "active"
                      ? "Ativa"
                      : profile.status === "inactive"
                      ? "Inativa"
                      : "Suspensa"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Data de Cadastro
                </label>
                <p
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {profile.createdAt.toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Última Atualização
                </label>
                <p
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  {profile.updatedAt.toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: state.currentTheme.colors.text }}
          >
            Ajuda e Suporte
          </h2>

          <div className="space-y-3">
            <button
              onClick={showOnboardingAgain}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
              style={{
                backgroundColor: state.currentTheme.colors.background,
                borderColor: state.currentTheme.colors.border,
              }}
            >
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "20",
                }}
              >
                <BookOpen
                  className="w-5 h-5"
                  style={{ color: state.currentTheme.colors.primary }}
                />
              </div>
              <div className="flex-1">
                <h3
                  className="font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Revisar Introdução
                </h3>
                <p
                  className="text-sm"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Veja novamente o tour dos módulos
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <OnboardingModal isOpen={showOnboarding} onClose={hideOnboarding} />
    </div>
  );
}
