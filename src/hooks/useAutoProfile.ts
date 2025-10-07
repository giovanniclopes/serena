import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { createProfile } from "../services/apiProfile";

export function useAutoProfile() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const hasChecked = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAndCreateProfile = async () => {
      if (!user || hasChecked.current) return;

      hasChecked.current = true;
      setIsChecking(true);

      try {
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", (user as any).id)
          .single();

        if (profileError?.code === "PGRST116" || !existingProfile) {
          await createProfile({
            username: (user as any).email?.split("@")[0] || "usuario",
            firstName: (user as any).user_metadata?.name || undefined,
            status: "active",
          });
          console.log(
            "✅ Perfil criado automaticamente para usuário existente"
          );
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
      } catch (profileError) {
        console.log("⚠️ Erro ao verificar/criar perfil:", profileError);
        if (!(profileError as Error)?.message?.includes("duplicate key")) {
          console.error("Erro inesperado ao criar perfil:", profileError);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAndCreateProfile();
  }, [user, queryClient]);

  useEffect(() => {
    hasChecked.current = false;
  }, [(user as any)?.id]);

  return { isChecking };
}
