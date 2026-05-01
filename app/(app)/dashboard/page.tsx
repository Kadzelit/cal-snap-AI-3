import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/shared/TopBar";
import { Logo } from "@/components/shared/Logo";
import { Bell } from "lucide-react";
import { MealCard } from "@/components/dashboard/MealCard";
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

  // Groupement par type de repas
  const grouped = MEAL_TYPES.reduce((acc, type) => {
    const filtered = mealList.filter((m) => m.meal_type === type);
    if (filtered.length > 0) acc[type] = filtered;
    return acc;
  }, {} as Partial<Record<typeof MEAL_TYPES[number], typeof mealList>>);

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
        </div>

        {/* Journal du jour */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-heading-md text-foreground">
            Journal d'aujourd'hui
          </h3>

          {mealList.length === 0 ? (
            <div className="bg-surface-container rounded-2xl p-6 text-center space-y-2">
              <p className="text-3xl">🍽️</p>
              <p className="font-heading font-semibold text-foreground">Aucun repas enregistré</p>
              <p className="text-muted-foreground text-sm">
                Appuie sur le bouton caméra pour scanner ton premier repas
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {MEAL_TYPES.map((type) => {
                const typeMeals = grouped[type];
                if (!typeMeals) return null;
                return (
                  <div key={type} className="space-y-2">
                    <p className="label-caps flex items-center gap-1.5">
                      <span>{getMealTypeEmoji(type)}</span>
                      <span>{getMealTypeLabel(type)}</span>
                    </p>
                    {typeMeals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={{
                          id: meal.id,
                          name: meal.name,
                          photo_url: meal.photo_url,
                          calories: meal.calories,
                          protein_g: Number(meal.protein_g),
                          carbs_g: Number(meal.carbs_g),
                          fat_g: Number(meal.fat_g),
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
