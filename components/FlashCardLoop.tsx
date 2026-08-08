"use client";

import { useEffect, useState } from "react";
import { speak } from "@/lib/speech";

type Item = {
  word: string;
  emoji: string;
  tip?: string;
};

type FlashCardLoopProps = {
  items: Item[];
  prompt: string;
  topic?: string;
};

function slugify(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function wordSize(word: string): string {
  if (word.length > 22) return "text-xl leading-tight";
  if (word.length > 12) return "text-2xl";
  return "text-3xl";
}

export default function FlashCardLoop({ items, prompt, topic }: FlashCardLoopProps) {
  const [index, setIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [index]);

  const item = items[index % items.length];
  const imageSrc = topic ? `/images/${topic}/${slugify(item.word)}.jpg` : null;
  const showImage = Boolean(imageSrc) && !imgFailed;

  const next = () => {
    const i = (index + 1) % items.length;
    setIndex(i);
    speak(items[i].word);
  };

  const say = () => speak(item.word);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-2xl font-semibold text-center text-ink">{prompt}</p>
      <button
        onClick={say}
        className="relative flex h-56 w-full max-w-xs flex-col items-center justify-center gap-2 overflow-hidden rounded-4xl bg-surface shadow-soft active:scale-95 transition-transform"
        aria-label={`Escuchar ${item.word}`}
      >
        {showImage ? (
          <img
            src={imageSrc as string}
            alt={item.word}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-center">
            <span className="text-8xl">{item.emoji}</span>
            <span className={`${wordSize(item.word)} font-bold text-ink`}>{item.word}</span>
          </span>
        )}
        {imageSrc && (
          <span
            className={`absolute bottom-0 left-0 right-0 px-3 py-2 text-center ${
              showImage ? "bg-ink/40 backdrop-blur-sm" : "hidden"
            }`}
          >
            <span className={`${wordSize(item.word)} font-bold text-white drop-shadow`}>
              {item.word}
            </span>
          </span>
        )}
        {item.tip && (
          <p className="w-full max-w-xs text-center text-base font-semibold text-soft">
            {item.tip}
          </p>
        )}
      </button>
      <button
        onClick={next}
        className="rounded-full bg-mascot px-8 py-4 text-2xl font-bold text-white shadow-[0_6px_0_#E86A33] active:translate-y-1 active:shadow-none transition-all"
      >
        Siguiente →
      </button>
    </div>
  );
}