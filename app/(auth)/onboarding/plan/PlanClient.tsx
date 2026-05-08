"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { calculateTdee } from "@/lib/tdee";
import type { Gender, ActivityLevel, Goal } from "@/lib/tdee";
import { saveOnboardingProfile } from "./actions";

export function PlanClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);

  const goal = (searchParams.get("goal") ?? "maintain") as Goal;
  const gender = (searchParams.get("gender") ?? "male") as Gender;
  const birthdate = searchParams.get("birthdate") ?? "";
  const height_cm = parseInt(searchParams.get("height") ?? "175", 10);
  const weight_kg = parseFloat(searchParams.get("weight") ?? "70");
  const activity_level = (searchParams.get("activity") ?? "light") as ActivityLevel;

  const plan = useMemo(() => {
    if (!birthdate) {
      return { daily_calorie_target: 2000, daily_protein_g: 150, daily_carbs_g: 200, daily_fat_g: 67 };
    }
    const age = Math.floor(
      (Date.now() - new Date(birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return calculateTdee({ gender, age, height_cm, weight_kg, activity_level, goal });
  }, [gender, birthdate, height_cm, weight_kg, activity_level, goal]);

  const goalLabels: Record<Goal, string> = {
    lose: "Perte de poids (-500 kcal/j)",
    maintain: "Maintien du poids",
    gain: "Prise de masse (+300 kcal/j)",
  };

  async function handleStart() {
    setSaving(true);
    try {
      await saveOnboardingProfile({ gender, birth_date: birthdate, height_cm, weight_kg, activity_level, goal });
      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary-container" />
          </div>
          <h1 className="font-heading font-extrabold text-heading-lg text-foreground">
            Ton plan personnalisé !
          </h1>
          <p className="text-muted-foreground text-body-md">
            Basé sur tes informations, voici tes objectifs quotidiens.
          </p>
        </div>

        <div className="bg-surface-container rounded-3xl p-6 space-y-6">
          <div className="text-center">
            <p className="label-caps mb-1">Calories quotidiennes</p>
            <p className="metric text-metric-large text-primary-container">
              {plan.daily_calorie_target}
            </p>
            <p className="text-muted-foreground text-sm">kcal / jour</p>
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="metric text-[28px] text-foreground">{plan.daily_protein_g}g</p>
              <p className="label-caps mt-1">Protéines</p>
            </div>
            <div>
              <p className="metric text-[28px] text-secondary-container">{plan.daily_carbs_g}g</p>
              <p className="label-caps mt-1">Glucides</p>
            </div>
            <div>
              <p className="metric text-[28px] text-foreground">{plan.daily_fat_g}g</p>
              <p className="label-caps mt-1">Lipides</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-surface-low rounded-2xl p-4">
          <p className="font-semibold text-foreground text-sm">Ce plan est basé sur :</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Formule Mifflin-St Jeor (métabolisme basal)</li>
            <li>• Ton niveau d'activité physique</li>
            <li>• Objectif : {goalLabels[goal]}</li>
          </ul>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={saving}
        className="block w-full h-14 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] text-center leading-[56px] transition-all active:scale-95 hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Enregistrement..." : "Commencer le suivi"}
      </button>
    </div>
  );
}
