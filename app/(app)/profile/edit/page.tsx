import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditProfileForm } from './EditProfileForm';

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, gender, birth_date, height_cm, weight_kg, activity_level, goal, goals_description, target_weight_kg, target_body_fat_pct, target_date')
    .eq('id', user.id)
    .single();

  return <EditProfileForm profile={profile ?? {}} />;
}
