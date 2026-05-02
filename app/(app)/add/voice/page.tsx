'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Mic, Square, Sparkles, RotateCcw, Loader2 } from 'lucide-react'
import Link from 'next/link'

type VoiceStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export default function AddVoicePage() {
  const router = useRouter()
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setErrorMsg(null)
    setTranscript('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        await transcribeAudio(blob, mimeType)
      }

      recorder.start(250)
      mediaRecorderRef.current = recorder
      setStatus('recording')
    } catch {
      setErrorMsg('Impossible d\'accéder au microphone. Vérifie les autorisations.')
      setStatus('error')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setStatus('processing')
  }, [])

  async function transcribeAudio(blob: Blob, mimeType: string) {
    setStatus('processing')
    try {
      const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
      const file = new File([blob], `recording.${ext}`, { type: mimeType })
      const formData = new FormData()
      formData.append('audio', file)

      const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok && data.text?.trim()) {
        setTranscript(data.text.trim())
        setStatus('done')
      } else {
        setErrorMsg(data.error ?? 'Transcription échouée. Réessaie.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Erreur réseau. Réessaie.')
      setStatus('error')
    }
  }

  function reset() {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    setTranscript('')
    setErrorMsg(null)
    setStatus('idle')
  }

  async function handleAnalyze() {
    if (!transcript.trim()) return
    router.push('/analyzing')
    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript }),
      })
      const data = await res.json()
      if (res.ok) {
        router.replace(`/meal/${data.id}`)
      } else {
        router.replace(`/add/voice?error=${encodeURIComponent(data.error ?? 'Erreur')}`)
      }
    } catch {
      router.replace('/add/voice?error=network')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-surface-highest h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard" className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading font-bold text-heading-md flex-1">Dicter un repas</h1>
      </div>

      <div className="pt-14 px-6 pb-28 flex flex-col items-center">
        <div className="pt-12 w-full space-y-8">

          {/* Status message */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              {status === 'idle' && 'Appuie sur le micro et décris ton repas'}
              {status === 'recording' && 'Parle de ton repas… Appuie sur stop pour terminer'}
              {status === 'processing' && 'Transcription en cours…'}
              {status === 'done' && 'Transcription terminée'}
              {status === 'error' && 'Une erreur est survenue'}
            </p>
          </div>

          {/* Mic button */}
          <div className="flex justify-center">
            {status === 'idle' || status === 'error' ? (
              <button
                onClick={startRecording}
                className="w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg bg-primary-container"
                aria-label="Démarrer l'enregistrement"
              >
                <Mic className="w-10 h-10 text-white" />
              </button>
            ) : status === 'recording' ? (
              <button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg bg-destructive animate-pulse"
                aria-label="Arrêter l'enregistrement"
              >
                <Square className="w-10 h-10 text-white fill-white" />
              </button>
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-surface-container">
                <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
              </div>
            )}
          </div>

          {/* Transcript area */}
          {status === 'done' && transcript ? (
            <div className="w-full space-y-3">
              <div className="bg-surface-container rounded-2xl p-4 min-h-[80px]">
                <p className="text-sm text-foreground">{transcript}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground active:scale-[0.98] transition-transform"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recommencer
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container text-white font-semibold text-sm active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyser
                </button>
              </div>
            </div>
          ) : status !== 'error' ? (
            <div className="bg-surface-container rounded-2xl p-4 min-h-[80px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground italic text-center">
                {status === 'processing'
                  ? 'Groq Whisper transcrit ton audio…'
                  : 'La transcription apparaîtra ici…'}
              </p>
            </div>
          ) : null}

          {/* Error */}
          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 space-y-3">
              <p className="text-destructive text-sm">{errorMsg}</p>
              <button
                onClick={reset}
                className="text-sm font-semibold text-destructive underline"
              >
                Réessayer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
