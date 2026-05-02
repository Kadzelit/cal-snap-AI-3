import Groq from "groq-sdk";
import { MEAL_ANALYSIS_PROMPT, TEXT_MEAL_ANALYSIS_PROMPT } from "../prompts";
import type { VisionProvider, MealAnalysis } from "../types";
import { MealAnalysisSchema } from "@/lib/validators/meal-analysis";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function extractJson(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Aucun JSON trouvé dans la réponse");
  return raw.slice(start, end + 1);
}

export const groqProvider: VisionProvider = {
  name: "groq",

  async analyzeTextMeal(text: string): Promise<MealAnalysis> {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `${TEXT_MEAL_ANALYSIS_PROMPT}\n\nDescription du repas : "${text}"`,
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

    if (parsed.error === "not_food") {
      throw new Error("NOT_FOOD");
    }

    return MealAnalysisSchema.parse(parsed);
  },

  async analyzeMeal(imageInput: string): Promise<MealAnalysis> {
    const imageUrl = imageInput.startsWith("http")
      ? imageInput
      : `data:image/jpeg;base64,${imageInput}`;

    // response_format est incompatible avec les requêtes vision sur Groq
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: MEAL_ANALYSIS_PROMPT },
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

    if (parsed.error === "not_food") {
      throw new Error("NOT_FOOD");
    }

    return MealAnalysisSchema.parse(parsed);
  },
};
