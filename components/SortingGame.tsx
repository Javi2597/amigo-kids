"use client";

import { useState } from "react";
import type { SortPuzzle } from "@/lib/puzzles";
import { addStars } from "@/lib/progress";
import { sfx } from "@/lib/sounds";
import Celebration from "@/components/Celebration";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SortingGame({ puzzle }: { puzzle: SortPuzzle }) {
  const [queue, setQueue] = useState(() => shuffle(puzzle.items));
  const [wrong, setWrong] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const current = queue[0];
  const done = queue.length === 0;

  const reset = () => {
    setQueue(shuffle(puzzle.items));
    setCelebrate(false);
  };

  const sortInto = (bucket: number) => {
    if (!current) return;
    if (current.bucket === bucket) {
      sfx.correct();
      setQueue((q) => q.slice(1));
      setWrong(false);
      if (queue.length === 1) {
        sfx.fanfare();
        addStars(1);
        setCelebrate(true);
      }
    } else {
      sfx.wrong();
      setWrong(true);
      setTimeout(() => setWrong(false), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-2xl font-bold text-ink">
        {puzzle.emoji} {puzzle.title}
      </p>
      <p className="text-lg font-semibold text-soft">{puzzle.prompt}</p>

      <div
        className={`flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-3xl p-5 shadow-soft transition-colors ${
          wrong ? "bg-coral/20" : "bg-surface"
        }`}
      >
        {current ? (
          <>
            <span className="text-7xl">{current.emoji}</span>
            <span className="text-3xl font-bold text-ink">{current.label}</span>
            {wrong && <span className="text-lg font-bold text-coral">¡Intenta otra vez!</span>}
          </>
        ) : (
          <span className="text-2xl font-bold text-mint">¡Todo listo! 🎉</span>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {puzzle.buckets.map((b, i) => (
          <button
            key={b}
            onClick={() => sortInto(i)}
            disabled={done}
            className="min-h-tap rounded-3xl bg-sky px-4 py-5 text-xl font-bold text-white shadow-[0_5px_0_#3C97D6] transition-all active:translate-y-1 active:shadow-none"
          >
            {b}
          </button>
        ))}
      </div>

      {done && (
        <button
          onClick={reset}
          className="rounded-full bg-mascot px-6 py-3 text-xl font-bold text-white shadow-[0_4px_0_#E86A33] active:translate-y-1 active:shadow-none transition-all"
        >
          Otra vez
        </button>
      )}

      <Celebration
        show={celebrate}
        text="¡Clasificaste todo! ⭐"
        onDone={() => setCelebrate(false)}
      />
    </div>
  );
}
