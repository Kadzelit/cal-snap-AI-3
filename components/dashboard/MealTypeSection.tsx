"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MealCard } from "./MealCard";
import { AddMealSheet } from "@/components/shared/AddMealSheet";

type Meal = {
  id: string;
  name: string;
  photo_url: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

type MealTypeRow = {
  type: string;
  label: string;
  emoji: string;
  consumed: number;
  target: number;
  meals: Meal[];
};

interface Props {
  rows: MealTypeRow[];
}

const MEAL_COLORS: Record<string, { accent: string; bg: string }> = {
  breakfast: { accent: "#fe9400", bg: "rgba(254,148,0,0.1)" },
  lunch: { accent: "#00c853", bg: "rgba(0,200,83,0.1)" },
  dinner: { accent: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  snack: { accent: "#ec4899", bg: "rgba(236,72,153,0.1)" },
};

export function MealTypeSection({ rows }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-bold text-heading-md text-foreground">
            Alimentation
          </h3>
          <button
            onClick={() => setSheetOpen(true)}
            className="text-primary font-semibold text-sm"
          >
            + Ajouter
          </button>
        </div>

        {rows.map((row) => {
          const style = MEAL_COLORS[row.type] ?? { accent: "#6c7b6a", bg: "rgba(108,123,106,0.1)" };
          const pct = Math.min((row.consumed / row.target) * 100, 100);

          return (
            <div
              key={row.type}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="flex">
                {/* Accent strip gauche */}
                <div
                  className="w-1 flex-shrink-0"
                  style={{ backgroundColor: style.accent }}
                />

                <div className="flex-1 px-4 py-4">
                  <div className="flex items-center gap-3">
                    {/* Emoji dans cercle coloré */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: style.bg }}
                    >
                      {row.emoji}
                    </div>

                    {/* Label + barre de progression */}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold text-foreground text-sm">
                        {row.label}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: style.accent }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap font-semibold">
                          {row.consumed} / {row.target} kcal
                        </span>
                      </div>
                    </div>

                    {/* Bouton + */}
                    <button
                      onClick={() => setSheetOpen(true)}
                      aria-label={`Ajouter — ${row.label}`}
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                      style={{ backgroundColor: style.bg }}
                    >
                      <Plus className="w-4 h-4" style={{ color: style.accent }} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Repas listés */}
                  {row.meals.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {row.meals.map((meal) => (
                        <MealCard key={meal.id} meal={meal} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddMealSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
