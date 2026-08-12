"use client";

import { useSettings } from "@/lib/settings";
import ChallengeQuiz from "@/components/ChallengeQuiz";

export default function ChallengeSection() {
  const { level } = useSettings();
  if (level !== 4) return null;
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-ink">⚡ Desafíos</h2>
      <div className="rounded-4xl bg-surface p-6 shadow-soft">
        <ChallengeQuiz />
      </div>
    </div>
  );
}
