"use client";

import { useState, useMemo } from "react";
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

type EditableItem = MealItem & {
  _orig: MealItem;
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

  const [items, setItems] = useState<EditableItem[]>(
    meal.items.map((item) => ({ ...item, _orig: { ...item } }))
  );

  const totals = useMemo(() => ({
    calories: items.reduce((s, i) => s + i.calories, 0),
    protein_g: Math.round(items.reduce((s, i) => s + i.protein_g, 0) * 10) / 10,
    carbs_g: Math.round(items.reduce((s, i) => s + i.carbs_g, 0) * 10) / 10,
    fat_g: Math.round(items.reduce((s, i) => s + i.fat_g, 0) * 10) / 10,
  }), [items]);

  // Si aucun item détecté, on utilise les valeurs originales du repas
  const displayCalories = items.length > 0 ? totals.calories : meal.calories;
  const displayProtein = items.length > 0 ? totals.protein_g : meal.protein_g;
  const displayCarbs = items.length > 0 ? totals.carbs_g : meal.carbs_g;
  const displayFat = items.length > 0 ? totals.fat_g : meal.fat_g;

  function updateGrams(idx: number, rawVal: string) {
    const newGrams = parseFloat(rawVal);
    if (isNaN(newGrams) || newGrams <= 0) return;

    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const ratio = newGrams / item._orig.estimated_grams;
        return {
          ...item,
          estimated_grams: newGrams,
          calories: Math.round(item._orig.calories * ratio),
          protein_g: Math.round(item._orig.protein_g * ratio * 10) / 10,
          carbs_g: Math.round(item._orig.carbs_g * ratio * 10) / 10,
          fat_g: Math.round(item._orig.fat_g * ratio * 10) / 10,
        };
      })
    );
  }

  const confidence = meal.ai_confidence !== null
    ? Math.round(meal.ai_confidence * 100)
    : null;

  const handleSave = async () => {
    setSaving(true);
    await updateMeal(meal.id, {
      name,
      meal_type: mealType,
      calories: displayCalories,
      protein_g: displayProtein,
      carbs_g: displayCarbs,
      fat_g: displayFat,
    });
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
                    : "border-border text-muted-foreground"
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
            <p className="metric text-metric-large text-foreground">{displayCalories} kcal</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Protéines", value: `${displayProtein}g`, color: "text-primary-container" },
              { label: "Glucides", value: `${displayCarbs}g`, color: "text-secondary-container" },
              { label: "Lipides", value: `${displayFat}g`, color: "text-muted-foreground" },
            ].map((macro) => (
              <div key={macro.label}>
                <p className={`metric text-[22px] ${macro.color}`}>{macro.value}</p>
                <p className="label-caps mt-1">{macro.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Liste des aliments détectés — grammes éditables */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-heading-md">Aliments détectés</h3>
              <p className="text-xs text-muted-foreground">Modifie les grammes si besoin</p>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-surface-container rounded-2xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm capitalize">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.calories} kcal · {item.protein_g}g prot.
                    </p>
                  </div>

                  {/* Input grammes */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="2000"
                      step="5"
                      defaultValue={item._orig.estimated_grams}
                      onChange={(e) => updateGrams(i, e.target.value)}
                      className="w-16 text-center px-2 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-xs text-muted-foreground">g</span>
                  </div>
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
