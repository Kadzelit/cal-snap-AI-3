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
  goals_description?: string | null;
};

export type MacroTargets = {
  daily_calorie_target: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
};

function getMacroRatios(goal: Goal, goalsDescription?: string | null) {
  const desc = (goalsDescription ?? "").toLowerCase();

  if (desc.includes("keto") || desc.includes("cétogène") || desc.includes("cetogene")) {
    return { protein: 0.30, carbs: 0.05, fat: 0.65 };
  }
  if (
    desc.includes("muscle") || desc.includes("musculation") ||
    desc.includes("prise de masse") || desc.includes("force") ||
    desc.includes("hypertrophie")
  ) {
    return { protein: 0.40, carbs: 0.35, fat: 0.25 };
  }
  if (
    desc.includes("cardio") || desc.includes("endurance") ||
    desc.includes("marathon") || desc.includes("course") ||
    desc.includes("trail")
  ) {
    return { protein: 0.25, carbs: 0.50, fat: 0.25 };
  }

  // Répartition par défaut selon l'objectif
  const protein = goal === "gain" ? 0.35 : 0.30;
  const carbs = goal === "lose" ? 0.35 : 0.40;
  return { protein, carbs, fat: 1 - protein - carbs };
}

export function calculateTdee(params: TdeeParams): MacroTargets {
  const { gender, age, height_cm, weight_kg, activity_level, goal, target_weight_kg, target_date, goals_description } = params;

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

  const { protein, carbs, fat } = getMacroRatios(goal, goals_description);

  return {
    daily_calorie_target,
    daily_protein_g: Math.round((daily_calorie_target * protein) / 4),
    daily_carbs_g: Math.round((daily_calorie_target * carbs) / 4),
    daily_fat_g: Math.round((daily_calorie_target * fat) / 9),
  };
}
