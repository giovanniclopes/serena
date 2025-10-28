import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_AI_API;

if (!apiKey) {
  console.warn(
    "VITE_GOOGLE_AI_API não encontrada. Funcionalidades de IA serão desabilitadas."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI?.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export const isGeminiAvailable = () => {
  return !!apiKey && !!geminiModel;
};
