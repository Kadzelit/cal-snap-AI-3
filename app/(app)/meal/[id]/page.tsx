import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MealResultClient } from "./MealResultClient";
import type { MealAnalysis } from "@/lib/ai/types";

type PageProps = { params: Promise<{ id: string }> };

export default async function MealPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: meal } = await supabase
    .from("meals")
    .select("*")
    .eq("id", id)
    .single();

  if (!meal) notFound();

  const rawAnalysis = meal.ai_raw_response as unknown as MealAnalysis | null;

  return (
    <MealResultClient
      meal={{
        id: meal.id,
        name: meal.name,
        photo_url: meal.photo_url,
        meal_type: meal.meal_type,
        calories: meal.calories,
        protein_g: Number(meal.protein_g),
        carbs_g: Number(meal.carbs_g),
        fat_g: Number(meal.fat_g),
        ai_confidence: meal.ai_confidence ? Number(meal.ai_confidence) : null,
        items: rawAnalysis?.items ?? [],
      }}
    />
  );
}
