import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/shared/TopBar";
import { Logo } from "@/components/shared/Logo";
import { Bell } from "lucide-react";
import CreatineTracker from "@/components/dashboard/CreatineTracker";
import { MealTypeSection } from "@/components/dashboard/MealTypeSection";
import { getMealTypeLabel, getMealTypeEmoji } from "@/lib/utils";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: meals }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, daily_calorie_target, daily_protein_g, daily_carbs_g, daily_fat_g")
      .eq("id", user?.id ?? "")
      .single(),
    supabase
      .from("meals")
      .select("id, name, photo_url, meal_type, calories, protein_g, carbs_g, fat_g, logged_at")
      .gte("logged_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .order("logged_at", { ascending: true }),
  ]);

  const mealList = meals ?? [];

  // Calcul des totaux du jour
  const consumed = mealList.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = Math.round(mealList.reduce((sum, m) => sum + Number(m.protein_g), 0));
  const totalCarbs = Math.round(mealList.reduce((sum, m) => sum + Number(m.carbs_g), 0));
  const totalFat = Math.round(mealList.reduce((sum, m) => sum + Number(m.fat_g), 0));

  // Objectifs quotidiens (défauts si onboarding non complété)
  const targetCal = profile?.daily_calorie_target ?? 2000;
  const targetProtein = profile?.daily_protein_g ?? 150;
  const targetCarbs = profile?.daily_carbs_g ?? 200;
  const targetFat = profile?.daily_fat_g ?? 70;

  const remaining = Math.max(targetCal - consumed, 0);
  const progress = Math.min((consumed / targetCal) * 100, 100);
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  // Répartition calorique par type (25/35/30/10)
  const MEAL_TYPE_PCTS: Record<string, number> = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snack: 0.10,
  };

  const mealTypeRows = MEAL_TYPES.map((type) => {
    const typeMeals = mealList.filter((m) => m.meal_type === type);
    return {
      type,
      label: getMealTypeLabel(type),
      emoji: getMealTypeEmoji(type),
      consumed: typeMeals.reduce((s, m) => s + m.calories, 0),
      target: Math.round(targetCal * MEAL_TYPE_PCTS[type]),
      meals: typeMeals.map((m) => ({
        id: m.id,
        name: m.name,
        photo_url: m.photo_url,
        calories: m.calories,
        protein_g: Number(m.protein_g),
        carbs_g: Number(m.carbs_g),
        fat_g: Number(m.fat_g),
      })),
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        left={<Logo size="sm" />}
        right={
          <button className="p-1">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        }
      />

      <div className="pt-14 px-6 pb-28 space-y-6">
        <div className="pt-4">
          <p className="label-caps capitalize">{today}</p>
          <h2 className="font-heading font-bold text-heading-md text-foreground mt-1">
            Bonjour {firstName ? `${firstName} !` : "!"} 👋
          </h2>
        </div>

        {/* Anneau calories */}
        <div className="bg-surface-container rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="label-caps">Consommé</p>
              <p className="metric text-metric-large text-foreground">{consumed}</p>
              <p className="text-muted-foreground text-sm">sur {targetCal} kcal</p>
            </div>

            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e2e1" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="#00c853" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="metric text-[22px] text-foreground">{remaining}</p>
                <p className="text-[10px] text-muted-foreground font-semibold">restant</p>
              </div>
            </div>
          </div>

          {/* Barres macros */}
          <div className="mt-6 space-y-3">
            {[
              { label: "Protéines", consumed: totalProtein, target: targetProtein, color: "#00c853" },
              { label: "Glucides", consumed: totalCarbs, target: targetCarbs, color: "#fe9400" },
              { label: "Lipides", consumed: totalFat, target: targetFat, color: "#6c7b6a" },
            ].map((macro) => {
              const pct = Math.min((macro.consumed / macro.target) * 100, 100);
              return (
                <div key={macro.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">{macro.label}</span>
                    <span className="text-foreground">
                      {macro.consumed}g / {macro.target}g
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: macro.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <CreatineTracker />
        </div>

        {/* Section Alimentation par type de repas */}
        <MealTypeSection rows={mealTypeRows} />
      </div>
    </div>
  );
}
