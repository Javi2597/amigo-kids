"use client";

import { useMemo } from "react";
import { useSettings } from "@/lib/settings";
import { readProfileStars, useProgress } from "@/lib/progress";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { profiles, activeProfile } = useSettings();
  useProgress();

  const rows = useMemo(() => {
    return profiles
      .map((p) => ({ profile: p, stars: readProfileStars(p.id) }))
      .sort((a, b) => b.stars - a.stars);
  }, [profiles]);

  if (profiles.length < 2) return null;

  return (
    <div className="flex flex-col gap-2">
      {rows.map(({ profile, stars }, i) => {
        const isActive = profile.id === activeProfile?.id;
        return (
          <div
            key={profile.id}
            className={[
              "flex items-center gap-3 rounded-3xl p-3",
              isActive ? "bg-lemon" : "bg-cream",
            ].join(" ")}
          >
            <span className="w-8 text-center text-2xl">{MEDALS[i] ?? "🎈"}</span>
            <span
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white",
                ["bg-mascot", "bg-sky", "bg-mint", "bg-lavender", "bg-coral"][i % 5],
              ].join(" ")}
            >
              {(profile.name || "P").charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 text-lg font-bold text-ink">
              {profile.name}
              {isActive && " (eres tú)"}
            </span>
            <span className="text-xl font-bold text-ink">⭐ {stars}</span>
          </div>
        );
      })}
      <p className="mt-1 text-center text-sm text-soft">
        Es solo para divertirse en familia, sin presiones 💛
      </p>
    </div>
  );
}
