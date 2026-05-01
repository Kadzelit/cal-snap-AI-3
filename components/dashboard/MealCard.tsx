"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { deleteMeal } from "@/app/(app)/dashboard/actions";

type Meal = {
  id: string;
  name: string;
  photo_url: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export function MealCard({ meal }: { meal: Meal }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    await deleteMeal(meal.id);
    router.refresh();
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-surface-container rounded-2xl transition-opacity ${
        deleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {/* Miniature photo */}
      <div className="w-14 h-14 rounded-xl bg-background overflow-hidden flex-shrink-0">
        {meal.photo_url ? (
          <Image
            src={meal.photo_url}
            alt={meal.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-2xl">🍽️</div>
        )}
      </div>

      {/* Infos — cliquable vers le détail */}
      <Link href={`/meal/${meal.id}`} className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">{meal.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {Math.round(meal.protein_g)}g prot. · {Math.round(meal.carbs_g)}g glu. · {Math.round(meal.fat_g)}g lip.
        </p>
      </Link>

      {/* Calories + bouton supprimer */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="font-heading font-bold text-foreground text-sm">{meal.calories} kcal</p>
        <button
          onClick={handleDelete}
          className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center transition-all active:scale-95"
          aria-label="Supprimer ce repas"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
