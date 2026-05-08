import { createClient } from '@/lib/supabase/server';
import { TopBar } from '@/components/shared/TopBar';
import { logout } from '@/app/(auth)/actions';
import { ChevronRight, Pencil, Scale, LogOut, Flame } from 'lucide-react';
import Link from 'next/link';

const GOAL_LABEL: Record<string, string> = {
  lose: 'Perdre du poids',
  maintain: 'Maintenir mon poids',
  gain: 'Prendre de la masse',
};

const ACTIVITY_LABEL: Record<string, string> = {
  sedentary: 'Sédentaire',
  light: 'Légèrement actif',
  active: 'Actif',
  very_active: 'Très actif',
};

function calculateStreak(mealDates: string[]): number {
  if (!mealDates.length) return 0;
  const dateSet = new Set(mealDates);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = new Date(today.getTime() - 86_400_000).toISOString().split('T')[0];
  if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) return 0;
  let cursor = dateSet.has(todayStr) ? today : new Date(today.getTime() - 86_400_000);
  let streak = 0;
  while (dateSet.has(cursor.toISOString().split('T')[0])) {
    streak++;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const bd = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - bd.getFullYear() -
    (today < new Date(today.getFullYear(), bd.getMonth(), bd.getDate()) ? 1 : 0);
  return age;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    { data: profile },
    { count: mealsCount },
    { count: recipesCount },
    { data: recentMeals },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, email, gender, birth_date, height_cm, weight_kg, activity_level, goal, daily_calorie_target, daily_protein_g, daily_carbs_g, daily_fat_g, goals_description, target_weight_kg, target_body_fat_pct, target_date')
      .eq('id', user?.id ?? '')
      .single(),
    supabase
      .from('meals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id ?? ''),
    supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id ?? ''),
    supabase
      .from('meals')
      .select('logged_at')
      .eq('user_id', user?.id ?? '')
      .gte('logged_at', thirtyDaysAgo.toISOString()),
  ]);

  const mealDates = (recentMeals ?? []).map(m => m.logged_at.split('T')[0]);
  const streak = calculateStreak(mealDates);
  const age = calcAge(profile?.birth_date ?? null);

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Mon compte';

  const hasPlan = profile?.daily_calorie_target != null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        title="Profil"
        right={
          <Link href="/profile/edit" className="p-1">
            <Pencil className="w-4 h-4 text-foreground" />
          </Link>
        }
      />

      <div className="pt-14 px-6 pb-28 space-y-5">

        {/* Avatar + nom */}
        <div className="pt-6 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-heading-md text-foreground">{displayName}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Repas', value: String(mealsCount ?? 0) },
            { label: 'Recettes', value: String(recipesCount ?? 0) },
            { label: 'Streak', value: String(streak) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-container rounded-2xl p-4 text-center">
              <p className="metric text-heading-md text-foreground">{value}</p>
              <p className="label-caps mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Infos personnelles */}
        {(age || profile?.height_cm || profile?.weight_kg) && (
          <div className="bg-surface-container rounded-3xl p-5 space-y-3">
            <p className="label-caps">Mes infos</p>
            <div className="flex justify-between">
              {age && (
                <div className="text-center">
                  <p className="metric text-heading-md text-foreground">{age}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">ans</p>
                </div>
              )}
              {profile?.height_cm && (
                <div className="text-center">
                  <p className="metric text-heading-md text-foreground">{profile.height_cm}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">cm</p>
                </div>
              )}
              {profile?.weight_kg && (
                <div className="text-center">
                  <p className="metric text-heading-md text-foreground">{profile.weight_kg}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">kg</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mon plan */}
        {hasPlan && (
          <div className="bg-surface-container rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <p className="label-caps">Mon plan</p>
              {profile?.goal && (
                <span className="text-xs font-semibold text-primary-container bg-primary-container/10 px-3 py-1 rounded-full">
                  {GOAL_LABEL[profile.goal]}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="metric text-metric-large text-foreground">
                  {profile?.daily_calorie_target}
                </p>
                <p className="text-xs text-muted-foreground">kcal / jour</p>
              </div>
              <div className="space-y-2 text-right">
                {[
                  { label: 'Protéines', value: profile?.daily_protein_g, color: '#00c853' },
                  { label: 'Glucides', value: profile?.daily_carbs_g, color: '#fe9400' },
                  { label: 'Lipides', value: profile?.daily_fat_g, color: '#6c7b6a' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-2 justify-end">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-sm font-semibold text-foreground">{value}g</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                ))}
              </div>
            </div>

            {profile?.activity_level && (
              <p className="text-xs text-muted-foreground border-t border-surface-highest pt-3">
                Activité : {ACTIVITY_LABEL[profile.activity_level]}
              </p>
            )}
          </div>
        )}

        {/* Objectifs détaillés */}
        {(profile?.goals_description || profile?.target_weight_kg || profile?.target_date) && (
          <div className="bg-surface-container rounded-3xl p-5 space-y-3">
            <p className="label-caps">Mes objectifs</p>

            {profile.goals_description && (
              <p className="text-sm text-foreground leading-relaxed">
                &ldquo;{profile.goals_description}&rdquo;
              </p>
            )}

            {(profile.target_weight_kg || profile.target_body_fat_pct || profile.target_date) && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {profile.target_weight_kg && (
                  <div className="bg-background rounded-2xl p-3 text-center">
                    <p className="metric text-heading-md text-primary-container">{profile.target_weight_kg}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">kg cible</p>
                  </div>
                )}
                {profile.target_body_fat_pct && (
                  <div className="bg-background rounded-2xl p-3 text-center">
                    <p className="metric text-heading-md text-foreground">{profile.target_body_fat_pct}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">% MG cible</p>
                  </div>
                )}
                {profile.target_date && (
                  <div className="bg-background rounded-2xl p-3 text-center">
                    <p className="metric text-[15px] font-bold text-foreground">
                      {new Date(profile.target_date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">échéance</p>
                  </div>
                )}
              </div>
            )}

            {profile.target_weight_kg && profile.weight_kg && (
              <div className="pt-1">
                {(() => {
                  const delta = Math.abs(profile.target_weight_kg - profile.weight_kg);
                  const direction = profile.target_weight_kg < profile.weight_kg ? 'perdre' : 'prendre';
                  return (
                    <p className="text-xs text-muted-foreground">
                      Il te reste <span className="font-semibold text-foreground">{delta.toFixed(1)} kg</span> à {direction}.
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Menu */}
        <div className="space-y-2">
          <Link
            href="/profile/edit"
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container text-left transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-primary-container" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Modifier mon profil</p>
              <p className="text-muted-foreground text-xs">Infos, objectif, activité</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link
            href="/stats"
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container text-left transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-container" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Suivi du poids</p>
              <p className="text-muted-foreground text-xs">Voir et enregistrer ton poids</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          {streak > 0 && (
            <Link
              href="/stats"
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container text-left transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary-container" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">Mes statistiques</p>
                <p className="text-muted-foreground text-xs">
                  {streak} jour{streak > 1 ? 's' : ''} de streak 🔥
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          )}
        </div>

        {/* Déconnexion */}
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border text-left transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <p className="font-semibold text-destructive text-sm">Se déconnecter</p>
          </button>
        </form>

      </div>
    </div>
  );
}
