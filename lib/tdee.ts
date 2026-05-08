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
  target_weight_kg?: number | null;
  target_date?: string | null; // YYYY-MM-DD
};

export type MacroTargets = {
  daily_calorie_target: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
};

export function calculateTdee(params: TdeeParams): MacroTargets {
  const { gender, age, height_cm, weight_kg, activity_level, goal, target_weight_kg, target_date } = params;

  // Mifflin-St Jeor
  const bmr = gender === "male"
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity_level];

  // Calcul de l'ajustement calorique
  // Si poids cible + date cible fournis, calcule le déficit/surplus exact requis
  let calorieAdjustment = GOAL_ADJUSTMENTS[goal];
  if (target_weight_kg && target_date) {
    const today = new Date();
    const targetDateObj = new Date(target_date);
    const daysRemaining = Math.floor((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining > 7) {
      // 1 kg de graisse ≈ 7700 kcal
      const weightDelta = target_weight_kg - weight_kg;
      const requiredDailyDelta = (weightDelta * 7700) / daysRemaining;
      // Sécurité : max -1000 kcal/j (perte), max +500 kcal/j (prise de masse)
      calorieAdjustment = Math.max(-1000, Math.min(500, Math.round(requiredDailyDelta)));
    }
  }

  const daily_calorie_target = Math.max(1200, Math.round(tdee + calorieAdjustment));

  // Répartition macros ajustée selon l'objectif
  const proteinRatio = goal === "gain" ? 0.35 : 0.30;
  const carbsRatio = goal === "lose" ? 0.35 : 0.40;
  const fatRatio = 1 - proteinRatio - carbsRatio;

  return {
    daily_calorie_target,
    daily_protein_g: Math.round((daily_calorie_target * proteinRatio) / 4),
    daily_carbs_g: Math.round((daily_calorie_target * carbsRatio) / 4),
    daily_fat_g: Math.round((daily_calorie_target * fatRatio) / 9),
  };
}
