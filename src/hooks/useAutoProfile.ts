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
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", (user as any).id)
          .single();

        if (!existingProfile) {
          await createProfile({
            username: (user as any).email?.split("@")[0] || "usuario",
            firstName: (user as any).user_metadata?.name || undefined,
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
