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

export async function analyzeMeal(imageBase64OrUrl: string) {
  return visionProvider.analyzeMeal(imageBase64OrUrl);
}
