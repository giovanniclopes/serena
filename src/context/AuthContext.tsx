import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";
import { createProfile } from "../services/apiProfile";
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

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      // Criar perfil automaticamente se o usuário não tiver um
      if (event === "SIGNED_IN" && session?.user) {
        try {
          // Verificar se o usuário já tem um perfil
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();

          // Se não tem perfil, criar um automaticamente
          if (!existingProfile) {
            await createProfile({
              username: session.user.email?.split("@")[0] || "usuario",
              firstName: session.user.user_metadata?.name || undefined,
              status: "active",
            });
            console.log(
              "✅ Perfil criado automaticamente para usuário existente"
            );
          }
        } catch (profileError) {
          console.log("⚠️ Erro ao verificar/criar perfil:", profileError);
          // Não falha o login se não conseguir criar o perfil
        }
      }

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

      // Criar perfil automaticamente após cadastro bem-sucedido
      if (result?.user) {
        try {
          await createProfile({
            username: name || email.split("@")[0],
            firstName: name || undefined,
            status: "active",
          });
          console.log("✅ Perfil criado automaticamente");
        } catch (profileError) {
          console.log("⚠️ Erro ao criar perfil automaticamente:", profileError);
          // Não falha o cadastro se não conseguir criar o perfil
        }
      }

      toast.success(
        "Conta criada com sucesso! Verifique seu email para confirmar."
      );
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
    throw new Error("UseAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
