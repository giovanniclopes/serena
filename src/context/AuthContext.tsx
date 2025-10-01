import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { getCurrentUser, signIn, signOut, signUp } from "../services/auth";

interface AuthContextType {
  user: unknown | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);

  console.log(
    "🔧 AuthProvider - Current user:",
    user?.email,
    "Loading:",
    loading
  );

  useEffect(() => {
    // Verificar se há um usuário logado
    getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Escutar mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔐 Auth state changed:",
        event,
        session?.user?.email,
        "User:",
        session?.user
      );
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    console.log("🚀 Starting sign in for:", email);
    setLoading(true);
    try {
      const result = await signIn(email, password);
      console.log("✅ Sign in successful:", result);
      toast.success("Login realizado com sucesso!");
      // Não definir loading como false aqui - deixar o onAuthStateChange fazer isso
    } catch (error) {
      console.log("❌ Sign in error:", error);
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
      await signUp(email, password, name);
      toast.success(
        "Conta criada com sucesso! Verifique seu email para confirmar."
      );
      // Não definir loading como false aqui - deixar o onAuthStateChange fazer isso
    } catch (error) {
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
      toast.error("Erro ao fazer logout. Tente novamente.");
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
