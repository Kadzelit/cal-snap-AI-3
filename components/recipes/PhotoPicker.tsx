"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";

type Props = {
  initialUrl?: string | null;
  onUpload: (url: string | null) => void;
};

export function PhotoPicker({ initialUrl, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    // Affiche le preview local immédiatement
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload-recipe-photo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur upload");
      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setPreview(initialUrl ?? null);
      onUpload(initialUrl ?? null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUpload(null);
  };

  return (
    <div className="space-y-1">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center cursor-pointer transition-all hover:opacity-90 active:scale-[0.99]"
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Photo recette" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Camera className="w-8 h-8" />
            <p className="text-sm font-semibold">Ajouter une photo</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
