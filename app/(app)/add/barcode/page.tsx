'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Keyboard } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import PhotoPicker from '@/components/shared/PhotoPicker'

type Status = 'starting' | 'scanning' | 'found' | 'error'

export default function AddBarcodePage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const [status, setStatus] = useState<Status>('starting')
  const [manualOpen, setManualOpen] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
  }, [])

  const lookupBarcode = useCallback(async (code: string, photo?: File) => {
    setStatus('found')
    setIsLoading(true)
    try {
      const res = await fetch(`/api/barcode/${code}`)
      const data = await res.json()
      if (res.ok) {
        if (photo) {
          const fd = new FormData()
          fd.append('image', photo)
          await fetch(`/api/meal/${data.id}`, { method: 'PATCH', body: fd })
        }
        router.replace(`/meal/${data.id}`)
      } else {
        setErrorMsg(data.error ?? 'Produit non trouvé')
        setStatus('scanning')
        setIsLoading(false)
      }
    } catch {
      setErrorMsg('Erreur réseau. Réessaie.')
      setStatus('scanning')
      setIsLoading(false)
    }
  }, [router])

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return
    try {
      const codeReader = new BrowserMultiFormatReader()
      const controls = await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            controls.stop()
            controlsRef.current = null
            lookupBarcode(result.getText())
          }
          if (error && !(error instanceof NotFoundException)) {
            // erreur réelle (pas juste "aucun code dans le frame")
          }
        }
      )
      controlsRef.current = controls
      setStatus('scanning')
    } catch {
      setStatus('error')
    }
  }, [lookupBarcode])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  function handlePhotoSelect(file: File) {
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handlePhotoRemove() {
    setPhotoFile(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) return
    stopCamera()
    await lookupBarcode(code, photoFile ?? undefined)
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative z-10 flex flex-col h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <button
            onClick={() => { stopCamera(); router.back() }}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <p className="text-white font-heading font-bold text-[15px]">Scanner un code-barres</p>
          <div className="w-10" />
        </div>

        {/* Viewfinder */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          {(status === 'scanning' || status === 'found') && (
            <div className="relative w-full max-w-sm h-36">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-md" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-md" />
              {status === 'scanning' && (
                <div className="absolute inset-x-2 top-0 h-0.5 bg-primary-container animate-scan" />
              )}
              {status === 'found' && (
                <div className="absolute inset-0 rounded bg-primary-container/20 border-2 border-primary-container" />
              )}
            </div>
          )}

          {status === 'starting' && (
            <p className="text-white/70 text-sm">Démarrage de la caméra…</p>
          )}
          {status === 'found' && (
            <p className="text-white font-semibold text-sm">Code détecté ! Recherche du produit…</p>
          )}
          {status === 'scanning' && !isLoading && (
            <p className="text-white/70 text-sm text-center">Centre le code-barres dans le cadre</p>
          )}
          {status === 'error' && (
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-5 text-center space-y-3 max-w-xs">
              <p className="text-white font-semibold text-sm">Caméra inaccessible</p>
              <p className="text-white/70 text-xs">Vérifie les autorisations caméra.</p>
              <button
                onClick={() => setManualOpen(true)}
                className="w-full py-3 rounded-xl bg-primary-container text-white text-sm font-semibold"
              >
                Saisir manuellement
              </button>
            </div>
          )}

          {errorMsg && status === 'scanning' && (
            <div className="bg-destructive/80 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white text-xs text-center">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-center pb-12">
          {status === 'scanning' && (
            <button
              onClick={() => setManualOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium"
            >
              <Keyboard className="w-4 h-4" />
              Saisir manuellement
            </button>
          )}
        </div>
      </div>

      {/* Manual input bottom sheet */}
      {manualOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setManualOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl px-6 pt-5 pb-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-heading-md text-foreground">Saisir le code</h2>
              <button
                onClick={() => setManualOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <PhotoPicker
                preview={photoPreview}
                onSelect={handlePhotoSelect}
                onRemove={handlePhotoRemove}
              />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
                placeholder="3017620422003"
                inputMode="numeric"
                maxLength={14}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Le code EAN-13 se trouve sous le code-barres du produit.
              </p>
              <button
                type="submit"
                disabled={!manualCode.trim() || isLoading}
                className="w-full py-4 rounded-2xl bg-primary-container text-white font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
              >
                {isLoading ? 'Recherche…' : 'Rechercher le produit'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
