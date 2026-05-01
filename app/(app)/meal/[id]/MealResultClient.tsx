"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { TopBar } from "@/components/shared/TopBar";
import { getMealTypeLabel } from "@/lib/utils";
import { updateMeal } from "./actions";

type MealItem = {
  name: string;
  estimated_grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

type MealData = {
  id: string;
  name: string;
  photo_url: string | null;
  meal_type: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ai_confidence: number | null;
  items: MealItem[];
};

export function MealResultClient({ meal }: { meal: MealData }) {
  const router = useRouter();
  const [name, setName] = useState(meal.name);
  const [mealType, setMealType] = useState(meal.meal_type ?? "lunch");
  const [saving, setSaving] = useState(false);

  const confidence = meal.ai_confidence !== null
    ? Math.round(meal.ai_confidence * 100)
    : null;

  const handleSave = async () => {
    setSaving(true);
    await updateMeal(meal.id, { name, meal_type: mealType });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        title="Résultat de l'analyse"
        left={
          <Link href="/dashboard">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </Link>
        }
      />

      <div className="pt-14 px-6 pb-6 space-y-6">
        {/* Photo du repas */}
        <div className="mt-4 w-full h-48 rounded-3xl bg-surface-container overflow-hidden">
          {meal.photo_url ? (
            <Image
              src={meal.photo_url}
              alt={name}
              width={800}
              height={192}
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Nom + confiance */}
        <div className="space-y-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full font-heading font-bold text-heading-lg text-foreground bg-transparent focus:outline-none border-b-2 border-transparent focus:border-primary-container pb-1 transition-colors"
          />
          {confidence !== null && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-container" />
              <p className="text-muted-foreground text-sm">Confiance : {confidence}%</p>
            </div>
          )}
        </div>

        {/* Sélecteur de type */}
        <div className="space-y-2">
          <p className="label-caps">Type de repas</p>
          <div className="flex gap-2 flex-wrap">
            {["breakfast", "lunch", "dinner", "snack"].map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                  mealType === type
                    ? "bg-primary-container text-white border-primary-container"
                    : "border-border text-muted-foreground hover:border-primary-container hover:text-primary"
                }`}
              >
                {getMealTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Carte totaux */}
        <div className="bg-surface-container rounded-3xl p-5 space-y-4">
          <div className="text-center">
            <p className="label-caps mb-1">Total</p>
            <p className="metric text-metric-large text-foreground">{meal.calories} kcal</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Protéines", value: `${meal.protein_g}g`, color: "text-primary-container" },
              { label: "Glucides", value: `${meal.carbs_g}g`, color: "text-secondary-container" },
              { label: "Lipides", value: `${meal.fat_g}g`, color: "text-muted-foreground" },
            ].map((macro) => (
              <div key={macro.label}>
                <p className={`metric text-[22px] ${macro.color}`}>{macro.value}</p>
                <p className="label-caps mt-1">{macro.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Liste des aliments détectés */}
        {meal.items.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-heading-md">Aliments détectés</h3>
            <div className="space-y-2">
              {meal.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-surface-container rounded-2xl"
                >
                  <div>
                    <p className="font-semibold text-foreground text-sm capitalize">{item.name}</p>
                    <p className="text-muted-foreground text-xs">{item.estimated_grams}g</p>
                  </div>
                  <p className="font-heading font-bold text-foreground text-sm">
                    {item.calories} kcal
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton sauvegarder */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] flex items-center justify-center gap-2 transition-all active:scale-95 hover:opacity-90 disabled:opacity-60"
        >
          <Check className="w-5 h-5" />
          {saving ? "Enregistrement..." : "Enregistrer ce repas"}
        </button>
      </div>
    </div>
  );
}
