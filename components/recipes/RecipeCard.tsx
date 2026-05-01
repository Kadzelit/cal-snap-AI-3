"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Utensils, Check } from "lucide-react";
import { logRecipe } from "@/app/(app)/dashboard-recipes/actions";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_OPTIONS: { type: MealType; label: string; emoji: string }[] = [
  { type: "breakfast", label: "Petit-déj", emoji: "🌅" },
  { type: "lunch", label: "Déjeuner", emoji: "☀️" },
  { type: "dinner", label: "Dîner", emoji: "🌙" },
  { type: "snack", label: "Snack", emoji: "🍎" },
];

type Recipe = {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  total_calories: number | null;
  total_protein_g: number | null;
  total_carbs_g: number | null;
  total_fat_g: number | null;
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  const handleConsume = async (mealType: MealType) => {
    setLogging(true);
    await logRecipe(recipe.id, mealType);
    setLogged(true);
    setLogging(false);
    setPicking(false);
    // reset feedback after 2s
    setTimeout(() => setLogged(false), 2000);
    router.refresh();
  };

  return (
    <div className="bg-surface-container rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div>
        <p className="font-heading font-bold text-foreground">{recipe.name}</p>
        {recipe.description && (
          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{recipe.description}</p>
        )}
      </div>

      {/* Macros */}
      <div className="flex gap-3 text-center">
        <div className="flex-1">
          <p className="metric text-[15px] text-foreground">{recipe.total_calories ?? 0}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">kcal</p>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1">
          <p className="metric text-[15px] text-primary-container">{recipe.total_protein_g ?? 0}g</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">prot.</p>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1">
          <p className="metric text-[15px] text-secondary-container">{recipe.total_carbs_g ?? 0}g</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">glu.</p>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1">
          <p className="metric text-[15px] text-muted-foreground">{recipe.total_fat_g ?? 0}g</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">lip.</p>
        </div>
      </div>

      {/* Meal type picker (shown when consuming) */}
      {picking && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Pour quel repas ?</p>
          <div className="grid grid-cols-4 gap-2">
            {MEAL_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleConsume(opt.type)}
                disabled={logging}
                className="flex flex-col items-center gap-1 py-2 rounded-xl border border-border hover:border-primary-container hover:bg-primary-container/10 transition-all disabled:opacity-50"
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-[10px] font-semibold text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setPicking(false)}
            className="w-full text-xs text-muted-foreground py-1"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Buttons */}
      {!picking && (
        <div className="flex gap-2">
          <Link
            href={`/recipes/${recipe.id}`}
            className="flex-1 h-9 rounded-full border border-border flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground hover:border-foreground transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            Modifier
          </Link>

          <button
            onClick={() => (logged ? null : setPicking(true))}
            disabled={logged}
            className={`flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-sm font-semibold transition-all active:scale-95 ${
              logged
                ? "bg-primary-container/20 text-primary-container"
                : "bg-primary-container text-white hover:opacity-90"
            }`}
          >
            {logged ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Ajouté !
              </>
            ) : (
              <>
                <Utensils className="w-3.5 h-3.5" />
                Consommer
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
