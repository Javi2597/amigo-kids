"use client";

import { useEffect, useState } from "react";
import { speak } from "@/lib/speech";
import { addStars } from "@/lib/progress";
import { sfx } from "@/lib/sounds";
import Celebration from "@/components/Celebration";

type Routine = {
  id: string;
  label: string;
  emoji: string;
  cue: string;
};

export default function RoutineSteps({ steps }: { steps: Routine[] }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [celebrate, setCelebrate] = useState(false);

  const toggle = (step: Routine) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(step.id)) {
        next.delete(step.id);
      } else {
        next.add(step.id);
        speak(step.cue);
      }
      return next;
    });
  };

  const allDone = steps.length > 0 && done.size === steps.length;

  useEffect(() => {
    if (allDone && !celebrate) {
      sfx.fanfare();
      addStars(1);
      setCelebrate(true);
    }
    if (!allDone) setCelebrate(false);
  }, [allDone, celebrate]);

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      {steps.map((step) => {
        const isDone = done.has(step.id);
        return (
          <button
            key={step.id}
            onClick={() => toggle(step)}
            className={[
              "flex items-center gap-3 rounded-3xl p-4 text-left transition-all active:scale-95",
              "min-h-tap",
              isDone ? "bg-mint" : "bg-surface shadow-soft",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl",
                isDone ? "bg-white text-green-700" : "bg-cream",
              ].join(" ")}
            >
              {isDone ? "✓" : step.emoji}
            </span>
            <span
              className={[
                "text-xl font-semibold",
                isDone ? "text-white" : "text-ink",
              ].join(" ")}
            >
              {step.label}
            </span>
          </button>
        );
      })}
      {allDone && (
        <div className="rounded-3xl bg-lemon p-5 text-center text-2xl font-bold text-ink animate-bounce-soft">
          ¡Lo lograste, estrella! ⭐
        </div>
      )}
      <Celebration
        show={celebrate}
        text="¡Rutina completada! 🌟"
        onDone={() => setCelebrate(false)}
      />
    </div>
  );
}