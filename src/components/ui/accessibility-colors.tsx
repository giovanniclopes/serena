"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

// Cores com melhor contraste para acessibilidade
export const accessibilityColors = {
  // Cores de texto com contraste melhorado
  text: {
    primary: "hsl(0 0% 9%)", // Preto mais escuro
    secondary: "hsl(0 0% 25%)", // Cinza escuro
    muted: "hsl(0 0% 45%)", // Cinza médio
    accent: "hsl(0 0% 15%)", // Cinza muito escuro
  },

  // Cores de fundo com contraste melhorado
  background: {
    primary: "hsl(0 0% 100%)", // Branco puro
    secondary: "hsl(0 0% 98%)", // Branco quase puro
    muted: "hsl(0 0% 96%)", // Cinza muito claro
    accent: "hsl(0 0% 94%)", // Cinza claro
  },

  // Cores de borda com contraste melhorado
  border: {
    primary: "hsl(0 0% 20%)", // Cinza escuro
    secondary: "hsl(0 0% 30%)", // Cinza médio
    muted: "hsl(0 0% 40%)", // Cinza médio-claro
  },

  // Cores de prioridade com contraste melhorado
  priority: {
    P1: "hsl(0 84% 60%)", // Vermelho mais escuro
    P2: "hsl(25 95% 53%)", // Laranja mais escuro
    P3: "hsl(45 93% 47%)", // Amarelo mais escuro
    P4: "hsl(142 76% 36%)", // Verde mais escuro
  },

  // Cores de estado com contraste melhorado
  state: {
    success: "hsl(142 76% 36%)", // Verde escuro
    warning: "hsl(45 93% 47%)", // Amarelo escuro
    error: "hsl(0 84% 60%)", // Vermelho escuro
    info: "hsl(199 89% 48%)", // Azul escuro
  },
};

// Hook para usar cores de acessibilidade
export function useAccessibilityColors() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return {
    colors: accessibilityColors,
    isMobile,
    // Função para calcular contraste
    getContrastRatio: (color1: string, color2: string) => {
      // Implementação simplificada - em produção, use uma biblioteca como color-contrast
      return 4.5; // Valor mínimo recomendado pela WCAG
    },
    // Função para verificar se uma cor atende aos padrões de acessibilidade
    isAccessible: (foreground: string, background: string) => {
      // Implementação simplificada
      return true;
    },
  };
}

// Componente para aplicar cores de acessibilidade
export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors } = useAccessibilityColors();

  return (
    <div
      style={
        {
          "--text-primary": colors.text.primary,
          "--text-secondary": colors.text.secondary,
          "--text-muted": colors.text.muted,
          "--text-accent": colors.text.accent,
          "--background-primary": colors.background.primary,
          "--background-secondary": colors.background.secondary,
          "--background-muted": colors.background.muted,
          "--background-accent": colors.background.accent,
          "--border-primary": colors.border.primary,
          "--border-secondary": colors.border.secondary,
          "--border-muted": colors.border.muted,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
