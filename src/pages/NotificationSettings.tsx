import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { Bell } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { useApp } from "../context/AppContext";

export default function NotificationSettings() {
  const { state } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const {
    profile,
    isLoading: profileLoading,
    updateNotificationSettings,
    subscribeToPush,
    unsubscribeFromPush,
  } = useNotificationSettings();

  const handleNotificationToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      if (checked) {
        await subscribeToPush();
        await updateNotificationSettings.mutateAsync({
          notifications_enabled: true,
        });
      } else {
        await unsubscribeFromPush();
        await updateNotificationSettings.mutateAsync({
          notifications_enabled: false,
        });
      }
    } catch (error) {
      console.error("Erro ao alterar configurações de notificação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (value: string) => {
    try {
      await updateNotificationSettings.mutateAsync({
        notification_preference_hours: parseInt(value),
      });
    } catch (error) {
      console.error("Erro ao atualizar preferência de notificação:", error);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="text-lg"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Carregando configurações...
          </div>
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
          <Bell
            className="w-6 h-6"
            style={{ color: state.currentTheme.colors.primary }}
          />
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: state.currentTheme.colors.text }}
          >
            Notificações
          </h1>
          <p
            className="text-sm"
            style={{ color: state.currentTheme.colors.textSecondary }}
          >
            Configure suas preferências de notificação
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card
          style={{
            backgroundColor: state.currentTheme.colors.surface,
            borderColor: state.currentTheme.colors.border,
          }}
        >
          <CardHeader>
            <CardTitle
              className="font-nunito"
              style={{ color: state.currentTheme.colors.text }}
            >
              Notificações de Prazos
            </CardTitle>
            <CardDescription
              className="font-nunito"
              style={{ color: state.currentTheme.colors.textSecondary }}
            >
              Receba lembretes serenos sobre as suas tarefas antes que elas
              vençam.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <Label
                htmlFor="notifications-switch"
                className="flex flex-col space-y-1"
                style={{ color: state.currentTheme.colors.text }}
              >
                <span className="font-nunito font-medium">
                  Ativar notificações
                </span>
                <span
                  className="font-normal text-sm"
                  style={{ color: state.currentTheme.colors.textSecondary }}
                >
                  Iremos pedir a sua permissão no browser.
                </span>
              </Label>
              <Switch
                id="notifications-switch"
                checked={profile?.notifications_enabled || false}
                onCheckedChange={handleNotificationToggle}
                disabled={isLoading || updateNotificationSettings.isPending}
              />
            </div>

            {profile?.notifications_enabled && (
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="when-to-notify"
                  className="font-nunito font-medium"
                  style={{ color: state.currentTheme.colors.text }}
                >
                  Lembrar-me quando
                </Label>
                <Select
                  value={
                    profile?.notification_preference_hours?.toString() || "24"
                  }
                  onValueChange={handlePreferenceChange}
                  disabled={updateNotificationSettings.isPending}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora antes</SelectItem>
                    <SelectItem value="3">3 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes</SelectItem>
                    <SelectItem value="48">2 dias antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
