import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

interface NotificationSettings {
  notifications_enabled?: boolean;
  notification_preference_hours?: number;
}

export function useNotificationSettings() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("Erro ao buscar perfil:", error);
        throw new Error("Falha ao carregar perfil");
      }

      return {
        id: data.id,
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.avatar_url,
        birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
        status: data.status,
        notifications_enabled: data.notifications_enabled,
        notification_preference_hours: data.notification_preference_hours,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    },
  });

  const updateNotificationSettings = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(settings)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar configurações de notificação:", error);
        throw new Error("Falha ao atualizar configurações");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Configurações de notificação atualizadas!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Erro ao atualizar configurações. Tente novamente.");
    },
  });

  const savePushToken = useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("push_notification_tokens")
        .upsert({
          user_id: user.id,
          token: subscription.toJSON(),
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar token de notificação:", error);
        throw new Error("Falha ao salvar token");
      }

      return data;
    },
    onError: (error) => {
      console.error("Erro ao salvar token:", error);
      toast.error("Erro ao salvar token de notificação.");
    },
  });

  const removePushToken = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("push_notification_tokens")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao remover token de notificação:", error);
        throw new Error("Falha ao remover token");
      }
    },
    onError: (error) => {
      console.error("Erro ao remover token:", error);
      toast.error("Erro ao remover token de notificação.");
    },
  });

  const subscribeToPush = async (): Promise<void> => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Push notifications não são suportadas neste navegador");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Permissão para notificações foi negada");
    }

    const registration = await navigator.serviceWorker.ready;

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error("Chave VAPID pública não configurada");
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    await savePushToken.mutateAsync(subscription);
  };

  const unsubscribeFromPush = async (): Promise<void> => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    await removePushToken.mutateAsync();
  };

  return {
    profile,
    isLoading,
    error,
    updateNotificationSettings,
    savePushToken,
    removePushToken,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
