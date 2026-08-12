"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Story } from "@/lib/stories";
import { completeStory } from "@/lib/progress";
import { sfx } from "@/lib/sounds";
import Celebration from "@/components/Celebration";

export default function StoryPlayer({ story }: { story: Story }) {
  const [nodeId, setNodeId] = useState(story.start);
  const [celebrate, setCelebrate] = useState(false);
  const celebratedRef = useRef(false);

  const node = story.nodes[nodeId];
  const isEnd = !node || node.choices.length === 0;

  useEffect(() => {
    setNodeId(story.start);
    celebratedRef.current = false;
    setCelebrate(false);
  }, [story.id, story.start]);

  useEffect(() => {
    if (isEnd && !celebratedRef.current) {
      celebratedRef.current = true;
      sfx.fanfare();
      completeStory(story.id);
      setCelebrate(true);
    }
    if (!isEnd) celebratedRef.current = false;
  }, [isEnd, story.id]);

  if (!node) return null;

  const choose = (next: string) => {
    sfx.star();
    setNodeId(next);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full rounded-3xl bg-cream p-5 text-center">
        <p className="text-5xl">{story.emoji}</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">{story.title}</h2>
      </div>

      <div className="w-full rounded-3xl bg-white p-5 text-xl font-semibold text-ink shadow-soft">
        {node.text}
      </div>

      {!isEnd ? (
        <div className="flex w-full flex-col gap-3">
          {node.choices.map((c) => (
            <button
              key={c.next}
              onClick={() => choose(c.next)}
              className="min-h-tap w-full rounded-full bg-mascot px-6 py-4 text-xl font-bold text-white shadow-[0_5px_0_#E86A33] transition-all active:translate-y-1 active:shadow-none"
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <p className="rounded-3xl bg-lemon p-4 text-center text-2xl font-bold text-ink">
            🎉 ¡Aventura terminada!
          </p>
          <button
            onClick={() => {
              celebratedRef.current = false;
              setCelebrate(false);
              setNodeId(story.start);
            }}
            className="min-h-tap w-full rounded-full bg-mascot px-6 py-4 text-xl font-bold text-white shadow-[0_5px_0_#E86A33] transition-all active:translate-y-1 active:shadow-none"
          >
            Jugar otra vez
          </button>
          <Link
            href="/historias"
            className="min-h-tap w-full rounded-full bg-cream px-6 py-4 text-center text-xl font-bold text-ink active:scale-95"
          >
            Volver a las historias
          </Link>
        </div>
      )}

      <Celebration
        show={celebrate}
        text="¡Historia completada! 📖"
        onDone={() => setCelebrate(false)}
      />
    </div>
  );
}
