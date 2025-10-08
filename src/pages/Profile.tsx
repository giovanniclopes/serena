import {
  Bell,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import OnboardingModal from "../components/OnboardingModal";
import ProfileCard from "../components/ProfileCard";
import { ProfileSkeleton } from "../components/skeletons/ProfileSkeleton";
import { useApp } from "../context/AppContext";
import { useProfile } from "../features/profile/useProfile";
import { useAutoProfile } from "../hooks/useAutoProfile";
import { useOnboarding } from "../hooks/useOnboarding";
import { useSkeletonLoading } from "../hooks/useSkeletonLoading";

export default function Profile() {
  const { state } = useApp();
  const { profile, isLoading, error } = useProfile();
  const { isChecking } = useAutoProfile();
  const { showOnboarding, showOnboardingAgain, hideOnboarding } =
    useOnboarding();
  const { showSkeleton } = useSkeletonLoading(isLoading || isChecking);
  const navigate = useNavigate();

  if (showSkeleton) {
    return <ProfileSkeleton />;
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          text: "Ativa",
          color: state.currentTheme.colors.success,
          bgColor: state.currentTheme.colors.success + "20",
        };
      case "inactive":
        return {
          text: "Inativa",
          color: state.currentTheme.colors.warning,
          bgColor: state.currentTheme.colors.warning + "20",
        };
      case "suspended":
        return {
          text: "Suspensa",
          color: state.currentTheme.colors.error,
          bgColor: state.currentTheme.colors.error + "20",
        };
      default:
        return {
          text: status,
          color: state.currentTheme.colors.textSecondary,
          bgColor: state.currentTheme.colors.textSecondary + "20",
        };
    }
  };

  const settingsItems = [
    {
      icon: Bell,
      title: "Notificações",
      description: "Configure lembretes de tarefas",
      href: "/notifications",
      color: "#3b82f6",
    },
    {
      icon: Settings,
      title: "Preferências",
      description: "Personalize sua experiência",
      href: "/settings",
      color: "#8b5cf6",
    },
    {
      icon: Shield,
      title: "Privacidade",
      description: "Gerencie seus dados",
      href: "/privacy",
      color: "#10b981",
    },
  ];

  const helpItems = [
    {
      icon: BookOpen,
      title: "Revisar Introdução",
      description: "Veja novamente o tour dos módulos",
      onClick: showOnboardingAgain,
      color: "#f59e0b",
    },
    {
      icon: HelpCircle,
      title: "Central de Ajuda",
      description: "Encontre respostas rápidas",
      href: "/help",
      color: "#06b6d4",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto lg:max-w-6xl xl:max-w-7xl px-2 py-4">
        <div className="mb-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: state.currentTheme.colors.primary + "12",
                  border: `1px solid ${state.currentTheme.colors.primary}20`,
                }}
              >
                <User
                  className="w-7 h-7"
                  style={{ color: state.currentTheme.colors.primary }}
                />
              </div>
              <div>
                <h1
                  className="text-xl md:text-2xl tracking-tight"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Perfil
                </h1>
                <p
                  className="text-sm md:text-lg mt-1 opacity-70"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Gerencie suas informações pessoais
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-1 mb-12 lg:mb-0">
            <div className="lg:sticky lg:top-8">
              <ProfileCard showEditButton={true} compact={false} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-16">
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h2
                  className="text-2xl font-light tracking-tight"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Configurações
                </h2>
                <div className="hidden lg:block w-12 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {settingsItems.map((item, index) => (
                  <div key={index}>
                    <div
                      className="group flex items-center justify-between py-5 px-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                      onClick={() => item.href && navigate(item.href)}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                          style={{ backgroundColor: item.color + "12" }}
                        >
                          <item.icon
                            className="w-5 h-5"
                            style={{ color: item.color }}
                          />
                        </div>
                        <div>
                          <h3
                            className="text-base font-medium"
                            style={{ color: state.currentTheme.colors.text }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-sm mt-0.5"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className="w-5 h-5 opacity-30 group-hover:opacity-60 transition-all duration-200 group-hover:translate-x-0.5"
                        style={{
                          color: state.currentTheme.colors.textSecondary,
                        }}
                      />
                    </div>
                    {index < settingsItems.length - 1 && (
                      <div className="h-px bg-gray-100 dark:bg-gray-800 mx-6"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {profile && (
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <h2
                    className="text-2xl font-light tracking-tight"
                    style={{ color: state.currentTheme.colors.text }}
                  >
                    Informações da Conta
                  </h2>
                  <div className="hidden lg:block w-12 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="space-y-0">
                      <div className="py-6 px-6 border-b border-gray-100 dark:border-gray-800 lg:border-b-0 lg:border-r">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            ID do Usuário
                          </p>
                        </div>
                        <p
                          className="text-base font-mono bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg"
                          style={{ color: state.currentTheme.colors.text }}
                        >
                          {profile.id}
                        </p>
                      </div>

                      <div className="py-6 px-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            Status da Conta
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getStatusInfo(profile.status)
                                .color,
                            }}
                          />
                          <p
                            className="text-base font-medium"
                            style={{
                              color: getStatusInfo(profile.status).color,
                            }}
                          >
                            {getStatusInfo(profile.status).text}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0">
                      <div className="py-6 px-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            Data de Cadastro
                          </p>
                        </div>
                        <p
                          className="text-base"
                          style={{ color: state.currentTheme.colors.text }}
                        >
                          {profile.createdAt.toLocaleDateString("pt-BR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="py-6 px-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            Última Atualização
                          </p>
                        </div>
                        <p
                          className="text-base"
                          style={{ color: state.currentTheme.colors.text }}
                        >
                          {profile.updatedAt.toLocaleDateString("pt-BR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h2
                  className="text-2xl font-light tracking-tight"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Ajuda e Suporte
                </h2>
                <div className="hidden lg:block w-12 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {helpItems.map((item, index) => (
                  <div key={index}>
                    <div
                      className="group flex items-center justify-between py-5 px-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                      onClick={
                        item.onClick || (() => item.href && navigate(item.href))
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                          style={{ backgroundColor: item.color + "12" }}
                        >
                          <item.icon
                            className="w-5 h-5"
                            style={{ color: item.color }}
                          />
                        </div>
                        <div>
                          <h3
                            className="text-base font-medium"
                            style={{ color: state.currentTheme.colors.text }}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="text-sm mt-0.5"
                            style={{
                              color: state.currentTheme.colors.textSecondary,
                            }}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className="w-5 h-5 opacity-30 group-hover:opacity-60 transition-all duration-200 group-hover:translate-x-0.5"
                        style={{
                          color: state.currentTheme.colors.textSecondary,
                        }}
                      />
                    </div>
                    {index < helpItems.length - 1 && (
                      <div className="h-px bg-gray-100 dark:bg-gray-800 mx-6"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-16" />
      </div>

      <OnboardingModal isOpen={showOnboarding} onClose={hideOnboarding} />
    </div>
  );
}
