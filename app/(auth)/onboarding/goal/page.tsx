"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  {
    value: "lose",
    emoji: "🔥",
    title: "Perdre du poids",
    description: "Réduire l'apport calorique pour maigrir",
    kcal: "−500 kcal/j",
  },
  {
    value: "maintain",
    emoji: "⚖️",
    title: "Maintenir mon poids",
    description: "Équilibrer alimentation et dépenses",
    kcal: "Maintien",
  },
  {
    value: "gain",
    emoji: "💪",
    title: "Prendre de la masse",
    description: "Augmenter les calories pour progresser",
    kcal: "+300 kcal/j",
  },
] as const;

export default function GoalPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <button onClick={() => router.back()} className="self-start p-2 -ml-2 mb-8">
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </button>

      <div className="space-y-2 mb-10">
        <p className="label-caps">Étape 1 sur 4</p>
        <h1 className="font-heading font-extrabold text-heading-lg text-foreground">
          Quel est ton objectif ?
        </h1>
        <p className="text-muted-foreground text-body-md">
          On va personnaliser tes recommandations.
        </p>
      </div>

      <div className="space-y-3 flex-1">
        {GOALS.map((goal) => {
          const isSelected = selected === goal.value;
          return (
            <button
              key={goal.value}
              onClick={() => setSelected(goal.value)}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.97]",
                isSelected
                  ? "border-primary-container bg-primary-container/10 shadow-sm"
                  : "border-border bg-surface-container"
              )}
            >
              <span className="text-3xl shrink-0">{goal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-heading font-bold transition-colors",
                  isSelected ? "text-primary-container" : "text-foreground"
                )}>
                  {goal.title}
                </p>
                <p className="text-muted-foreground text-sm mt-0.5">{goal.description}</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "border-primary-container bg-primary-container scale-110"
                    : "border-border"
                )}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <span className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors",
                  isSelected
                    ? "bg-primary-container/20 text-primary-container"
                    : "bg-muted text-muted-foreground"
                )}>
                  {goal.kcal}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        disabled={!selected}
        onClick={() => router.push(`/onboarding/info?goal=${selected}`)}
        className="w-full h-14 mt-8 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] transition-all active:scale-95 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuer
      </button>
    </div>
  );
}
