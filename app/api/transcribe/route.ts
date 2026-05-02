import { NextRequest, NextResponse } from 'next/server'
import Groq, { toFile } from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const audioBlob = formData.get('audio') as File | null
  if (!audioBlob || audioBlob.size === 0) {
    return NextResponse.json({ error: 'Fichier audio manquant' }, { status: 400 })
  }

  try {
    const ext = audioBlob.type.includes('mp4') ? 'mp4'
      : audioBlob.type.includes('ogg') ? 'ogg'
      : 'webm'

    const uploadable = await toFile(audioBlob, `recording.${ext}`, { type: audioBlob.type })

    const transcription = await groq.audio.transcriptions.create({
      file: uploadable,
      model: 'whisper-large-v3-turbo',
      language: 'fr',
      response_format: 'json',
    })

    return NextResponse.json({ text: transcription.text })
  } catch (err) {
    console.error('[transcribe]', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
