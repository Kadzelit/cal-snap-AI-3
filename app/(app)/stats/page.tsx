import { createClient } from '@/lib/supabase/server';
import { TopBar } from '@/components/shared/TopBar';
import { AddWeightForm } from '@/components/stats/AddWeightForm';

// --- Pure helpers ---

const FR_DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'] as const;

interface DayStats {
  day: string;
  date: string;
  isToday: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

type MealRow = { calories: number; protein_g: number; carbs_g: number; fat_g: number; logged_at: string };
type WeightRow = { weight_kg: number; logged_at: string };

function getWeeklyStats(meals: MealRow[]): DayStats[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayMeals = meals.filter(m => m.logged_at.startsWith(dateStr));
    return {
      day: FR_DAYS[d.getDay()],
      date: dateStr,
      isToday: i === 6,
      calories: dayMeals.reduce((s, m) => s + m.calories, 0),
      protein: Math.round(dayMeals.reduce((s, m) => s + Number(m.protein_g), 0)),
      carbs: Math.round(dayMeals.reduce((s, m) => s + Number(m.carbs_g), 0)),
      fat: Math.round(dayMeals.reduce((s, m) => s + Number(m.fat_g), 0)),
    };
  });
}

function calculateStreak(meals: MealRow[]): number {
  if (!meals.length) return 0;
  const dateSet = new Set(meals.map(m => m.logged_at.split('T')[0]));
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = new Date(today.getTime() - 86_400_000).toISOString().split('T')[0];

  // Streak is broken if nothing logged today or yesterday
  if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) return 0;

  let cursor = dateSet.has(todayStr) ? today : new Date(today.getTime() - 86_400_000);
  let streak = 0;
  while (dateSet.has(cursor.toISOString().split('T')[0])) {
    streak++;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

// --- Sub-components (server-renderable) ---

function CalorieBarChart({ days, target }: { days: DayStats[]; target: number }) {
  const maxCal = Math.max(...days.map(d => d.calories), target);
  const chartH = 80;

  return (
    <div className="flex justify-between items-end gap-1.5" style={{ height: chartH + 24 }}>
      {days.map((day, i) => {
        const barH = day.calories > 0
          ? Math.max(Math.round((day.calories / maxCal) * chartH), 4)
          : 4;
        const overTarget = day.calories > target * 1.1;
        const barColor = day.calories === 0 ? '#e5e2e1' : overTarget ? '#fe9400' : '#00c853';
        const opacity = day.isToday ? 1 : day.calories > 0 ? 0.65 : 0.35;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md"
              style={{ height: barH, backgroundColor: barColor, opacity }}
            />
            <span
              className="text-[10px] font-semibold"
              style={{ color: day.isToday ? '#1c1b1b' : '#6c7b6a' }}
            >
              {day.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WeightMiniChart({ logs }: { logs: WeightRow[] }) {
  if (logs.length < 2) return null;

  const recent = logs.slice(-14);
  const weights = recent.map(l => l.weight_kg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const W = 300;
  const H = 64;
  const padX = 8;
  const padY = 8;

  const pts = recent.map((l, i) => {
    const x = padX + (i / (recent.length - 1)) * (W - padX * 2);
    const y = H - padY - ((l.weight_kg - minW) / range) * (H - padY * 2);
    return { x, y };
  });

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const first = recent[0];
  const last = recent[recent.length - 1];
  const diff = +(last.weight_kg - first.weight_kg).toFixed(1);
  const diffStr = diff > 0 ? `+${diff}` : String(diff);
  const diffColor = diff <= 0 ? '#00c853' : '#fe9400';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">{first.weight_kg} kg</span>
        <span style={{ color: diffColor }}>{diffStr} kg</span>
        <span className="text-muted-foreground">{last.weight_kg} kg</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <polyline
          points={polyline}
          fill="none"
          stroke="#00c853"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 4 : 2.5}
            fill="#00c853"
          />
        ))}
      </svg>
    </div>
  );
}

// --- Page ---

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [{ data: meals }, { data: weightLogs }, { data: profile }] = await Promise.all([
    supabase
      .from('meals')
      .select('calories, protein_g, carbs_g, fat_g, logged_at')
      .eq('user_id', user?.id ?? '')
      .gte('logged_at', thirtyDaysAgo.toISOString())
      .order('logged_at', { ascending: true }),
    supabase
      .from('weight_logs')
      .select('weight_kg, logged_at')
      .eq('user_id', user?.id ?? '')
      .order('logged_at', { ascending: true }),
    supabase
      .from('profiles')
      .select('daily_calorie_target, weight_kg')
      .eq('id', user?.id ?? '')
      .single(),
  ]);

  const mealList = (meals ?? []) as MealRow[];
  const weightList = (weightLogs ?? []) as WeightRow[];

  const targetCal = profile?.daily_calorie_target ?? 2000;
  const latestWeight: number | null =
    weightList.length > 0
      ? weightList[weightList.length - 1].weight_kg
      : (profile?.weight_kg ?? null);

  const streak = calculateStreak(mealList);
  const weeklyStats = getWeeklyStats(mealList);
  const daysWithData = weeklyStats.filter(d => d.calories > 0);
  const trackedDays = daysWithData.length;

  const avgCalories = trackedDays > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / trackedDays)
    : 0;
  const avgProtein = trackedDays > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.protein, 0) / trackedDays)
    : 0;
  const avgCarbs = trackedDays > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.carbs, 0) / trackedDays)
    : 0;
  const avgFat = trackedDays > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.fat, 0) / trackedDays)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Statistiques" />

      <div className="pt-14 px-6 pb-28 space-y-4">
        <div className="pt-4 space-y-4">

          {/* Streak */}
          <div className="bg-surface-container rounded-3xl p-5 flex items-center justify-between">
            <div>
              <p className="label-caps">Streak actuel</p>
              <p className="metric text-heading-lg text-foreground mt-1">
                {streak} {streak === 1 ? 'jour' : 'jours'}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                {streak === 0 ? 'Commence à tracker !' : 'Continue comme ça !'}
              </p>
            </div>
            <span className="text-4xl">{streak > 0 ? '🔥' : '💤'}</span>
          </div>

          {/* Graphique hebdomadaire */}
          <div className="bg-surface-container rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <p className="font-heading font-bold text-heading-md">Cette semaine</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary-container" />
                <span className="text-xs text-muted-foreground">objectif {targetCal} kcal</span>
              </div>
            </div>
            <CalorieBarChart days={weeklyStats} target={targetCal} />
            <p className="text-xs text-muted-foreground text-center">
              {trackedDays === 0
                ? 'Aucun repas cette semaine'
                : `${trackedDays} jour${trackedDays > 1 ? 's' : ''} tracké${trackedDays > 1 ? 's' : ''} sur 7`}
            </p>
          </div>

          {/* Moyennes 7 jours */}
          <div className="bg-surface-container rounded-3xl p-5 space-y-4">
            <p className="font-heading font-bold text-heading-md">Moyennes 7 jours</p>
            {trackedDays === 0 ? (
              <p className="text-muted-foreground text-sm">
                Commence à tracker pour voir tes statistiques ici.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-surface-highest">
                  <span className="text-sm text-muted-foreground">Calories moy.</span>
                  <span className="metric text-sm text-foreground">{avgCalories} kcal</span>
                </div>
                {[
                  { label: 'Protéines moy.', value: `${avgProtein}g`, color: '#00c853' },
                  { label: 'Glucides moy.', value: `${avgCarbs}g`, color: '#fe9400' },
                  { label: 'Lipides moy.', value: `${avgFat}g`, color: '#6c7b6a' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                    <span className="metric text-sm text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suivi du poids */}
          <div className="bg-surface-container rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-heading font-bold text-heading-md">Poids</p>
              {latestWeight !== null && (
                <div className="text-right">
                  <p className="metric text-heading-lg text-foreground">{latestWeight} kg</p>
                  <p className="text-xs text-muted-foreground">dernier relevé</p>
                </div>
              )}
            </div>

            <WeightMiniChart logs={weightList} />

            {weightList.length === 0 && latestWeight === null && (
              <p className="text-sm text-muted-foreground">
                Enregistre ton poids pour suivre ta progression.
              </p>
            )}

            <AddWeightForm currentWeight={latestWeight} />
          </div>

        </div>
      </div>
    </div>
  );
}
