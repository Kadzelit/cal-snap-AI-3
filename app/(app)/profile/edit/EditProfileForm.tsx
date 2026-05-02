'use client'

import { useFormState } from 'react-dom';
import { updateProfile, type UpdateProfileState } from '../actions';
import type { Database } from '@/types/database';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface Props {
  profile: Partial<Profile>;
}

const initialState: UpdateProfileState = null;

const GOAL_OPTIONS = [
  { value: 'lose', label: 'Perdre du poids' },
  { value: 'maintain', label: 'Maintenir mon poids' },
  { value: 'gain', label: 'Prendre de la masse' },
] as const;

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sédentaire', sub: 'Peu ou pas d\'exercice' },
  { value: 'light', label: 'Légèrement actif', sub: '1–3 jours/semaine' },
  { value: 'active', label: 'Actif', sub: '3–5 jours/semaine' },
  { value: 'very_active', label: 'Très actif', sub: '6–7 jours/semaine' },
] as const;

const GENDER_OPTIONS = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'other', label: 'Autre' },
] as const;

export function EditProfileForm({ profile }: Props) {
  const [state, action] = useFormState(updateProfile, initialState);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-surface-highest h-14 flex items-center px-4 gap-3">
        <Link href="/profile" className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading font-bold text-heading-md flex-1">Modifier le profil</h1>
        <button
          form="edit-profile-form"
          type="submit"
          className="text-primary-container font-semibold text-sm"
        >
          Sauvegarder
        </button>
      </div>

      <form id="edit-profile-form" action={action} className="pt-14 px-6 pb-28 space-y-6">
        {state?.error && (
          <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
            <p className="text-destructive text-sm font-medium">{state.error}</p>
          </div>
        )}

        {/* Identité */}
        <section className="space-y-3 pt-4">
          <p className="label-caps">Identité</p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="full_name">
              Prénom & nom
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile.full_name ?? ''}
              placeholder="Ton prénom"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Genre</label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex-1 relative cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    defaultChecked={(profile.gender ?? 'male') === value}
                    className="sr-only peer"
                    required
                  />
                  <div className="text-center py-3 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground peer-checked:bg-primary-container peer-checked:text-white peer-checked:border-primary-container transition-all">
                    {label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="birth_date">
              Date de naissance
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              defaultValue={profile.birth_date ?? ''}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>
        </section>

        {/* Mensurations */}
        <section className="space-y-3">
          <p className="label-caps">Mensurations</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="height_cm">
                Taille
              </label>
              <div className="relative">
                <input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  defaultValue={profile.height_cm ?? ''}
                  placeholder="175"
                  min="50"
                  max="300"
                  className="w-full px-4 pr-12 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">cm</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="weight_kg">
                Poids
              </label>
              <div className="relative">
                <input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  defaultValue={profile.weight_kg ?? ''}
                  placeholder="70"
                  min="20"
                  max="500"
                  className="w-full px-4 pr-10 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kg</span>
              </div>
            </div>
          </div>
        </section>

        {/* Objectif */}
        <section className="space-y-3">
          <p className="label-caps">Objectif</p>
          <div className="space-y-2">
            {GOAL_OPTIONS.map(({ value, label }) => (
              <label key={value} className="relative cursor-pointer block">
                <input
                  type="radio"
                  name="goal"
                  value={value}
                  defaultChecked={(profile.goal ?? 'maintain') === value}
                  className="sr-only peer"
                  required
                />
                <div className="flex items-center justify-between px-4 py-4 rounded-2xl border border-border bg-background peer-checked:bg-primary-container/10 peer-checked:border-primary-container transition-all">
                  <span className="font-medium text-sm text-foreground">{label}</span>
                  <div className="w-5 h-5 rounded-full border-2 border-border peer-checked:border-primary-container peer-checked:bg-primary-container flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Activité */}
        <section className="space-y-3">
          <p className="label-caps">Niveau d&apos;activité</p>
          <div className="space-y-2">
            {ACTIVITY_OPTIONS.map(({ value, label, sub }) => (
              <label key={value} className="relative cursor-pointer block">
                <input
                  type="radio"
                  name="activity_level"
                  value={value}
                  defaultChecked={(profile.activity_level ?? 'sedentary') === value}
                  className="sr-only peer"
                  required
                />
                <div className="flex items-center justify-between px-4 py-4 rounded-2xl border border-border bg-background peer-checked:bg-primary-container/10 peer-checked:border-primary-container transition-all">
                  <div>
                    <p className="font-medium text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-border peer-checked:border-primary-container flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full peer-checked:bg-primary-container" />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>
      </form>
    </div>
  );
}
