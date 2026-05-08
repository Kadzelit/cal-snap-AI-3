'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { calculateTdee } from '@/lib/tdee';

const UpdateProfileSchema = z.object({
  full_name: z.string().min(1, 'Prénom requis').max(100),
  gender: z.enum(['male', 'female', 'other']),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de naissance invalide'),
  height_cm: z.coerce.number().int().min(50, 'Taille invalide').max(300),
  weight_kg: z.coerce.number().positive('Poids invalide').max(500),
  activity_level: z.enum(['sedentary', 'light', 'active', 'very_active']),
  goal: z.enum(['lose', 'maintain', 'gain']),
  goals_description: z.string().max(500).nullable().optional(),
  target_weight_kg: z.number().positive().max(500).nullable().optional(),
  target_body_fat_pct: z.number().min(3).max(60).nullable().optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export type UpdateProfileState = { error?: string } | null;

export async function updateProfile(
  prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const rawTargetWeight = formData.get('target_weight_kg') as string;
  const rawTargetFat = formData.get('target_body_fat_pct') as string;
  const rawTargetDate = formData.get('target_date') as string;

  const parsed = UpdateProfileSchema.safeParse({
    full_name: formData.get('full_name'),
    gender: formData.get('gender'),
    birth_date: formData.get('birth_date'),
    height_cm: formData.get('height_cm'),
    weight_kg: formData.get('weight_kg'),
    activity_level: formData.get('activity_level'),
    goal: formData.get('goal'),
    goals_description: (formData.get('goals_description') as string) || null,
    target_weight_kg: rawTargetWeight ? parseFloat(rawTargetWeight) : null,
    target_body_fat_pct: rawTargetFat ? parseFloat(rawTargetFat) : null,
    target_date: rawTargetDate || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    full_name, gender, birth_date, height_cm, weight_kg, activity_level, goal,
    goals_description, target_weight_kg, target_body_fat_pct, target_date,
  } = parsed.data;

  const birthDate = new Date(birth_date);
  const now = new Date();
  const age = now.getFullYear() - birthDate.getFullYear() -
    (now < new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);

  const macros = calculateTdee({
    gender, age, height_cm, weight_kg, activity_level, goal,
    target_weight_kg, target_date,
  });

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      gender,
      birth_date,
      height_cm,
      weight_kg,
      activity_level,
      goal,
      goals_description,
      target_weight_kg,
      target_body_fat_pct,
      target_date,
      ...macros,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { error: 'Erreur lors de la sauvegarde. Réessaie.' };

  // Ajoute une entrée dans weight_logs pour le poids du jour
  const todayStr = now.toISOString().split('T')[0];
  await supabase
    .from('weight_logs')
    .upsert(
      { user_id: user.id, weight_kg, logged_at: todayStr },
      { onConflict: 'user_id,logged_at' }
    );

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  redirect('/profile');
}
