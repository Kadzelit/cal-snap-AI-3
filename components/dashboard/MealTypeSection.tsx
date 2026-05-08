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

export function MealTypeSection({ rows }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-heading-md text-foreground">Alimentation</h3>
          <button
            onClick={() => setSheetOpen(true)}
            className="text-primary font-semibold text-sm"
          >
            Ajouter
          </button>
        </div>

        <div className="bg-surface-container rounded-3xl overflow-hidden">
          {rows.map((row, idx) => {
            const pct = Math.min((row.consumed / row.target) * 100, 100);
            const isLast = idx === rows.length - 1;

            return (
              <div key={row.type}>
                {/* Ligne du type de repas */}
                <div className="flex items-center gap-4 px-4 py-4">
                  {/* Icône emoji */}
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-2xl flex-shrink-0 border-2 border-border">
                    {row.emoji}
                  </div>

                  {/* Label + calories */}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-foreground text-sm">{row.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-background overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {row.consumed} / {row.target} kcal
                      </span>
                    </div>
                  </div>

                  {/* Bouton + */}
                  <button
                    onClick={() => setSheetOpen(true)}
                    aria-label={`Ajouter un repas — ${row.label}`}
                    className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                  >
                    <Plus className="w-5 h-5 text-foreground" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Repas du type si il y en a */}
                {row.meals.length > 0 && (
                  <div className="px-4 pb-3 space-y-2">
                    {row.meals.map((meal) => (
                      <MealCard key={meal.id} meal={meal} />
                    ))}
                  </div>
                )}

                {/* Séparateur */}
                {!isLast && <div className="h-px bg-background mx-4" />}
              </div>
            );
          })}
        </div>
      </div>

      <AddMealSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
