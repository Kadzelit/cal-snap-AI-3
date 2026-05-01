export type Gender = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  active: 1.55,
  very_active: 1.725,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export type TdeeParams = {
  gender: Gender;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
};

export type MacroTargets = {
  daily_calorie_target: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
};

export function calculateTdee(params: TdeeParams): MacroTargets {
  const { gender, age, height_cm, weight_kg, activity_level, goal } = params;

  // Mifflin-St Jeor
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity_level];
  const daily_calorie_target = Math.round(tdee + GOAL_ADJUSTMENTS[goal]);

  // Répartition macros : 30% protéines, 40% glucides, 30% lipides
  // Ajustement selon l'objectif
  const proteinRatio = goal === "gain" ? 0.35 : 0.30;
  const carbsRatio = goal === "lose" ? 0.35 : 0.40;
  const fatRatio = 1 - proteinRatio - carbsRatio;

  return {
    daily_calorie_target: Math.max(1200, daily_calorie_target),
    daily_protein_g: Math.round((daily_calorie_target * proteinRatio) / 4),
    daily_carbs_g: Math.round((daily_calorie_target * carbsRatio) / 4),
    daily_fat_g: Math.round((daily_calorie_target * fatRatio) / 9),
  };
}
