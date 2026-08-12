"use client";

import { useSettings } from "@/lib/settings";

const AVATAR_COLORS = ["bg-mascot", "bg-sky", "bg-mint", "bg-lavender", "bg-lemon"];

export default function ProfilePicker() {
  const { profiles, activeProfile, switchProfile } = useSettings();
  if (profiles.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {profiles.map((p, i) => {
        const isActive = p.id === activeProfile?.id;
        return (
          <button
            key={p.id}
            onClick={() => switchProfile(p.id)}
            className={[
              "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 transition-all active:scale-95",
              isActive
                ? "bg-surface shadow-soft ring-2 ring-mascot"
                : "bg-surface/70 shadow-soft",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white",
                AVATAR_COLORS[i % AVATAR_COLORS.length],
              ].join(" ")}
            >
              {(p.name || "P").charAt(0).toUpperCase()}
            </span>
            <span className={`text-base font-bold ${isActive ? "text-ink" : "text-soft"}`}>
              {p.name} · {p.age}
            </span>
          </button>
        );
      })}
    </div>
  );
}
