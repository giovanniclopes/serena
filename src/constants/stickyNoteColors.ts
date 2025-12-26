export const STICKY_NOTE_COLORS = [
  { name: "Amarelo", value: "#fffacd" },
  { name: "Rosa", value: "#ffb3ba" },
  { name: "Vermelho", value: "#ff6b6b" },
  { name: "Azul", value: "#bae1ff" },
  { name: "Verde", value: "#baffc9" },
  { name: "Laranja", value: "#ffdfba" },
  { name: "Roxo", value: "#e0bbff" },
  { name: "Branco", value: "#ffffff" },
  { name: "Cinza", value: "#f0f0f0" },
] as const;

export const DEFAULT_STICKY_NOTE_COLOR = STICKY_NOTE_COLORS[0].value;

export const STICKY_NOTE_SIZES = {
  small: { width: 250, height: 200 },
  medium: { width: 300, height: 250 },
  large: { width: 350, height: 300 },
} as const;

export type StickyNoteSize = keyof typeof STICKY_NOTE_SIZES;
