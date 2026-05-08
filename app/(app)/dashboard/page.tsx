import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/shared/TopBar";
import { Logo } from "@/components/shared/Logo";
import { Bell } from "lucide-react";
import CreatineTracker from "@/components/dashboard/CreatineTracker";
import { MealTypeSection } from "@/components/dashboard/MealTypeSection";
import { getMealTypeLabel, getMealTypeEmoji } from "@/lib/utils";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

const MEAL_TYPE_PCTS: Record<string, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.30,
  snack: 0.10,
};

function getMotivationalMessage(consumed: number, target: number): string {
  if (consumed === 0) return "Commence ta journée alimentaire 🌱";
  const pct = consumed / target;
  const rem = Math.max(target - consumed, 0);
  if (pct < 0.3) return "Bon début, continue !";
  if (pct < 0.6) return "Tu es sur la bonne voie 💪";
  if (pct < 0.9) return `Plus que ${rem} kcal à consommer`;
  if (pct >= 1) return "Objectif calorique atteint ! 🎉";
  return "Presque au but, encore un effort !";
}

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

  const consumed = mealList.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = Math.round(mealList.reduce((sum, m) => sum + Number(m.protein_g), 0));
  const totalCarbs = Math.round(mealList.reduce((sum, m) => sum + Number(m.carbs_g), 0));
  const totalFat = Math.round(mealList.reduce((sum, m) => sum + Number(m.fat_g), 0));

  const targetCal = profile?.daily_calorie_target ?? 2000;
  const targetProtein = profile?.daily_protein_g ?? 150;
  const targetCarbs = profile?.daily_carbs_g ?? 200;
  const targetFat = profile?.daily_fat_g ?? 70;

  const remaining = Math.max(targetCal - consumed, 0);
  const progress = Math.min((consumed / targetCal) * 100, 100);

  const r = 68;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const motivationalMsg = getMotivationalMessage(consumed, targetCal);
  const goalReached = consumed >= targetCal;

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

  const macros = [
    { label: "Protéines", consumed: totalProtein, target: targetProtein, color: "#00c853", trackColor: "#dcfce7" },
    { label: "Glucides", consumed: totalCarbs, target: targetCarbs, color: "#fe9400", trackColor: "#fef3c7" },
    { label: "Lipides", consumed: totalFat, target: targetFat, color: "#a78bfa", trackColor: "#ede9fe" },
  ];

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

      {/* Hero gradient */}
      <div className="bg-gradient-to-b from-[#005a22] to-[#00a844] pt-14">
        <div className="px-6 pt-5 pb-14">
          {/* Greeting */}
          <div className="mb-5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest capitalize">
              {today}
            </p>
            <h2 className="font-heading font-bold text-2xl text-white mt-1">
              {firstName ? `Bonjour ${firstName} !` : "Bonjour !"} 👋
            </h2>
            <p className="text-white/75 text-sm mt-0.5">{motivationalMsg}</p>
          </div>

          {/* Calorie ring centré */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80" cy="80" r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="10"
                />
                <circle
                  cx="80" cy="80" r={r}
                  fill="none"
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {goalReached ? (
                  <>
                    <p className="text-4xl">🎯</p>
                    <p className="text-white font-bold text-sm mt-1">Objectif !</p>
                  </>
                ) : (
                  <>
                    <p className="font-heading font-extrabold text-5xl text-white tabular-nums leading-none">
                      {remaining}
                    </p>
                    <p className="text-white/70 text-xs font-semibold mt-1">kcal restantes</p>
                  </>
                )}
              </div>
            </div>

            <p className="text-white/60 text-xs mt-3">
              Consommé :{" "}
              <span className="text-white font-bold">{consumed}</span> / {targetCal} kcal
            </p>
          </div>
        </div>
      </div>

      {/* Macros card flottante */}
      <div className="px-4 -mt-5 relative z-10">
        <div
          className="bg-white rounded-3xl p-5"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
        >
          <div className="grid grid-cols-3 gap-3">
            {macros.map((macro) => {
              const pct = Math.min((macro.consumed / macro.target) * 100, 100);
              return (
                <div key={macro.label} className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {macro.label}
                  </p>
                  <div className="flex items-baseline gap-0.5">
                    <p className="font-heading font-bold text-foreground text-xl tabular-nums leading-none">
                      {macro.consumed}
                    </p>
                    <span className="text-xs text-muted-foreground">g</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: macro.trackColor }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: macro.color }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">/ {macro.target}g</p>
                </div>
              );
            })}
          </div>

          <CreatineTracker />
        </div>
      </div>

      {/* Repas du jour */}
      <div className="px-4 pb-28 mt-5 space-y-3">
        <MealTypeSection rows={mealTypeRows} />
      </div>
    </div>
  );
}
