import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn(
    "VITE_GOOGLE_AI_API_KEY não encontrada. Funcionalidades de IA serão desabilitadas."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI?.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

export const isGeminiAvailable = () => {
  return !!apiKey && !!geminiModel;
};
