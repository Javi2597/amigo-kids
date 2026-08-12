"use client";

import { DAILY_MISSIONS } from "@/lib/missions";
import { missionsDoneToday } from "@/lib/progress";

export default function MissionsCard() {
  const done = missionsDoneToday();
  return (
    <div className="flex flex-col gap-2">
      {DAILY_MISSIONS.map((m) => {
        const isDone = done.includes(m.id);
        return (
          <div
            key={m.id}
            className={[
              "flex items-center gap-3 rounded-3xl p-3 transition-colors",
              isDone ? "bg-mint" : "bg-cream",
            ].join(" ")}
          >
            <span className="text-3xl">{m.emoji}</span>
            <div className="flex-1">
              <div className={`font-bold ${isDone ? "text-white" : "text-ink"}`}>
                {m.title}
              </div>
              <div className={`text-sm ${isDone ? "text-white/80" : "text-soft"}`}>
                {m.desc}
              </div>
            </div>
            {isDone && <span className="text-2xl">✅</span>}
          </div>
        );
      })}
    </div>
  );
}
