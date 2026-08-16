"use client";

import { useEffect, useMemo, useState } from "react";
import FlashCardLoop from "@/components/FlashCardLoop";
import ProgressBar from "@/components/ProgressBar";
import { useSettings } from "@/lib/settings";
import { getTopicContent, LEVEL_INFO, TOPIC_INFO } from "@/lib/content";

export default function AdaptiveTopic({ topic }: { topic: string }) {
  const { level } = useSettings();
  const content = useMemo(() => getTopicContent(topic, level), [topic, level]);
  const [sessionSeen, setSessionSeen] = useState(0);
  const total = content.items.length;
  const pct = total > 0 ? (sessionSeen / total) * 100 : 0;

  useEffect(() => {
    setSessionSeen(0);
  }, [content]);

  return (
    <>
      <ProgressBar
        topic={topic}
        title={`Tu avance en ${
          TOPIC_INFO[topic as keyof typeof TOPIC_INFO]?.title ?? topic
        }`}
        value={pct}
      />
      <div className="h-4" />
      <FlashCardLoop
        items={content.items}
        prompt={content.prompt}
        topic={topic}
        onProgress={(seen) => setSessionSeen(seen)}
      />
      <p className="mt-3 text-center text-sm font-semibold text-soft">
        Nivel {level} · {LEVEL_INFO[level].label} ({LEVEL_INFO[level].range})
      </p>
    </>
  );
}