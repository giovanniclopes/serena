import { supabase } from "../lib/supabaseClient";
import type {
  CreateUserProfileData,
  UpdateUserProfileData,
  UserProfile,
} from "../types";

export async function getCurrentProfile(): Promise<UserProfile | null> {
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
      // Perfil não encontrado, retorna null
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
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function createProfile(
  profileData: CreateUserProfileData
): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username: profileData.username,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      avatar_url: profileData.avatarUrl,
      birth_date: profileData.birthDate?.toISOString().split("T")[0],
      status: profileData.status || "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar perfil:", error);
    throw new Error("Falha ao criar perfil");
  }

  return {
    id: data.id,
    username: data.username,
    firstName: data.first_name,
    lastName: data.last_name,
    avatarUrl: data.avatar_url,
    birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateProfile(
  profileData: UpdateUserProfileData
): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const updateData: any = {};

  if (profileData.username !== undefined)
    updateData.username = profileData.username;
  if (profileData.firstName !== undefined)
    updateData.first_name = profileData.firstName;
  if (profileData.lastName !== undefined)
    updateData.last_name = profileData.lastName;
  if (profileData.avatarUrl !== undefined)
    updateData.avatar_url = profileData.avatarUrl;
  if (profileData.birthDate !== undefined) {
    updateData.birth_date =
      profileData.birthDate?.toISOString().split("T")[0] || null;
  }
  if (profileData.status !== undefined) updateData.status = profileData.status;

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw new Error("Falha ao atualizar perfil");
  }

  return {
    id: data.id,
    username: data.username,
    firstName: data.first_name,
    lastName: data.last_name,
    avatarUrl: data.avatar_url,
    birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
    status: data.status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function uploadAvatar(file: File): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Erro ao fazer upload do avatar:", uploadError);
    throw new Error("Falha ao fazer upload do avatar");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteAvatar(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    const fileName = profile.avatar_url.split("/").pop();
    if (fileName) {
      await supabase.storage.from("avatars").remove([`avatars/${fileName}`]);
    }
  }
}
