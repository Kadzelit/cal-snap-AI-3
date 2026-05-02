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
});

export type UpdateProfileState = { error?: string } | null;

export async function updateProfile(
  prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié' };

  const parsed = UpdateProfileSchema.safeParse({
    full_name: formData.get('full_name'),
    gender: formData.get('gender'),
    birth_date: formData.get('birth_date'),
    height_cm: formData.get('height_cm'),
    weight_kg: formData.get('weight_kg'),
    activity_level: formData.get('activity_level'),
    goal: formData.get('goal'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { full_name, gender, birth_date, height_cm, weight_kg, activity_level, goal } = parsed.data;

  const birthDate = new Date(birth_date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear() -
    (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);

  const macros = calculateTdee({ gender, age, height_cm, weight_kg, activity_level, goal });

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
      ...macros,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { error: 'Erreur lors de la sauvegarde. Réessaie.' };

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  redirect('/profile');
}
