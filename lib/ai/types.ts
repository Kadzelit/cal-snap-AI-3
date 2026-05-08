export type MealItem = {
  name: string;
  estimated_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type MealAnalysis = {
  meal_name: string;
  items: MealItem[];
  total: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  confidence: number;
};

export type BodyAnalysis = {
  body_fat_pct: number;
  lean_mass_pct: number;
  category: string;
  description: string;
  confidence: number;
};

export type VisionProvider = {
  name: string;
  analyzeMeal: (imageBase64OrUrl: string) => Promise<MealAnalysis>;
  analyzeTextMeal: (text: string) => Promise<MealAnalysis>;
  analyzeBody?: (imageBase64OrUrl: string) => Promise<BodyAnalysis>;
};

export type ProviderName = "groq" | "openai" | "claude" | "mistral";
