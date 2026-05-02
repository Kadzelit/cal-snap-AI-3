import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const imageFile = formData.get('image') as File | null
  if (!imageFile || imageFile.size === 0) {
    return NextResponse.json({ error: 'Image manquante' }, { status: 400 })
  }

  const fileName = `${user.id}/${Date.now()}.jpg`
  const { error: uploadError } = await supabase.storage
    .from('meal-photos')
    .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: 'Erreur upload photo' }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('meal-photos').getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('meals')
    .update({ photo_url: urlData.publicUrl })
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }

  return NextResponse.json({ photo_url: urlData.publicUrl })
}
