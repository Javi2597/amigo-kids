"use client";

import { ACHIEVEMENTS } from "@/lib/awards";
import { useProgress } from "@/lib/progress";

export default function AchievementsGrid() {
  const { achievements } = useProgress();
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACHIEVEMENTS.map((a) => {
        const earned = achievements.includes(a.id);
        return (
          <div
            key={a.id}
            className={[
              "flex flex-col items-center gap-1 rounded-3xl p-3 text-center",
              earned ? "bg-mint" : "bg-cream",
            ].join(" ")}
            title={a.desc}
          >
            <span className={`text-3xl ${earned ? "" : "opacity-35 grayscale"}`}>
              {a.emoji}
            </span>
            <span className="text-sm font-bold text-ink">{a.title}</span>
            {!earned && <span className="text-xs text-soft">🔒</span>}
          </div>
        );
      })}
    </div>
  );
}
