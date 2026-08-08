"use client";

import MiniQuiz from "@/components/MiniQuiz";
import { useSettings } from "@/lib/settings";
import { getLevelQuizzes, LEVEL_INFO } from "@/lib/content";

export default function AdaptiveQuizzes() {
  const { level } = useSettings();
  const quizzes = getLevelQuizzes(level);

  return (
    <>
      <p className="text-center text-base font-semibold text-soft">
        Nivel {level} · {LEVEL_INFO[level].label} ({LEVEL_INFO[level].range})
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {quizzes.map((q, i) => (
          <MiniQuiz key={i} {...q} />
        ))}
      </div>
    </>
  );
}