import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProfile,
  deleteAvatar,
  getCurrentProfile,
  updateProfile,
  uploadAvatar,
} from "../../services/apiProfile";

export function useProfile() {
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentProfile,
    staleTime: 1000 * 60 * 15, // 15 minutos (perfil muda pouco)
    gcTime: 1000 * 60 * 30, // 30 minutos
  });

  return { profile, isLoading, error };
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar perfil:", error);
      toast.error("Erro ao criar perfil. Tente novamente.");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (avatarUrl) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar atualizado com sucesso!");
      return avatarUrl;
    },
    onError: (error) => {
      console.error("Erro ao fazer upload do avatar:", error);
      toast.error("Erro ao fazer upload do avatar. Tente novamente.");
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar removido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao remover avatar:", error);
      toast.error("Erro ao remover avatar. Tente novamente.");
    },
  });
}
