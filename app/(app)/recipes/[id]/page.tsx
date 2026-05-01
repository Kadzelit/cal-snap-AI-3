import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipeEditClient } from "./RecipeEditClient";

export default async function RecipeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: recipe }, { data: ingredients }] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, name, description, photo_url")
      .eq("id", id)
      .single(),
    supabase
      .from("recipe_ingredients")
      .select("id, name, quantity_g, calories, protein_g, carbs_g, fat_g")
      .eq("recipe_id", id)
      .order("position", { ascending: true }),
  ]);

  if (!recipe) notFound();

  return (
    <RecipeEditClient
      recipeId={recipe.id}
      initialName={recipe.name}
      initialDescription={recipe.description ?? ""}
      initialPhotoUrl={recipe.photo_url ?? null}
      initialIngredients={(ingredients ?? []).map((ing) => ({
        id: ing.id,
        name: ing.name,
        quantity_g: Number(ing.quantity_g),
        calories: Number(ing.calories),
        protein_g: Number(ing.protein_g),
        carbs_g: Number(ing.carbs_g),
        fat_g: Number(ing.fat_g),
      }))}
    />
  );
}
