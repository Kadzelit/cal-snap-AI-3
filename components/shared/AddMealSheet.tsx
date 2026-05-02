'use client'

import { Camera, Mic, FileText, ScanBarcode, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
}

const OPTIONS = [
  {
    href: '/scan',
    icon: Camera,
    label: 'Photo',
    sub: 'Photographier mon plat',
    color: '#00c853',
    bgClass: 'bg-[#00c853]/10',
  },
  {
    href: '/add/voice',
    icon: Mic,
    label: 'Vocal',
    sub: 'Dicter mon repas',
    color: '#6366f1',
    bgClass: 'bg-[#6366f1]/10',
  },
  {
    href: '/add/text',
    icon: FileText,
    label: 'Texte',
    sub: 'Écrire manuellement',
    color: '#fe9400',
    bgClass: 'bg-[#fe9400]/10',
  },
  {
    href: '/add/barcode',
    icon: ScanBarcode,
    label: 'Scan',
    sub: 'Scanner un code-barres',
    color: '#6c7b6a',
    bgClass: 'bg-[#6c7b6a]/10',
  },
]

export function AddMealSheet({ open, onClose }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl">
        <div className="px-6 pt-5 pb-10 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-heading-md text-foreground">
              Ajouter un repas
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {OPTIONS.map(({ href, icon: Icon, label, sub, color, bgClass }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-surface-container active:scale-[0.97] transition-transform"
              >
                <div className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
