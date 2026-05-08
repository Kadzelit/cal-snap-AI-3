'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { calculateTdee } from '@/lib/tdee';
import type { Gender, ActivityLevel, Goal } from '@/lib/tdee';

const WeightSchema = z.object({
  weight_kg: z.coerce.number().positive().max(500),
});

export async function addWeightLog(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const parsed = WeightSchema.safeParse({ weight_kg: formData.get('weight_kg') });
  if (!parsed.success) throw new Error('Poids invalide');

  const { weight_kg } = parsed.data;
  const today = new Date().toISOString().split('T')[0];

  // Sauvegarde dans weight_logs
  const { error: logError } = await supabase
    .from('weight_logs')
    .upsert(
      { user_id: user.id, weight_kg, logged_at: today },
      { onConflict: 'user_id,logged_at' }
    );
  if (logError) throw new Error(logError.message);

  // Met à jour le poids dans le profil et recalcule le TDEE
  const { data: profile } = await supabase
    .from('profiles')
    .select('gender, birth_date, height_cm, activity_level, goal, target_weight_kg, target_date, goals_description')
    .eq('id', user.id)
    .single();

  if (profile?.gender && profile.birth_date && profile.height_cm && profile.activity_level && profile.goal) {
    const age = Math.floor(
      (Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    const macros = calculateTdee({
      gender: profile.gender as Gender,
      age,
      height_cm: profile.height_cm,
      weight_kg,
      activity_level: profile.activity_level as ActivityLevel,
      goal: profile.goal as Goal,
      target_weight_kg: profile.target_weight_kg ?? null,
      target_date: profile.target_date ?? null,
      goals_description: profile.goals_description ?? null,
    });

    await supabase
      .from('profiles')
      .update({ weight_kg, ...macros, updated_at: new Date().toISOString() })
      .eq('id', user.id);
  } else {
    // Profil incomplet : met à jour le poids seul
    await supabase
      .from('profiles')
      .update({ weight_kg, updated_at: new Date().toISOString() })
      .eq('id', user.id);
  }

  revalidatePath('/stats');
  revalidatePath('/dashboard');
  revalidatePath('/profile');
}

interface BodyLogInput {
  body_fat_pct: number;
  photo_url: string | null;
  ai_confidence: number;
}

export async function saveBodyLog({ body_fat_pct, photo_url, ai_confidence }: BodyLogInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('body_logs')
    .upsert(
      { user_id: user.id, body_fat_pct, photo_url, logged_at: today, ai_confidence },
      { onConflict: 'user_id,logged_at' }
    );
  if (error) throw new Error(error.message);

  // Met à jour la valeur courante dans le profil
  await supabase
    .from('profiles')
    .update({ current_body_fat_pct: body_fat_pct, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  revalidatePath('/stats');
  revalidatePath('/profile');
}
