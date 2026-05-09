"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, X, ImageIcon } from "lucide-react";

async function submitImage(
  file: File | Blob,
  fileName: string,
  router: ReturnType<typeof useRouter>,
  stopCamera: () => void,
  setIsAnalyzing: (val: boolean) => void,
  setErrorMsg: (msg: string | null) => void
) {
  stopCamera();
  setIsAnalyzing(true);
  setErrorMsg(null);

  const formData = new FormData();
  formData.append("image", file, fileName);
  try {
    const res = await fetch("/api/analyze-meal", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      router.push(`/meal/${data.id}`);
    } else {
      setIsAnalyzing(false);
      setErrorMsg(data.error || "Erreur d'analyse");
    }
  } catch {
    setIsAnalyzing(false);
    setErrorMsg("Erreur réseau — vérifie ta connexion");
  }
}

export function ScanPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMsg(decodeURIComponent(error));
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch {
      alert("Impossible d'accéder à la caméra. Vérifie les autorisations.");
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) { setIsCapturing(false); return; }
      await submitImage(blob, "meal.jpg", router, stopCamera, setIsAnalyzing, setErrorMsg);
      setIsCapturing(false);
    }, "image/jpeg", 0.85);
  }, [isCapturing, router, stopCamera]);

  const handleGalleryChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await submitImage(file, file.name, router, stopCamera, setIsAnalyzing, setErrorMsg);
  }, [router, stopCamera]);

  return (
    <div className="relative flex flex-col min-h-screen bg-black overflow-hidden">
      {/* Hidden gallery input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleGalleryChange}
      />

      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Error banner */}
      {errorMsg && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/90 text-white p-4 text-center text-sm animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-40 bg-black/80 flex flex-col items-center justify-center">
          <div className="space-y-6 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-white/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-semibold">Analyse en cours...</p>
              <p className="text-white/60 text-sm">Généralement moins de 5 secondes</p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <button
            onClick={() => { stopCamera(); router.back(); }}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <p className="text-white font-heading font-bold text-[15px]">Scanner un repas</p>
          <div className="w-10" />
        </div>

        {/* Viewfinder frame */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="relative w-full aspect-square max-w-[320px]">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white rounded-br-lg" />
          </div>
        </div>

        {/* Bottom controls */}
        {isStreaming ? (
          // Camera active — capture + gallery
          <div className="flex items-center justify-around px-8 pb-12">
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
              aria-label="Galerie"
            >
              <ImageIcon className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full bg-primary-container" />
            </button>

            <div className="w-12" />
          </div>
        ) : (
          // Initial state — two prominent buttons
          <div className="px-6 pb-12 space-y-3">
            <p className="text-white/60 text-xs text-center mb-4">
              Centre ton repas dans le cadre pour une meilleure analyse
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm font-semibold">Caméra</span>
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-sm font-semibold">Bibliothèque</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
