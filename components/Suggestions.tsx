"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { ALL_TOPIC_IDS, TOPIC_INFO } from "@/lib/content";
import { suggestTopics } from "@/lib/suggest";

export default function Suggestions() {
  const state = useProgress();
  const { level } = useSettings();
  const topics = suggestTopics(state, ALL_TOPIC_IDS, 3);

  return (
    <div className="rounded-4xl bg-surface p-5 shadow-soft">
      <h2 className="mb-3 text-xl font-bold text-ink">
        🦊 Tino sugiere {level < 3 ? "explorar" : "repasar"}
      </h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((id) => (
          <Link
            key={id}
            href={`/aprender/${id}`}
            className="rounded-full bg-cream px-4 py-2 text-lg font-bold text-ink transition-all active:scale-95"
          >
            {TOPIC_INFO[id as keyof typeof TOPIC_INFO]?.emoji}{" "}
            {TOPIC_INFO[id as keyof typeof TOPIC_INFO]?.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
