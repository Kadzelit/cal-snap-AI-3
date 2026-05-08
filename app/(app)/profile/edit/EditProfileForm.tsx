'use client'

import { useFormState } from 'react-dom';
import { updateProfile, type UpdateProfileState } from '../actions';
import type { Database } from '@/types/database';
import { ChevronLeft, User, Ruler, Target, Zap, CalendarDays, Scale } from 'lucide-react';
import Link from 'next/link';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface Props {
  profile: Partial<Profile>;
}

const initialState: UpdateProfileState = null;

const GOAL_OPTIONS = [
  {
    value: 'lose',
    label: 'Perdre du poids',
    sub: 'Déficit calorique adapté',
    emoji: '🔥',
    cardClass: 'peer-checked:border-orange-400 peer-checked:bg-orange-50',
  },
  {
    value: 'maintain',
    label: 'Maintenir mon poids',
    sub: 'Equilibre et forme',
    emoji: '⚖️',
    cardClass: 'peer-checked:border-primary peer-checked:bg-primary/5',
  },
  {
    value: 'gain',
    label: 'Prendre de la masse',
    sub: 'Surplus pour la prise musculaire',
    emoji: '💪',
    cardClass: 'peer-checked:border-blue-400 peer-checked:bg-blue-50',
  },
] as const;

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sédentaire', sub: "Peu ou pas d'exercice", emoji: '🛋️', bars: 1 },
  { value: 'light', label: 'Légèrement actif', sub: '1–3 jours/semaine', emoji: '🚶', bars: 2 },
  { value: 'active', label: 'Actif', sub: '3–5 jours/semaine', emoji: '🏃', bars: 3 },
  { value: 'very_active', label: 'Très actif', sub: '6–7 jours/semaine', emoji: '⚡', bars: 4 },
] as const;

const GENDER_OPTIONS = [
  { value: 'male', label: 'Homme', emoji: '👨' },
  { value: 'female', label: 'Femme', emoji: '👩' },
  { value: 'other', label: 'Autre', emoji: '🧑' },
] as const;

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">{title}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function ActivityBars({ count }: { count: number }) {
  return (
    <div className="flex items-end gap-1">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`w-1.5 rounded-full ${i <= count ? 'bg-primary' : 'bg-muted-foreground/20'}`}
          style={{ height: `${6 + i * 4}px` }}
        />
      ))}
    </div>
  );
}

