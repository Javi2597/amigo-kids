"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings";
import MissionsCard from "@/components/MissionsCard";
import BadgesGrid from "@/components/BadgesGrid";
import AchievementsGrid from "@/components/AchievementsGrid";
import Leaderboard from "@/components/Leaderboard";

export default function KidsHub() {
  const { level, settings, profiles } = useSettings();
  if (level < 3) return null;
  const showLeaderboard = level === 4 && settings.leaderboardOn && profiles.length >= 2;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-xl font-bold text-ink">🎯 Misiones de hoy</h2>
        <MissionsCard />
      </section>
      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-xl font-bold text-ink">🏅 Mis medallas</h2>
        <BadgesGrid />
      </section>

      {level === 4 && (
        <section className="rounded-4xl bg-surface p-5 shadow-soft">
          <h2 className="mb-3 text-xl font-bold text-ink">🏆 Mis logros</h2>
          <AchievementsGrid />
        </section>
      )}

      {showLeaderboard && (
        <section className="rounded-4xl bg-surface p-5 shadow-soft">
          <h2 className="mb-3 text-xl font-bold text-ink">👨‍👩‍👧 Tabla de la familia</h2>
          <Leaderboard />
        </section>
      )}

      {level === 4 && (
        <Link
          href="/proyectos"
          className="flex items-center gap-4 rounded-4xl bg-surface p-5 shadow-soft transition-all active:scale-95"
        >
          <span className="text-6xl">🔬</span>
          <span className="text-2xl font-bold text-ink">Proyectos</span>
          <span className="ml-auto text-3xl text-soft">→</span>
        </Link>
      )}
    </div>
  );
}
