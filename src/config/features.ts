export const FEATURES = {
  AI_ENABLED: import.meta.env.VITE_ENABLE_AI_FEATURES === "true",
} as const;

export const PROMPT_GENERATION_ALLOWED_USER_IDS: string[] = [
  "f8852d04-81ed-42a5-a009-451097e0678d",
];

export function canUserGeneratePrompt(userId: string | undefined): boolean {
  if (!userId) return false;
  return PROMPT_GENERATION_ALLOWED_USER_IDS.includes(userId);
}
