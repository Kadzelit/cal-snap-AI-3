"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITIES = [
  { value: "sedentary", emoji: "🛋️", title: "Sédentaire", description: "Bureau, peu ou pas d'exercice" },
  { value: "light", emoji: "🚶", title: "Légèrement actif", description: "Exercice léger 1-3 jours/semaine" },
  { value: "active", emoji: "🏃", title: "Actif", description: "Exercice modéré 3-5 jours/semaine" },
  { value: "very_active", emoji: "🏋️", title: "Très actif", description: "Sport intense 6-7 jours/semaine" },
] as const;

export function ActivityClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);

  function handleContinue() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("activity", selected!);
    router.push(`/onboarding/plan?${params.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <button onClick={() => router.back()} className="self-start p-2 -ml-2 mb-8">
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </button>

      <div className="space-y-2 mb-10">
        <p className="label-caps">Étape 3 sur 4</p>
        <h1 className="font-heading font-extrabold text-heading-lg text-foreground">
          Ton niveau d'activité
        </h1>
        <p className="text-muted-foreground text-body-md">
          Estime ton activité physique hebdomadaire.
        </p>
      </div>

      <div className="space-y-3 flex-1">
        {ACTIVITIES.map((activity) => (
          <button
            key={activity.value}
            onClick={() => setSelected(activity.value)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]",
              selected === activity.value
                ? "border-primary-container bg-primary-container/10"
                : "border-border bg-surface-container hover:border-outline"
            )}
          >
            <span className="text-2xl">{activity.emoji}</span>
            <div>
              <p className="font-heading font-bold text-foreground">{activity.title}</p>
              <p className="text-muted-foreground text-sm">{activity.description}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={handleContinue}
        className="w-full h-14 mt-8 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] transition-all active:scale-95 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Voir mon plan
      </button>
    </div>
  );
}
