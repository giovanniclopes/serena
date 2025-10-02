import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registrado com sucesso:", registration);
      })
      .catch((registrationError) => {
        console.log("Falha no registro do SW:", registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster richColors position="top-right" />
    <Analytics />
  </QueryClientProvider>
);
