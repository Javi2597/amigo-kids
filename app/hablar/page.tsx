"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import MicButton from "@/components/MicButton";
import BackButton from "@/components/BackButton";
import PhotoButton from "@/components/PhotoButton";
import ConsentModal, { type ConsentType } from "@/components/ConsentModal";
import { speak, useSpeech } from "@/lib/speech";
import { useSettings } from "@/lib/settings";
import { useProgress } from "@/lib/progress";
import { suggestTopics } from "@/lib/suggest";
import { ALL_TOPIC_IDS, TOPIC_INFO } from "@/lib/content";
import { logChat, markAlert, isLockedToday } from "@/lib/historyLog";

type Msg = { role: "user" | "tino"; text: string; photo?: boolean };
type Reply = { reply: string; risk?: "sensitive" | "danger" };

export default function Hablar() {
  const { age, level, settings } = useSettings();
  const progress = useProgress();
  const suggestedId = suggestTopics(progress, ALL_TOPIC_IDS, 1)[0];
  const suggestedTopic = suggestedId
    ? TOPIC_INFO[suggestedId as keyof typeof TOPIC_INFO]?.title
    : undefined;
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "tino",
      text: settings.name
        ? `¡Hola, ${settings.name}! Soy Tino. Toca el micrófono y cuéntame ¿qué quieres hacer hoy?`
        : "¡Hola! Soy Tino el zorrito. Toca el micrófono y cuéntame ¿qué quieres hacer hoy?",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentType | null>(null);
  const [locked, setLocked] = useState<boolean>(() => isLockedToday());
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<{ data: string; mime: string } | null>(null);

  function handleReply(out: Reply) {
    setThinking(false);
    setMsgs((prev) => [...prev, { role: "tino", text: out.reply }]);
    logChat({ role: "tino", text: out.reply, risk: out.risk });
    if (out.risk === "danger") {
      if (markAlert()) setLocked(true);
    }
    scrollToBottom();
  }

  const pushUser = (text: string) => {
    if (locked) return;
    setMsgs((prev) => [...prev, { role: "user", text }]);
    logChat({ role: "user", text });
    setThinking(true);
    const hasImage = Boolean(imageRef.current);
    replyTo(text, age, level, imageRef.current, hasImage, suggestedTopic).then(handleReply);
  };

  const onPhoto = (photo: { data: string; mime: string }) => {
    if (!settings.photoConsent) {
      setConsent("photo");
      return;
    }
    imageRef.current = photo;
    setPreview(photo.data);
    setThinking(true);
    setMsgs((prev) => [...prev, { role: "user", text: "", photo: true }]);
    logChat({ role: "user", text: "📷 le mostró una foto a Tino" });
    replyTo("Miré mi foto.", age, level, photo, true, suggestedTopic).then(handleReply);
  };

  function clearPhotoContext() {
    imageRef.current = null;
    setPreview(null);
  }

  const { status, startListening, stopListening, listeningText } = useSpeech(
    (text) => {
      if (text.trim()) pushUser(text.trim());
    }
  );

  const listening = status === "listening";
  const unsupported = status === "unsupported";

  const trySend = (text: string) => {
    if (text.trim()) pushUser(text.trim());
  };

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-4 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-ink">🗣️ Hablar con Tino</h1>
        <div className="w-20" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className={listening ? "animate-bounce-soft" : ""}>
          <Avatar mood={listening ? "listening" : thinking ? "thinking" : "happy"} size={120} />
        </div>
        {listening && <p className="text-lg font-semibold text-coral">Te escucho…</p>}
        {unsupported && (
          <p className="text-base text-coral">
            Tu navegador no soporta voz por micrófono. Escribe abajo 👇
          </p>
        )}
      </div>

      {preview && (
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-surface p-3 shadow-soft">
          <img
            src={`data:image/jpeg;base64,${preview}`}
            alt="Tu foto"
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <p className="flex-1 text-base font-semibold text-soft">
            Tino está mirando tu foto… 📷
          </p>
          <button
            onClick={clearPhotoContext}
            className="rounded-full bg-cream px-4 py-2 text-base font-bold text-soft active:scale-95"
          >
            Quitar
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-3xl bg-surface p-4 shadow-soft"
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "tino"
                ? "max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-cream px-4 py-3 text-lg text-ink"
                : "max-w-[85%] self-end rounded-2xl rounded-br-sm bg-sky px-4 py-3 text-lg text-white"
            }
          >
            {m.photo ? "📷 le mostró una foto a Tino" : m.text}
          </div>
        ))}
        {thinking && (
          <div className="self-start rounded-2xl bg-cream px-4 py-2 text-lg text-soft">
            Tino piensa…
          </div>
        )}
        {listeningText && (
          <div className="self-end rounded-2xl bg-sky/70 px-4 py-2 text-lg text-white">
            {listeningText}…
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <MicButton
            listening={listening}
            onClick={
              listening
                ? stopListening
                : () => (settings.micConsent ? startListening() : setConsent("mic"))
            }
          />
          <div className="flex flex-col gap-2">
            <PhotoButton onImage={onPhoto} />
            <span className="text-center text-xs text-soft">
              Tu foto no se guarda
            </span>
          </div>
        </div>
        <input
          type="text"
          placeholder="Escribe aquí también si quieres"
          className="w-full max-w-sm rounded-full bg-surface px-5 py-3 text-lg text-ink shadow-soft outline-none placeholder:text-soft"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              trySend(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
        <p className="text-sm text-soft">
          Toca el micrófono, di una frase y suelta. Tino te responde con voz.
        </p>
      </div>

      {consent && <ConsentModal type={consent} onClose={() => setConsent(null)} />}

      {locked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/95 px-6">
          <div className="max-w-sm text-center">
            <div className="text-6xl">🛡️</div>
            <h2 className="mt-2 text-2xl font-bold text-ink">Tino hizo una pausa</h2>
            <p className="mt-2 text-lg text-soft">
              Algo importante tiene que ver un adulto. Abrí el panel de papás junto
              y hablen de esto. Tino los espera.
            </p>
            <Link
              href="/padres"
              className="mt-5 block rounded-full bg-mascot px-4 py-3 text-lg font-bold text-white active:scale-95"
            >
              Abrir el panel de papás
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

// Llama al chat de texto; si hay una foto activa, va por el endpoint de visión.
async function replyTo(
  text: string,
  age: number,
  level: number,
  image: { data: string; mime: string } | null,
  hasImage: boolean,
  topic?: string
): Promise<Reply> {
  try {
    const res = await fetch(hasImage ? "/api/vision" : "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        hasImage
          ? {
              messages: [
                ...(image ? [{ role: "user", text: "", image }] : []),
                { role: "user", text },
              ],
              age,
              level,
              topic,
            }
          : {
              messages: [{ role: "user", content: text }],
              age,
              level,
              topic,
            }
      ),
    });
    const data = await res.json();
    const reply =
      data.reply ?? "Uy, no pude responder. ¿Tocas mi botón para pedirme otra vez?";
    const risk = data.safety?.risk === "danger" ? "danger" : undefined;
    speak(reply);
    return { reply, risk };
  } catch {
    const reply = "Algo falló con mi voz. ¿Intentamos de nuevo?";
    speak(reply);
    return { reply };
  }
}