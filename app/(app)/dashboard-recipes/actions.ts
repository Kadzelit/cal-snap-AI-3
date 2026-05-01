"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export async function logRecipe(recipeId: string, mealType: MealType) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { data: recipe } = await supabase
    .from("recipes")
    .select("name, total_calories, total_protein_g, total_carbs_g, total_fat_g")
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .single();

  if (!recipe) return { error: "Recette introuvable" };

  const { error } = await supabase.from("meals").insert({
    user_id: user.id,
    name: recipe.name,
    meal_type: mealType,
    calories: recipe.total_calories ?? 0,
    protein_g: recipe.total_protein_g ?? 0,
    carbs_g: recipe.total_carbs_g ?? 0,
    fat_g: recipe.total_fat_g ?? 0,
    recipe_id: recipeId,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard-recipes");
  return { success: true };
}

export async function deleteRecipe(recipeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("recipes").delete().eq("id", recipeId).eq("user_id", user.id);
  revalidatePath("/dashboard-recipes");
}
