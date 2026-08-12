"use client";

import { useState } from "react";
import type { SeqPuzzle } from "@/lib/puzzles";
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

export default function SequencePuzzle({ puzzle }: { puzzle: SeqPuzzle }) {
  const [pool, setPool] = useState<string[]>(() => shuffle(puzzle.items));
  const [placed, setPlaced] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState(false);

  const reset = () => {
    setPool(shuffle(puzzle.items));
    setPlaced([]);
    setCelebrate(false);
  };

  const pick = (item: string) => {
    const expected = puzzle.items[placed.length];
    if (item === expected) {
      sfx.correct();
      const nextPlaced = [...placed, item];
      setPlaced(nextPlaced);
      setPool((p) => p.filter((x) => x !== item));
      if (nextPlaced.length === puzzle.items.length) {
        sfx.fanfare();
        addStars(1);
        setCelebrate(true);
      }
    } else {
      sfx.wrong();
    }
  };

  const done = placed.length === puzzle.items.length;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-2xl font-bold text-ink">
        {puzzle.emoji} {puzzle.title}
      </p>
      <p className="text-lg font-semibold text-soft">
        Toca en el orden correcto 👇
      </p>

      <div className="flex min-h-24 w-full flex-wrap items-center justify-center gap-2 rounded-3xl bg-cream p-4">
        {placed.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-3xl"
          >
            {item}
          </span>
        ))}
        {!done && <span className="text-lg font-bold text-soft">…</span>}
      </div>

      <div className="flex min-h-24 w-full flex-wrap items-center justify-center gap-2 rounded-3xl bg-surface p-4 shadow-soft">
        {pool.map((item) => (
          <button
            key={item}
            onClick={() => pick(item)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky text-3xl transition-all active:scale-90"
          >
            {item}
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
        text="¡Secuencia perfecta! ⭐"
        onDone={() => setCelebrate(false)}
      />
    </div>
  );
}
