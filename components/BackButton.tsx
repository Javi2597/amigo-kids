"use client";

import { useState } from "react";
import { speak } from "@/lib/speech";

export default function BackButton() {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={() => {
        setH(true);
        speak("Vamos a volver");
        window.history.back();
        setTimeout(() => setH(false), 600);
      }}
      className="tap-target flex items-center gap-1 rounded-full bg-surface px-4 py-2 text-lg font-bold text-ink shadow-soft transition-transform active:scale-95"
      aria-label="Volver"
    >
      <span className="text-xl">{h ? "👋" : "⬅️"}</span> Atrás
    </button>
  );
}