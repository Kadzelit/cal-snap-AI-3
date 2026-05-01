"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type IngredientInput = {
  name: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export async function updateRecipe(
  id: string,
  data: { name: string; description?: string; photo_url?: string | null; ingredients: IngredientInput[] }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const totals = data.ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + (ing.calories || 0),
      protein_g: acc.protein_g + (ing.protein_g || 0),
      carbs_g: acc.carbs_g + (ing.carbs_g || 0),
      fat_g: acc.fat_g + (ing.fat_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  await supabase
    .from("recipes")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      photo_url: data.photo_url ?? null,
      total_calories: Math.round(totals.calories),
      total_protein_g: Math.round(totals.protein_g * 10) / 10,
      total_carbs_g: Math.round(totals.carbs_g * 10) / 10,
      total_fat_g: Math.round(totals.fat_g * 10) / 10,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  // Replace all ingredients
  await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);

  if (data.ingredients.length > 0) {
    await supabase.from("recipe_ingredients").insert(
      data.ingredients.map((ing, i) => ({
        recipe_id: id,
        name: ing.name,
        quantity_g: ing.quantity_g,
        calories: Math.round(ing.calories),
        protein_g: Math.round(ing.protein_g * 10) / 10,
        carbs_g: Math.round(ing.carbs_g * 10) / 10,
        fat_g: Math.round(ing.fat_g * 10) / 10,
        position: i,
      }))
    );
  }

  revalidatePath("/dashboard-recipes");
  redirect("/dashboard-recipes");
}
