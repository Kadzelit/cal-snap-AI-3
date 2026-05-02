'use client'

import { useRef, useState } from 'react';
import { Scale } from 'lucide-react';
import { toast } from 'sonner';
import { addWeightLog } from '@/app/(app)/stats/actions';

interface Props {
  currentWeight: number | null;
}

export function AddWeightForm({ currentWeight }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addWeightLog(formData);
      toast.success('Poids enregistré !');
      ref.current?.reset();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={ref} onSubmit={handleSubmit} className="flex gap-3 items-center">
      <div className="flex-1 relative">
        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          name="weight_kg"
          type="number"
          step="0.1"
          min="20"
          max="500"
          placeholder={currentWeight ? String(currentWeight) : '75.0'}
          className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          required
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
          kg
        </span>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary-container text-white font-semibold px-5 py-3 rounded-xl text-sm transition-opacity disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? '...' : 'Enregistrer'}
      </button>
    </form>
  );
}
