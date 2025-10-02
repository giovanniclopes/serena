import { supabase } from "../lib/supabaseClient";

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split("@")[0],
      },
    },
  });

  if (error) {
    console.error("Erro ao criar conta:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro ao fazer login:", error);

    if (error.message === "Invalid login credentials") {
      throw new Error(
        "Email ou senha incorretos. Verifique suas credenciais e tente novamente."
      );
    }

    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Erro ao fazer logout:", error);
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<unknown | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error.message !== "Auth session missing!") {
      console.error("Erro ao obter usuário atual:", error);
    }
    return null;
  }

  return user;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    throw new Error(error.message);
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Erro ao atualizar senha:", error);
    throw new Error(error.message);
  }
}

export async function updateProfile(updates: {
  name?: string;
  avatar_url?: string;
}) {
  const { error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw new Error(error.message);
  }
}
