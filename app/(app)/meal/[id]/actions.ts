"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export async function updateMeal(
  id: string,
  data: {
    name: string;
    meal_type: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  }
) {
  const supabase = await createClient();
  const validTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const meal_type = validTypes.includes(data.meal_type as MealType)
    ? (data.meal_type as MealType)
    : null;

  await supabase
    .from("meals")
    .update({
      name: data.name,
      meal_type,
      ...(data.calories !== undefined && { calories: data.calories }),
      ...(data.protein_g !== undefined && { protein_g: data.protein_g }),
      ...(data.carbs_g !== undefined && { carbs_g: data.carbs_g }),
      ...(data.fat_g !== undefined && { fat_g: data.fat_g }),
    })
    .eq("id", id);

  revalidatePath("/dashboard");
}
