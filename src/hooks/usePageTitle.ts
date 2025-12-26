import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "Serena - Início",
  "/tasks": "Serena - Tarefas",
  "/new-task": "Serena - Nova Tarefa",
  "/projects": "Serena - Projetos",
  "/habits": "Serena - Hábitos",
  "/calendar": "Serena - Calendário",
  "/countdowns": "Serena - Contadores",
  "/shopping-lists": "Serena - Listas de Compras",
  "/sticky-notes": "Serena - Post-its",
  "/profile": "Serena - Perfil",
  "/notifications": "Serena - Notificações",
  "/login": "Serena - Entrar",
  "/register": "Serena - Cadastrar",
  "/email-verification": "Serena - Verificar Email",
};

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const title =
      pageTitles[location.pathname] || "Serena - App de Produtividade";
    document.title = title;
  }, [location.pathname]);

  return pageTitles[location.pathname] || "Serena - App de Produtividade";
}
