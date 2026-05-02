'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

function todayKey() {
  return `creatine_${new Date().toISOString().slice(0, 10)}`
}

export default function CreatineTracker() {
  const [taken, setTaken] = useState(false)

  useEffect(() => {
    setTaken(localStorage.getItem(todayKey()) === '1')
  }, [])

  function toggle() {
    const next = !taken
    setTaken(next)
    if (next) {
      localStorage.setItem(todayKey(), '1')
    } else {
      localStorage.removeItem(todayKey())
    }
  }

  return (
    <div className="mt-5 pt-4 border-t border-background flex items-center gap-4">
      <button
        onClick={toggle}
        aria-label={taken ? 'Marquer créatine non prise' : 'Confirmer prise de créatine'}
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 active:scale-90 ${
          taken
            ? 'bg-[#00c853] border-[#00c853]'
            : 'bg-transparent border-border'
        }`}
      >
        {taken && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
      </button>
      <div>
        <p className="text-sm font-semibold text-foreground">Créatine</p>
        <p className="text-xs text-muted-foreground">
          {taken ? 'Prise aujourd\'hui ✓' : 'Appuie pour confirmer'}
        </p>
      </div>
    </div>
  )
}
