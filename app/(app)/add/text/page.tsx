'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Send, Sparkles } from 'lucide-react'
import Link from 'next/link'

const EXAMPLES = [
  'Bol de riz avec du saumon teriyaki et des légumes sautés',
  'Sandwich jambon fromage baguette avec une pomme',
  'Salade César au poulet grillé',
  'Pâtes bolognaise avec parmesan',
]

export default function AddTextPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError(null)

    router.push('/analyzing')

    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        router.replace(`/meal/${data.id}`)
      } else {
        router.replace(`/add/text?error=${encodeURIComponent(data.error ?? 'Erreur')}`)
      }
    } catch {
      router.replace('/add/text?error=network')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-surface-highest h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard" className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading font-bold text-heading-md flex-1">Décrire un repas</h1>
      </div>

      <div className="pt-14 px-6 pb-28 space-y-6">
        <div className="pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Décris ton repas en détail — aliments, quantités, mode de cuisson. Plus tu es précis, meilleure sera l&apos;estimation.
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex : 150g de poulet grillé avec du riz basmati et une salade verte avec vinaigrette…"
                rows={5}
                maxLength={500}
                className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
              <span className="absolute bottom-3 right-4 text-xs text-muted-foreground">
                {text.length}/500
              </span>
            </div>

            <button
              type="submit"
              disabled={!text.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary-container text-white font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Analyser avec l&apos;IA
            </button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Exemples
            </p>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className="w-full text-left px-4 py-3 rounded-xl bg-surface-container text-sm text-foreground active:scale-[0.98] transition-transform flex items-center gap-3"
              >
                <Send className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
