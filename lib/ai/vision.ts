import { groqProvider } from "./providers/groq";
import type { ProviderName, VisionProvider } from "./types";

const providers: Record<string, VisionProvider> = {
  groq: groqProvider,
  // openai: openaiProvider,  // décommenter pour activer
  // claude: claudeProvider,
  // mistral: mistralProvider,
};

const activeProviderName = (process.env.AI_VISION_PROVIDER || "groq") as ProviderName;

export const visionProvider = providers[activeProviderName];

if (!visionProvider) {
  throw new Error(`Provider IA inconnu : "${activeProviderName}". Valeurs valides : ${Object.keys(providers).join(", ")}`);
}

export async function analyzeMeal(imageBase64OrUrl: string, userContext?: string | null) {
  return visionProvider.analyzeMeal(imageBase64OrUrl, userContext);
}

export async function analyzeTextMeal(text: string, userContext?: string | null) {
  return visionProvider.analyzeTextMeal(text, userContext);
}

export async function analyzeBody(imageBase64OrUrl: string, userContext?: string | null, gender?: string | null, age?: number | null) {
  if (!visionProvider.analyzeBody) {
    throw new Error(`Le provider "${visionProvider.name}" ne supporte pas l'analyse corporelle`);
  }
  return visionProvider.analyzeBody(imageBase64OrUrl, userContext, gender, age);
}
