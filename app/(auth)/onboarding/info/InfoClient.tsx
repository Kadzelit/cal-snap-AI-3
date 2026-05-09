"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const GENDERS = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
  { value: "other", label: "Autre" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

type StepperProps = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  onChange: (v: number) => void;
};

function ValueStepper({ label, value, unit, min, max, step = 1, decimals = 0, onChange }: StepperProps) {
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function clamp(v: number) {
    const rounded = Math.round(v / step) * step;
    return Math.min(max, Math.max(min, parseFloat(rounded.toFixed(decimals))));
  }

  function startHold(delta: number) {
    const next = clamp(valueRef.current + delta);
    valueRef.current = next;
    onChange(next);

    holdRef.current = setInterval(() => {
      const next = clamp(valueRef.current + delta);
      valueRef.current = next;
      onChange(next);
    }, 80);
  }

  function stopHold() {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }

  const progress = ((value - min) / (max - min)) * 100;
  const display = decimals > 0 ? value.toFixed(decimals) : value.toString();

  return (
    <div className="bg-surface-container rounded-3xl p-5 space-y-4">
      <p className="label-caps text-center">{label}</p>

      <div className="flex items-center justify-between gap-3">
        {/* Bouton − */}
        <button
          onPointerDown={() => startHold(-step)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className="w-14 h-14 rounded-2xl bg-background border-2 border-border flex items-center justify-center active:scale-90 transition-all touch-none select-none shrink-0"
        >
          <Minus className="w-5 h-5 text-foreground" />
        </button>

        {/* Valeur centrale */}
        <div className="flex-1 text-center py-1 select-none">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-heading font-extrabold text-[58px] leading-none tabular-nums text-foreground">
              {display}
            </span>
            <span className="text-xl text-muted-foreground font-semibold">{unit}</span>
          </div>
        </div>

        {/* Bouton + */}
        <button
          onPointerDown={() => startHold(step)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center active:scale-90 transition-all shadow-sm touch-none select-none shrink-0"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Barre de progression */}
      <div className="space-y-1.5">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-container rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{min} {unit}</span>
          <span>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
}

export function InfoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goal = searchParams.get("goal") ?? "maintain";

  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);

  const canContinue = gender !== null;

  function handleContinue() {
    // Convertir l'âge en date de naissance (milieu d'année pour la précision)
    const birthdate = `${CURRENT_YEAR - age}-06-15`;
    const params = new URLSearchParams({
      goal,
      gender: gender!,
      birthdate,
      height: height.toString(),
      weight: weight.toString(),
    });
    router.push(`/onboarding/activity?${params.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <button onClick={() => router.back()} className="self-start p-2 -ml-2 mb-6">
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </button>

      <div className="space-y-2 mb-8">
        <p className="label-caps">Étape 2 sur 4</p>
        <h1 className="font-heading font-extrabold text-heading-lg text-foreground">
          Tes informations
        </h1>
        <p className="text-muted-foreground text-body-md">
          Pour calculer tes besoins caloriques précis.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {/* Genre */}
        <div className="space-y-3">
          <p className="label-caps">Genre</p>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={cn(
                  "flex-1 py-4 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95",
                  gender === g.value
                    ? "border-primary-container bg-primary-container/15 text-primary-container"
                    : "border-border bg-surface-container text-muted-foreground"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Âge */}
        <ValueStepper
          label="Âge"
          value={age}
          unit="ans"
          min={13}
          max={90}
          step={1}
          onChange={setAge}
        />

        {/* Taille */}
        <ValueStepper
          label="Taille"
          value={height}
          unit="cm"
          min={100}
          max={250}
          step={1}
          onChange={setHeight}
        />

        {/* Poids */}
        <ValueStepper
          label="Poids"
          value={weight}
          unit="kg"
          min={30}
          max={300}
          step={1}
          onChange={setWeight}
        />
      </div>

      <button
        disabled={!canContinue}
        onClick={handleContinue}
        className="w-full h-14 mt-8 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] transition-all active:scale-95 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuer
      </button>
    </div>
  );
}
