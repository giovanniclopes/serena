import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useOnboarding } from "../hooks/useOnboarding";
import { supabase } from "../lib/supabaseClient";
import { createProfile } from "../services/apiProfile";
import {
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword
} from "../services/auth";

interface AuthContextType {
  user: unknown | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const { markAsNewUser } = useOnboarding();
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    console.log("🚀 Iniciando login para:", email);
    setLoading(true);
    try {
      const result = await signIn(email, password);
      console.log("✅ Login realizado com sucesso:", result);
    } catch (error) {
      console.log("❌ Erro ao fazer login:", error);
      setLoading(false);
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
      throw error;
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name?: string
  ) => {
    setLoading(true);
    try {
      const result = await signUp(email, password, name);

      if (result?.user) {
        try {
          await createProfile({
            username: name || email.split("@")[0],
            firstName: name || undefined,
            status: "active"
          });
          console.log("✅ Perfil criado automaticamente");
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.removeQueries({ queryKey: ["profile"] });
          markAsNewUser();
        } catch (profileError) {
          console.log("⚠️ Erro ao criar perfil automaticamente:", profileError);
          if (!(profileError as Error)?.message?.includes("duplicate key")) {
            console.error("Erro inesperado ao criar perfil:", profileError);
          }
        }
      }

      toast.success(
        "Conta criada com sucesso! Verifique seu email para confirmar."
      );

      window.location.href = `/email-verification?email=${encodeURIComponent(
        email
      )}`;
    } catch (error) {
      console.log("❌ Erro ao criar conta:", error);
      setLoading(false);
      toast.error("Erro ao criar conta. Tente novamente.");
      throw error;
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      console.log("❌ Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success("E-mail de recuperação enviado com sucesso!");
    } catch (error) {
      console.log("❌ Erro ao enviar e-mail de recuperação:", error);
      toast.error("Erro ao enviar e-mail de recuperação. Tente novamente.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (password: string) => {
    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Senha atualizada com sucesso!");
    } catch (error) {
      console.log("❌ Erro ao atualizar senha:", error);
      toast.error("Erro ao atualizar senha. Tente novamente.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("UseAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
