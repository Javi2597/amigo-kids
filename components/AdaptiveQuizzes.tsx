"use client";

import Link from "next/link";
import MiniQuiz from "@/components/MiniQuiz";
import { useSettings } from "@/lib/settings";
import { getLevelQuizzes, LEVEL_INFO, ALL_TOPIC_IDS, TOPIC_INFO } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import { weakTopics } from "@/lib/suggest";

export default function AdaptiveQuizzes() {
  const { level } = useSettings();
  const quizzes = getLevelQuizzes(level);
  const state = useProgress();
  const weak = weakTopics(state, ALL_TOPIC_IDS);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-center text-base font-semibold text-soft">
          Nivel {level} · {LEVEL_INFO[level].label} ({LEVEL_INFO[level].range})
        </p>
        <p className="rounded-full bg-lemon px-3 py-1 text-base font-bold text-ink">
          ⭐ {state.stars}
        </p>
      </div>
      {weak.length > 0 && (
        <p className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-cream px-4 py-2 text-base font-semibold text-ink">
          💪 Tino sugiere repasar:{" "}
          {weak.map((id) => (
            <Link
              key={id}
              href={`/aprender/${id}`}
              className="rounded-full bg-lemon px-3 py-1 font-bold text-ink active:scale-95"
            >
              {TOPIC_INFO[id as keyof typeof TOPIC_INFO]?.emoji}{" "}
              {TOPIC_INFO[id as keyof typeof TOPIC_INFO]?.title}
            </Link>
          ))}
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {quizzes.map((q, i) => (
          <MiniQuiz key={i} {...q} topic="juego" />
        ))}
      </div>
    </>
  );
}
