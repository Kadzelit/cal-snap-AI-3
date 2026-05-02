'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Mic, MicOff, Sparkles, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default function AddVoicePage() {
  const router = useRouter()
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) return

    setIsSupported(true)

    const recognition = new SR()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const result = Array.from(event.results as ArrayLike<{ [index: number]: { transcript: string } }>)
        .map((r) => r[0].transcript)
        .join('')
      setTranscript(result)
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
  }, [])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      setTranscript('')
      setError(null)
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch {
        setError('Impossible de démarrer le micro. Vérifie les autorisations.')
      }
    }
  }, [isListening])

  async function handleAnalyze() {
    if (!transcript.trim()) return
    setError(null)
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

          {!isSupported ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 text-center space-y-2">
              <p className="font-semibold text-destructive text-sm">Reconnaissance vocale non disponible</p>
              <p className="text-xs text-muted-foreground">
                Ton navigateur ne supporte pas cette fonctionnalité. Utilise Chrome ou Edge.
              </p>
              <Link
                href="/add/text"
                className="inline-block mt-2 text-sm font-semibold text-primary-container underline"
              >
                Utiliser la saisie texte à la place
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isListening
                    ? 'Je t\'écoute… Parle de ton repas'
                    : transcript
                    ? 'Transcription terminée'
                    : 'Appuie sur le micro et décris ton repas'}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={toggleListening}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
                    isListening
                      ? 'bg-destructive animate-pulse'
                      : 'bg-primary-container'
                  }`}
                  aria-label={isListening ? 'Arrêter' : 'Dicter'}
                >
                  {isListening ? (
                    <MicOff className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </button>
              </div>

              {transcript ? (
                <div className="w-full space-y-3">
                  <div className="bg-surface-container rounded-2xl p-4 min-h-[80px]">
                    <p className="text-sm text-foreground">{transcript}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setTranscript(''); setIsListening(false) }}
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
              ) : (
                <div className="bg-surface-container rounded-2xl p-4 min-h-[80px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground italic text-center">
                    La transcription apparaîtra ici…
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
