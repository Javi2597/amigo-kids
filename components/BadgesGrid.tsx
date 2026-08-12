"use client";

import { BADGES } from "@/lib/awards";
import { useProgress } from "@/lib/progress";

export default function BadgesGrid() {
  const { badges } = useProgress();
  return (
    <div className="grid grid-cols-3 gap-3">
      {BADGES.map((b) => {
        const earned = badges.includes(b.id);
        return (
          <div
            key={b.id}
            className={[
              "flex flex-col items-center gap-1 rounded-3xl p-3 text-center",
              earned ? "bg-lemon" : "bg-cream",
            ].join(" ")}
            title={b.desc}
          >
            <span className={`text-3xl ${earned ? "" : "opacity-35 grayscale"}`}>
              {b.emoji}
            </span>
            <span className="text-sm font-bold text-ink">{b.title}</span>
            {!earned && <span className="text-xs text-soft">🔒</span>}
          </div>
        );
      })}
    </div>
  );
}
