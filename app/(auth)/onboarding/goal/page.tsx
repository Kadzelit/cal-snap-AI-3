"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const GOALS = [
  {
    value: "lose",
    emoji: "🔥",
    title: "Perdre du poids",
    description: "Réduire l'apport calorique pour maigrir",
  },
  {
    value: "maintain",
    emoji: "⚖️",
    title: "Maintenir mon poids",
    description: "Équilibrer alimentation et dépenses",
  },
  {
    value: "gain",
    emoji: "💪",
    title: "Prendre de la masse",
    description: "Augmenter les calories pour progresser",
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
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            onClick={() => setSelected(goal.value)}
            className={cn(
              "w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98]",
              selected === goal.value
                ? "border-primary-container bg-primary-container/10"
                : "border-border bg-surface-container hover:border-outline"
            )}
          >
            <span className="text-3xl">{goal.emoji}</span>
            <div>
              <p className="font-heading font-bold text-foreground">{goal.title}</p>
              <p className="text-muted-foreground text-sm">{goal.description}</p>
            </div>
          </button>
        ))}
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