export function EditProfileForm({ profile }: Props) {
  const [state, action] = useFormState(updateProfile, initialState);

  const todayStr = new Date().toISOString().split('T')[0];
  const minTargetDate = new Date();
  minTargetDate.setDate(minTargetDate.getDate() + 7);
  const minTargetDateStr = minTargetDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-surface-highest h-14 flex items-center px-4 gap-3">
        <Link href="/profile" className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading font-bold text-heading-md flex-1">Mon profil</h1>
        <button
          form="edit-profile-form"
          type="submit"
          className="bg-primary text-white font-semibold text-sm px-4 py-1.5 rounded-full transition-all active:scale-95"
        >
          Sauvegarder
        </button>
      </div>

      <form id="edit-profile-form" action={action} className="pt-14 px-5 pb-32 space-y-5">
        {state?.error && (
          <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
            <p className="text-destructive text-sm font-medium">{state.error}</p>
          </div>
        )}

        {/* Identité */}
        <section className="bg-surface-container rounded-3xl p-5 space-y-4 pt-6">
          <SectionHeader icon={User} title="Identité" />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide" htmlFor="full_name">
              Prénom & nom
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile.full_name ?? ''}
              placeholder="Ton prénom"
              className="w-full px-4 py-3.5 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
              required
            />
          </div>

          {/* Genre — pills with emoji */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Genre</span>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map(({ value, label, emoji }) => (
                <label key={value} className="flex-1 relative cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    defaultChecked={(profile.gender ?? 'male') === value}
                    className="sr-only peer"
                    required
                  />
                  <div className="flex flex-col items-center gap-1 py-3 rounded-2xl border-2 border-border bg-background peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white transition-all active:scale-95">
                    <span className="text-lg leading-none">{emoji}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5" htmlFor="birth_date">
              <CalendarDays className="w-3.5 h-3.5" />
              Date de naissance
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              defaultValue={profile.birth_date ?? ''}
              max={todayStr}
              className="w-full px-4 py-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>
        </section>

        {/* Mensurations */}
        <section className="bg-surface-container rounded-3xl p-5 space-y-4">
          <SectionHeader icon={Ruler} title="Mensurations" sub="Utilisées pour calculer ton TDEE" />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-2xl p-4 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <label className="text-xs text-muted-foreground block mb-1" htmlFor="height_cm">Taille</label>
              <div className="flex items-baseline gap-1">
                <input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  defaultValue={profile.height_cm ?? ''}
                  placeholder="175"
                  min="50"
                  max="300"
                  className="w-full bg-transparent text-2xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                  required
                />
                <span className="text-sm text-muted-foreground font-medium flex-shrink-0">cm</span>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-4 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <label className="text-xs text-muted-foreground block mb-1" htmlFor="weight_kg">Poids actuel</label>
              <div className="flex items-baseline gap-1">
                <input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  defaultValue={profile.weight_kg ?? ''}
                  placeholder="70"
                  min="20"
                  max="500"
                  className="w-full bg-transparent text-2xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                  required
                />
                <span className="text-sm text-muted-foreground font-medium flex-shrink-0">kg</span>
              </div>
            </div>
          </div>
        </section>

        {/* Objectif */}
        <section className="bg-surface-container rounded-3xl p-5 space-y-4">
          <SectionHeader icon={Target} title="Mon objectif" sub="Influence le calcul de tes calories" />

          <div className="space-y-2">
            {GOAL_OPTIONS.map(({ value, label, sub, emoji, cardClass }) => (
              <label key={value} className="relative cursor-pointer block">
                <input
                  type="radio"
                  name="goal"
                  value={value}
                  defaultChecked={(profile.goal ?? 'maintain') === value}
                  className="sr-only peer"
                  required
                />
                <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl border-2 border-border bg-background ${cardClass} transition-all active:scale-[0.98]`}>
                  <span className="text-2xl leading-none">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Objectifs détaillés */}
        <section className="bg-surface-container rounded-3xl p-5 space-y-4">
          <SectionHeader icon={Scale} title="Objectifs détaillés" sub="Affine les recommandations IA et macros" />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide" htmlFor="goals_description">
              Note libre
            </label>
            <textarea
              id="goals_description"
              name="goals_description"
              defaultValue={profile.goals_description ?? ''}
              placeholder="Ex: Je veux perdre 10 kg avant l'été... Mention keto / musculation / endurance pour adapter tes macros."
              rows={3}
              className="w-full px-4 py-3.5 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
            />
            <div className="flex items-start gap-1.5 bg-primary/5 rounded-xl p-3">
              <span className="text-primary text-xs mt-0.5">✦</span>
              <p className="text-xs text-muted-foreground">
                Mentionner <span className="font-semibold text-foreground">keto</span>, <span className="font-semibold text-foreground">musculation</span> ou <span className="font-semibold text-foreground">endurance</span> adapte automatiquement tes macros et les suggestions IA.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-2xl p-4 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <label className="text-xs text-muted-foreground block mb-1" htmlFor="target_weight_kg">Poids cible</label>
              <div className="flex items-baseline gap-1">
                <input
                  id="target_weight_kg"
                  name="target_weight_kg"
                  type="number"
                  step="0.1"
                  defaultValue={profile.target_weight_kg ?? ''}
                  placeholder="65"
                  min="20"
                  max="500"
                  className="w-full bg-transparent text-2xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                />
                <span className="text-sm text-muted-foreground font-medium flex-shrink-0">kg</span>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-4 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <label className="text-xs text-muted-foreground block mb-1" htmlFor="target_body_fat_pct">% MG cible</label>
              <div className="flex items-baseline gap-1">
                <input
                  id="target_body_fat_pct"
                  name="target_body_fat_pct"
                  type="number"
                  step="0.1"
                  defaultValue={profile.target_body_fat_pct ?? ''}
                  placeholder="15"
                  min="3"
                  max="60"
                  className="w-full bg-transparent text-2xl font-bold text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                />
                <span className="text-sm text-muted-foreground font-medium flex-shrink-0">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5" htmlFor="target_date">
              <CalendarDays className="w-3.5 h-3.5" />
              Date objectif
            </label>
            <input
              id="target_date"
              name="target_date"
              type="date"
              defaultValue={profile.target_date ?? ''}
              min={minTargetDateStr}
              className="w-full px-4 py-3.5 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Avec un poids cible + une date, tes calories sont calculées pour atteindre l&apos;objectif à temps.
            </p>
          </div>
        </section>

        {/* Activité */}
        <section className="bg-surface-container rounded-3xl p-5 space-y-4">
          <SectionHeader icon={Zap} title="Niveau d'activité" sub="Impact direct sur tes calories de maintien" />

          <div className="space-y-2">
            {ACTIVITY_OPTIONS.map(({ value, label, sub, emoji, bars }) => (
              <label key={value} className="relative cursor-pointer block">
                <input
                  type="radio"
                  name="activity_level"
                  value={value}
                  defaultChecked={(profile.activity_level ?? 'sedentary') === value}
                  className="sr-only peer"
                  required
                />
                <div className="flex items-center gap-4 px-4 py-4 rounded-2xl border-2 border-border bg-background peer-checked:bg-primary/5 peer-checked:border-primary transition-all active:scale-[0.98]">
                  <span className="text-2xl leading-none">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </div>
                  <ActivityBars count={bars} />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Bottom save */}
        <button
          type="submit"
          className="w-full bg-primary text-white font-bold py-4 rounded-full text-base transition-all active:scale-[0.98] shadow-lg shadow-primary/30"
        >
          Sauvegarder mon profil
        </button>
      </form>
    </div>
  );
}
