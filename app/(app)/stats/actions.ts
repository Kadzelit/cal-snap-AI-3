'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const WeightSchema = z.object({
  weight_kg: z.coerce.number().positive().max(500),
});

export async function addWeightLog(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const parsed = WeightSchema.safeParse({ weight_kg: formData.get('weight_kg') });
  if (!parsed.success) throw new Error('Poids invalide');

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('weight_logs')
    .upsert(
      { user_id: user.id, weight_kg: parsed.data.weight_kg, logged_at: today },
      { onConflict: 'user_id,logged_at' }
    );

  if (error) throw new Error(error.message);

  revalidatePath('/stats');
}
