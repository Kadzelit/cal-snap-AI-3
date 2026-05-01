"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const GENDERS = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
  { value: "other", label: "Autre" },
] as const;

export default function InfoPage() {
  const router = useRouter();
  const [gender, setGender] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <button onClick={() => router.back()} className="self-start p-2 -ml-2 mb-8">
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </button>

      <div className="space-y-2 mb-10">
        <p className="label-caps">Étape 2 sur 4</p>
        <h1 className="font-heading font-extrabold text-heading-lg text-foreground">
          Tes informations
        </h1>
        <p className="text-muted-foreground text-body-md">
          Pour calculer tes besoins caloriques précis.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-3">
          <label className="label-caps">Genre</label>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={cn(
                  "flex-1 py-3 rounded-full border-2 font-semibold text-sm transition-all",
                  gender === g.value
                    ? "border-primary-container bg-primary-container/10 text-primary"
                    : "border-border text-muted-foreground hover:border-outline"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="label-caps" htmlFor="birthdate">Date de naissance</label>
          <input
            id="birthdate"
            type="date"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="label-caps" htmlFor="height">Taille (cm)</label>
            <input
              id="height"
              type="number"
              placeholder="175"
              min={100}
              max={250}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="label-caps" htmlFor="weight">Poids (kg)</label>
            <input
              id="weight"
              type="number"
              placeholder="70"
              min={30}
              max={300}
              step={0.1}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/onboarding/activity")}
        className="w-full h-14 mt-8 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] transition-all active:scale-95 hover:opacity-90"
      >
        Continuer
      </button>
    </div>
  );
}
