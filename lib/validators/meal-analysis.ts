import { z } from "zod";

const MealItemSchema = z.object({
  name: z.string().min(1),
  estimated_grams: z.number().nonnegative(),
  calories: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
});

export const MealAnalysisSchema = z.object({
  meal_name: z.string().min(1),
  items: z.array(MealItemSchema),
  total: z.object({
    calories: z.number().nonnegative(),
    protein_g: z.number().nonnegative(),
    carbs_g: z.number().nonnegative(),
    fat_g: z.number().nonnegative(),
  }),
  confidence: z.number().min(0).max(1),
});

export type MealAnalysisInput = z.infer<typeof MealAnalysisSchema>;
