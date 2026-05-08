'use client'

import { useRef, useState } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { saveBodyLog } from '@/app/(app)/stats/actions';
import { BodyFatChart } from './BodyFatChart';

interface BodyLog {
  body_fat_pct: number;
  logged_at: string;
  ai_confidence: number | null;
}

interface Props {
  currentBodyFat: number | null;
  targetBodyFat: number | null;
  recentLogs: BodyLog[];
}

interface AnalysisResult {
  body_fat_pct: number;
  lean_mass_pct: number;
  category: string;
  description: string;
  confidence: number;
}

const CATEGORY_COLOR: Record<string, string> = {
  'Athlète': '#00c853',
  'Fitness': '#4caf50',
  'Acceptable': '#fe9400',
  'Obésité': '#f44336',
};

export function BodyFatSection({ currentBodyFat, targetBodyFat, recentLogs }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function reset() {
    setPreview(null);
    setImageFile(null);
    setResult(null);
    setPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleAnalyze() {
    if (!imageFile) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const res = await fetch('/api/analyze-body', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Analyse impossible');
        return;
      }
      setResult(data.analysis);
      setPhotoUrl(data.photoUrl);
    } catch {
      toast.error('Erreur réseau, réessaie.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      await saveBodyLog({
        body_fat_pct: result.body_fat_pct,
        photo_url: photoUrl,
        ai_confidence: result.confidence,
      });
      toast.success('Mesure enregistrée !');
      reset();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  const categoryColor = result ? (CATEGORY_COLOR[result.category] ?? '#6c7b6a') : '#6c7b6a';

  return (
    <div className="bg-surface-container rounded-3xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-heading font-bold text-heading-md">Composition corporelle</p>
          <p className="text-xs text-muted-foreground mt-0.5">Estimation IA par photo ±5-8%</p>
        </div>
        {currentBodyFat !== null && (
          <div className="text-right">
            <p className="metric text-heading-md text-foreground">{currentBodyFat}%</p>
            <p className="text-xs text-muted-foreground">masse grasse</p>
          </div>
        )}
      </div>

      {/* Objectif vs actuel */}
      {currentBodyFat !== null && targetBodyFat !== null && (
        <div className="flex gap-3">
          <div className="flex-1 bg-background rounded-2xl p-3 text-center">
            <p className="metric text-heading-md text-foreground">{currentBodyFat}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">actuel</p>
          </div>
          <div className="flex-1 bg-background rounded-2xl p-3 text-center">
            <p className="metric text-heading-md text-primary-container">{targetBodyFat}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">objectif</p>
          </div>
          <div className="flex-1 bg-background rounded-2xl p-3 text-center">
            <p className="metric text-heading-md text-foreground">
              {Math.abs(currentBodyFat - targetBodyFat).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentBodyFat > targetBodyFat ? 'à perdre' : 'à gagner'}
            </p>
          </div>
        </div>
      )}

      {/* Graphique d'évolution */}
      {recentLogs.length > 0 && !preview && (
        <BodyFatChart logs={recentLogs} />
      )}

      {/* Zone upload */}
      {!preview && !result && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary-container hover:text-primary-container transition-colors"
          >
            <Camera className="w-7 h-7" />
            <span className="text-sm font-medium">Prendre une photo ou importer</span>
            <span className="text-xs opacity-70">En tenue de sport pour une meilleure précision</span>
          </button>
        </>
      )}

      {/* Prévisualisation + résultat */}
      {preview && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" className="w-full max-h-64 object-contain" />
            <button
              onClick={reset}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-primary-container text-white font-semibold py-3 rounded-2xl text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Analyser ma composition
                </>
              )}
            </button>
          )}

          {result && (
            <div className="space-y-3">
              {/* Résultat principal */}
              <div className="bg-background rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{result.body_fat_pct}% MG</p>
                    <p className="text-sm text-muted-foreground">{result.lean_mass_pct}% masse maigre</p>
                  </div>
                  <span
                    className="text-sm font-semibold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: categoryColor + '20', color: categoryColor }}
                  >
                    {result.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.description}</p>
                <div className="flex items-center gap-1.5">
                  {result.confidence >= 0.6 ? (
                    <CheckCircle className="w-3.5 h-3.5 text-primary-container" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-[#fe9400]" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    Confiance : {Math.round(result.confidence * 100)}%
                    {result.confidence < 0.6 && ' — résultat approximatif'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 py-3 rounded-2xl border border-border text-sm font-medium text-muted-foreground"
                >
                  Recommencer
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary-container text-white font-semibold py-3 rounded-2xl text-sm transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
