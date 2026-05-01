"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Zap, ImageIcon } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

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

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsStreaming(false);
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
      const formData = new FormData();
      formData.append("image", blob, "meal.jpg");

      stopCamera();
      router.push("/analyzing");

      try {
        const res = await fetch("/api/analyze-meal", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          router.replace(`/meal/${data.id}`);
        } else {
          router.replace("/scan?error=" + encodeURIComponent(data.error || "Erreur"));
        }
      } catch {
        router.replace("/scan?error=network");
      }
    }, "image/jpeg", 0.85);
  }, [isCapturing, router, stopCamera]);

  const handleGallery = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      stopCamera();
      router.push("/analyzing");
      const formData = new FormData();
      formData.append("image", file, file.name);
      try {
        const res = await fetch("/api/analyze-meal", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) router.replace(`/meal/${data.id}`);
        else router.replace("/scan?error=" + encodeURIComponent(data.error || "Erreur"));
      } catch {
        router.replace("/scan?error=network");
      }
    };
    input.click();
  }, [router, stopCamera]);

  return (
    <div className="relative flex flex-col min-h-screen bg-black overflow-hidden">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

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
        <p className="text-white/70 text-sm text-center font-medium pb-4">
          Centre ton repas dans le cadre
        </p>

        {/* Bottom controls */}
        <div className="flex items-center justify-around px-8 pb-12">
          <button
            onClick={handleGallery}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            aria-label="Galerie"
          >
            <ImageIcon className="w-5 h-5 text-white" />
          </button>

          {!isStreaming ? (
            <button
              onClick={startCamera}
              className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center shadow-lg transition-all active:scale-95"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          ) : (
            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full bg-primary-container" />
            </button>
          )}

          <button
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            aria-label="Flash"
          >
            <Zap className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
