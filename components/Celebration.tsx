"use client";

import { useEffect } from "react";
import { sfx } from "@/lib/sounds";

const STARS = ["⭐", "🌟", "✨", "💛", "⭐", "🌟", "✨", "🧡"];

export default function Celebration({
  show,
  text = "¡Muy bien!",
  onDone,
}: {
  show: boolean;
  text?: string;
  onDone?: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    sfx.fanfare();
    const t = setTimeout(() => onDone?.(), 2200);
    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-transparent">
      {STARS.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="celebration-star absolute"
          style={{
            left: `${8 + ((i * 13.5) % 86)}%`,
            top: `${18 + ((i * 11) % 58)}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {s}
        </span>
      ))}
      <div className="celebration-pop rounded-full bg-white px-8 py-4 text-3xl font-bold text-ink">
        {text}
      </div>
    </div>
  );
}
