"use client";

import { useMemo, useState } from "react";
import FlashCardLoop from "@/components/FlashCardLoop";
import PhotoButton from "@/components/PhotoButton";
import ProgressBar from "@/components/ProgressBar";
import { useSettings } from "@/lib/settings";
import { getTopicContent, LEVEL_INFO, TOPIC_INFO } from "@/lib/content";
import { speak } from "@/lib/speech";

export default function AdaptiveTopic({ topic }: { topic: string }) {
  const { level, age } = useSettings();
  const content = useMemo(() => getTopicContent(topic, level), [topic, level]);
  const [analyzing, setAnalyzing] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onImage = async (photo: { data: string; mime: string }) => {
    setAnalyzing(true);
    setPreview(photo.data);
    setAnswer(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", text: "Miré mi foto.", image: photo }],
          age,
          level,
          topic,
        }),
      });
      const data = await res.json();
      const reply =
        data.reply ?? "¡Uy! No pude mirar tu foto. ¿Intentamos otra vez?";
      setAnswer(reply);
      speak(reply);
    } catch {
      const reply = "¡Ups! Algo salió mal con tu foto. ¡Otro intento!";
      setAnswer(reply);
      speak(reply);
    } finally {
      setAnalyzing(false);
      setPreview(null);
    }
  };

  return (
    <>
      <ProgressBar
        topic={topic}
        title={`Tu avance en ${
          TOPIC_INFO[topic as keyof typeof TOPIC_INFO]?.title ?? topic
        }`}
      />
      <div className="h-4" />
      <FlashCardLoop items={content.items} prompt={content.prompt} topic={topic} />
      <p className="mt-3 text-center text-sm font-semibold text-soft">
        Nivel {level} · {LEVEL_INFO[level].label} ({LEVEL_INFO[level].range})
      </p>

      <div className="mt-4 flex flex-col items-center gap-3 border-t border-cream pt-4">
        <PhotoButton onImage={onImage} disabled={analyzing} />
        <p className="text-center text-sm text-soft">
          Muéstrale una foto a Tino y te contará qué ve. Tu foto no se guarda.
        </p>
        {analyzing && (
          <p className="text-lg font-semibold text-coral">Tino mira tu foto… 📷</p>
        )}
        {preview && (
          <img
            src={`data:image/jpeg;base64,${preview}`}
            alt="Tu foto"
            className="h-20 w-20 rounded-2xl object-cover"
          />
        )}
        {answer && (
          <div className="rounded-3xl bg-cream px-5 py-3 text-center text-lg text-ink shadow-soft">
            {answer}
          </div>
        )}
      </div>
    </>
  );
}