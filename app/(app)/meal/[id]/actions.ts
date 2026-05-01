"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export async function updateMeal(id: string, data: { name: string; meal_type: string }) {
  const supabase = await createClient();
  const validTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const meal_type = validTypes.includes(data.meal_type as MealType)
    ? (data.meal_type as MealType)
    : null;
  await supabase
    .from("meals")
    .update({ name: data.name, meal_type })
    .eq("id", id);
  revalidatePath("/dashboard");
}
