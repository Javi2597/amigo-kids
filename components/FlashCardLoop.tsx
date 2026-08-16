"use client";

import { useEffect, useState } from "react";
import { speak } from "@/lib/speech";
import { addStars, recordFlashcardSeen } from "@/lib/progress";
import { sfx } from "@/lib/sounds";
import Celebration from "@/components/Celebration";
import { useSettings } from "@/lib/settings";

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

async function imageToDataUrl(src: string): Promise<{ data: string; mime: string }> {
  const res = await fetch(src);
  if (!res.ok) throw new Error("imagen no disponible");
  const blob = await res.blob();
  const mime = blob.type || "image/jpeg";
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("no se pudo leer la imagen"));
    reader.readAsDataURL(blob);
  });
  const comma = dataUrl.indexOf(",");
  return { data: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl, mime };
}

export default function FlashCardLoop({ items, prompt, topic, onProgress }: FlashCardLoopProps) {
  const { age, level } = useSettings();
  const [index, setIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [celebrate, setCelebrate] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoText, setInfoText] = useState<string>("");
  const [infoBusy, setInfoBusy] = useState(false);
  const [infoMode, setInfoMode] = useState<"vision" | "chat">("vision");

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
    setInfoText("");
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

  const askTinoAboutImage = async () => {
    if (infoBusy) return;
    setInfoOpen(true);
    setInfoBusy(true);
    setInfoText("");
    try {
      const img =
        imageSrc && (await imageToDataUrl(imageSrc).catch(() => null));
      if (img) {
        setInfoMode("vision");
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                text: `Quiero saber más sobre "${item.word}". Contame qué ves.`,
                image: { data: img.data, mime: img.mime },
              },
            ],
            age,
            level,
            topic,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        const reply =
          payload.reply ?? "¡Uy! No pude mirar esta imagen. ¿Intentamos otra vez?";
        setInfoText(reply);
        speak(reply);
        return;
      }

      setInfoMode("chat");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `¿Qué me contás sobre "${item.word}"?`,
            },
          ],
          age,
          level,
          topic,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      const reply =
        payload.reply ?? "¡Uy! No pude pensarlo bien. ¿Intentamos otra vez?";
      setInfoText(reply);
      speak(reply);
    } catch {
      const reply = "¡Ups! Algo salió mal. ¡Otro intento!";
      setInfoText(reply);
      speak(reply);
    } finally {
      setInfoBusy(false);
    }
  };

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
          onClick={askTinoAboutImage}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl shadow-md transition-transform active:scale-90"
          aria-label={`Saber más sobre ${item.word}`}
          title={`Saber más sobre ${item.word}`}
        >
          ℹ️
        </button>

        {infoOpen && (
          <div className="mt-2 w-full rounded-3xl border-2 border-lemon/50 bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-bold text-ink">
                {infoMode === "vision"
                  ? "Tino mira la imagen… 🔍"
                  : "Tino te cuenta… 💬"}
              </p>
              <button
                onClick={closeInfo}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-bold text-ink transition-transform active:scale-90"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            {infoBusy ? (
              <p className="mt-2 text-base text-soft">Pensando…</p>
            ) : infoText ? (
              <>
                <p className="mt-2 text-base text-ink">{infoText}</p>
                <button
                  onClick={() => speak(infoText)}
                  className="mt-3 rounded-full bg-mascot px-4 py-2 text-sm font-bold text-white shadow-[0_4px_0_#E86A33] transition-transform active:translate-y-0.5 active:shadow-none"
                >
                  🔊 Escuchar
                </button>
              </>
            ) : (
              <p className="mt-2 text-base text-soft">No pude decir nada.</p>
            )}
          </div>
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