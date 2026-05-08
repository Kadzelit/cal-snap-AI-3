"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateTdee } from "@/lib/tdee";
import type { Gender, ActivityLevel, Goal } from "@/lib/tdee";

export type SaveProfileParams = {
  gender: Gender;
  birth_date: string;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
};

export async function saveOnboardingProfile(params: SaveProfileParams) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const age = Math.floor(
    (Date.now() - new Date(params.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const targets = calculateTdee({
    gender: params.gender,
    age,
    height_cm: params.height_cm,
    weight_kg: params.weight_kg,
    activity_level: params.activity_level,
    goal: params.goal,
  });

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    gender: params.gender,
    birth_date: params.birth_date,
    height_cm: params.height_cm,
    weight_kg: params.weight_kg,
    activity_level: params.activity_level,
    goal: params.goal,
    ...targets,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  return targets;
}
