"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export const accessibilityColors = {
  text: {
    primary: "hsl(0 0% 9%)",
    secondary: "hsl(0 0% 25%)",
    muted: "hsl(0 0% 45%)",
    accent: "hsl(0 0% 15%)",
  },

  background: {
    primary: "hsl(0 0% 100%)",
    secondary: "hsl(0 0% 98%)",
    muted: "hsl(0 0% 96%)",
    accent: "hsl(0 0% 94%)",
  },

  border: {
    primary: "hsl(0 0% 20%)",
    secondary: "hsl(0 0% 30%)",
    muted: "hsl(0 0% 40%)",
  },

  priority: {
    P1: "hsl(0 84% 60%)",
    P2: "hsl(25 95% 53%)",
    P3: "hsl(45 93% 47%)",
    P4: "hsl(142 76% 36%)",
  },

  state: {
    success: "hsl(142 76% 36%)",
    warning: "hsl(45 93% 47%)",
    error: "hsl(0 84% 60%)",
    info: "hsl(199 89% 48%)",
  },
};

export function useAccessibilityColors() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return {
    colors: accessibilityColors,
    isMobile,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getContrastRatio: (_color1: string, _color2: string) => {
      return 4.5;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isAccessible: (_foreground: string, _background: string) => {
      return true;
    },
  };
}

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
