"use client";

import { useEffect, useState } from "react";
import { speak } from "@/lib/speech";
import { addStars, recordFlashcardSeen } from "@/lib/progress";
import { sfx } from "@/lib/sounds";
import Celebration from "@/components/Celebration";
import CardInfoChat from "@/components/CardInfoChat";

type Item = {
  word: string;
  emoji: string;
  tip?: string;
};

type FlashCardLoopProps = {
  items: Item[];
  prompt: string;
  topic?: string;
  onProgress?: (seen: number, total: number) => void;
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

export default function FlashCardLoop({ items, prompt, topic, onProgress }: FlashCardLoopProps) {
  const [index, setIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [celebrate, setCelebrate] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [index]);

  useEffect(() => {
    setSeenWords(new Set());
    setCelebrate(false);
  }, [items]);

  const item = items[index % items.length];
  const imageSrc = topic ? `/images/${topic}/${slugify(item.word)}.jpg` : null;
  const showImage = Boolean(imageSrc) && !imgFailed;

  const closeInfo = () => {
    setInfoOpen(false);
  };

  const next = () => {
    closeInfo();
    const nextIndex = (index + 1) % items.length;
    setIndex(nextIndex);
    speak(items[nextIndex].word);
    if (topic) recordFlashcardSeen(topic);
    const updated = new Set(seenWords);
    updated.add(items[nextIndex].word);
    setSeenWords(updated);
    onProgress?.(updated.size, items.length);
    if (updated.size === items.length && seenWords.size < items.length) {
      sfx.star();
      addStars(1);
      setCelebrate(true);
    }
  };

  const say = () => speak(item.word);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-2xl font-semibold text-center text-ink">{prompt}</p>
      <div className="relative w-full max-w-xs">
        <button
          onClick={say}
          className="relative flex h-56 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-4xl bg-surface shadow-soft active:scale-95 transition-transform"
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
          onClick={() => setInfoOpen(true)}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl shadow-md transition-transform active:scale-90"
          aria-label={`Saber más sobre ${item.word}`}
          title={`Saber más sobre ${item.word}`}
        >
          ℹ️
        </button>

        {infoOpen && (
          <CardInfoChat
            word={item.word}
            topic={topic}
            imageSrc={showImage ? imageSrc : null}
            onClose={closeInfo}
          />
        )}
      </div>
      <button
        onClick={next}
        className="rounded-full bg-mascot px-8 py-4 text-2xl font-bold text-white shadow-[0_6px_0_#E86A33] active:translate-y-1 active:shadow-none transition-all"
      >
        Siguiente →
      </button>
      <Celebration
        show={celebrate}
        text="¡Completaste el tema! ⭐"
        onDone={() => setCelebrate(false)}
      />
    </div>
  );
}