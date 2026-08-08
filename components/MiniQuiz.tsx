"use client";

import { useState } from "react";
import { speak } from "@/lib/speech";

type QuizProps = {
  question: string;
  options: string[];
  answer: string;
  emoji: string;
};

export default function MiniQuiz({ question, options, answer, emoji }: QuizProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === answer;

  const choose = (opt: string) => {
    setPicked(opt);
    if (opt === answer) {
      speak("¡Muy bien! ¡Correcto!");
    } else {
      speak("Casi. Inténtalo otra vez.");
    }
  };

  const reset = () => setPicked(null);

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-3xl font-bold text-ink">{emoji}</p>
      <p className="text-2xl font-semibold text-ink text-center">{question}</p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {options.map((opt) => {
          const isPicked = picked === opt;
          const isAns = opt === answer;
          const isCorrect = opt === answer;
          return (
            <button
              key={opt}
              onClick={() => !picked && choose(opt)}
              disabled={picked !== null}
              className={[
                "min-h-tap rounded-2xl px-4 py-4 text-2xl font-bold transition-all",
                "active:scale-95 text-white",
                isPicked && isCorrect
                  ? "bg-mint shadow-[0_5px_0_#53B887]"
                  : isPicked && !isCorrect
                  ? "bg-soft shadow-[0_5px_0_#9b9bb0]"
                  : !picked
                  ? "bg-sky shadow-[0_5px_0_#3C97D6] hover:brightness-105"
                  : "bg-soft shadow-[0_5px_0_#9b9bb0]",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked && (
        <button
          onClick={reset}
          className="rounded-full bg-mascot px-6 py-2 text-xl font-bold text-white shadow-[0_4px_0_#E86A33] active:translate-y-1 active:shadow-none transition-all"
        >
          Otra vez
        </button>
      )}
    </div>
  );
}