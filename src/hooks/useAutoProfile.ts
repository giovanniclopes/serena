import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { createProfile } from "../services/apiProfile";

export function useAutoProfile() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkAndCreateProfile = async () => {
      if (!user || hasChecked.current) return;

      hasChecked.current = true;
      setIsChecking(true);

      try {
        // Verificar se o usuário já tem um perfil
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        // Se não tem perfil, criar um automaticamente
        if (!existingProfile) {
          await createProfile({
            username: user.email?.split("@")[0] || "usuario",
            firstName: user.user_metadata?.name || undefined,
            status: "active",
          });
          console.log(
            "✅ Perfil criado automaticamente para usuário existente"
          );
        }
      } catch (profileError) {
        console.log("⚠️ Erro ao verificar/criar perfil:", profileError);
      } finally {
        setIsChecking(false);
      }
    };

    checkAndCreateProfile();
  }, [user]);

  return { isChecking };
}
