"use client";

import { useRef, useState } from "react";

export type PhotoData = { data: string; mime: string };

type PhotoButtonProps = {
  onImage: (photo: PhotoData) => void;
  disabled?: boolean;
  size?: number;
};

const MAX_EDGE = 1200;
const JPEG_QUALITY = 0.8;

/**
 * Botón de cámara/galería. Comprime la imagen en canvas (≤1200px, JPEG ~0.8)
 * para no exceder límites del servidor y cuidar los datos del menor.
 * Solo devuelve la miniatura base64; no guarda en disco ni en el historial.
 */
export default function PhotoButton({ onImage, disabled, size = 72 }: PhotoButtonProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file: File | undefined | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const photo = await compressImage(file);
      onImage(photo);
    } catch {
      // silencioso: el niño simplemente no envió nada
    } finally {
      setBusy(false);
      const wasCamera = cameraRef.current?.files;
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
        aria-label="Tomar foto con la cámara"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
        aria-label="Subir una foto desde el dispositivo"
      />
      <button
        onClick={() => cameraRef.current?.click()}
        disabled={disabled !== undefined || busy}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-sky shadow-[0_5px_0_#3BA7D6] transition-transform active:scale-95 active:shadow-none"
        aria-label="Enviar foto"
      >
        <CameraSvg />
      </button>
      <button
        onClick={() => galleryRef.current?.click()}
        disabled={disabled !== undefined || busy}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lavender shadow-[0_5px_0_#7A6BD1] transition-transform active:scale-95 active:shadow-none"
        aria-label="Subir foto de la galería"
      >
        <GallerySvg />
      </button>
    </div>
  );
}

async function compressImage(file: File): Promise<PhotoData> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = dataUrl.split(",")[1] ?? "";
  return { data: base64, mime: "image/jpeg" };
}

function CameraSvg() {
  return (
    <svg
      width="34%"
      height="34%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function GallerySvg() {
  return (
    <svg
      width="34%"
      height="34%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}