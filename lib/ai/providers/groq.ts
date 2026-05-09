import Groq from "groq-sdk";
import { buildMealPrompt, buildTextMealPrompt, buildBodyPrompt } from "../prompts";
import type { VisionProvider, MealAnalysis, BodyAnalysis } from "../types";
import { MealAnalysisSchema } from "@/lib/validators/meal-analysis";
import { BodyAnalysisSchema } from "@/lib/validators/body-analysis";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function extractJson(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Aucun JSON trouvé dans la réponse");
  return raw.slice(start, end + 1);
}

export const groqProvider: VisionProvider = {
  name: "groq",

  async analyzeTextMeal(text: string, userContext?: string | null): Promise<MealAnalysis> {
    const prompt = buildTextMealPrompt(userContext);
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nDescription du repas : "${text}"`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide du modèle");

    const jsonStr = extractJson(content);
    const parsed = JSON.parse(jsonStr);

    if (parsed.error === "not_food") throw new Error("NOT_FOOD");

    return MealAnalysisSchema.parse(parsed);
  },

  async analyzeMeal(imageInput: string, userContext?: string | null): Promise<MealAnalysis> {
    const imageUrl = imageInput.startsWith("http")
      ? imageInput
      : `data:image/jpeg;base64,${imageInput}`;

    // response_format est incompatible avec les requêtes vision sur Groq
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_VISION_MODEL || "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildMealPrompt(userContext) },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide du modèle");

    const jsonStr = extractJson(content);
    const parsed = JSON.parse(jsonStr);

    if (parsed.error === "not_food") throw new Error("NOT_FOOD");

    return MealAnalysisSchema.parse(parsed);
  },

  async analyzeBody(imageInput: string, userContext?: string | null, gender?: string | null, age?: number | null): Promise<BodyAnalysis> {
    const imageUrl = imageInput.startsWith("http")
      ? imageInput
      : `data:image/jpeg;base64,${imageInput}`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_VISION_MODEL || "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildBodyPrompt(userContext, gender, age) },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide du modèle");

    const jsonStr = extractJson(content);
    const parsed = JSON.parse(jsonStr);

    if (parsed.error === "not_visible") throw new Error("NOT_VISIBLE");
    if (parsed.error === "not_person") throw new Error("NOT_PERSON");

    return BodyAnalysisSchema.parse(parsed);
  },
};
