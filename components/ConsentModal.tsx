"use client";

import Link from "next/link";

export type ConsentType = "mic" | "photo";

const COPY: Record<ConsentType, { title: string; text: string }> = {
  mic: {
    title: "¿Pedir permiso? 🎤",
    text:
      "Para escucharte con el micrófono, un adulto debe dar permiso " +
      "en el Panel de papás. Ahí también puede explicarte cómo funciona.",
  },
  photo: {
    title: "¿Fotos? Primero permiso 📷",
    text:
      "Para que Tino mire tus fotos, un adulto debe dar permiso en el " +
      "Panel de papás y juntos decidir qué fotos compartir.",
  },
};

export default function ConsentModal({
  type,
  onClose,
}: {
  type: ConsentType;
  onClose: () => void;
}) {
  const copy = COPY[type];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
    >
      <div className="w-full max-w-sm rounded-4xl bg-surface p-6 text-center shadow-soft">
        <div className="text-6xl">🛡️</div>
        <h2 className="mt-2 text-xl font-bold text-ink">{copy.title}</h2>
        <p className="mt-2 text-base text-soft">{copy.text}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/padres"
            className="rounded-full bg-mascot px-4 py-3 text-lg font-bold text-white active:scale-95"
          >
            Abrir el panel de papás
          </Link>
          <button
            onClick={onClose}
            className="rounded-full bg-cream px-4 py-2 text-base font-bold text-soft active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}