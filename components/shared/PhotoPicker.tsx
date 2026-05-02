'use client'

import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import Image from 'next/image'

interface PhotoPickerProps {
  preview: string | null
  onSelect: (file: File) => void
  onRemove: () => void
}

export default function PhotoPicker({ preview, onSelect, onRemove }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onSelect(file)
    e.target.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {preview ? (
        <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-surface-container">
          <Image src={preview} alt="Photo du repas" fill className="object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 rounded-2xl border-2 border-dashed border-border bg-surface-container flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        >
          <Camera className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Ajouter une photo (optionnel)</span>
        </button>
      )}
    </div>
  )
}
