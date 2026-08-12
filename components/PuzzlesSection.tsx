"use client";

import { useSettings } from "@/lib/settings";
import { SEQUENCES, SORTING } from "@/lib/puzzles";
import SequencePuzzle from "@/components/SequencePuzzle";
import SortingGame from "@/components/SortingGame";

export default function PuzzlesSection() {
  const { level } = useSettings();
  if (level < 3) return null;
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-ink">🧩 Retos de lógica</h2>
      {SEQUENCES.map((p) => (
        <div key={p.id} className="rounded-4xl bg-surface p-6 shadow-soft">
          <SequencePuzzle puzzle={p} />
        </div>
      ))}
      {SORTING.map((p) => (
        <div key={p.id} className="rounded-4xl bg-surface p-6 shadow-soft">
          <SortingGame puzzle={p} />
        </div>
      ))}
    </div>
  );
}
