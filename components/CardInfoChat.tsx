"use client";

import { useEffect, useRef, useState } from "react";
import MicButton from "@/components/MicButton";
import ConsentModal from "@/components/ConsentModal";
import { speak, useSpeech } from "@/lib/speech";
import { useSettings } from "@/lib/settings";
import { logChat, markAlert, isLockedToday } from "@/lib/historyLog";

type ChatMsg = { role: "user" | "tino"; text: string };

type CardInfoChatProps = {
  word: string;
  topic?: string;
  imageSrc: string | null;
  onClose: () => void;
};

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

export default function CardInfoChat({
  word,
  topic,
  imageSrc,
  onClose,
}: CardInfoChatProps) {
  const { age, level, settings } = useSettings();
  const opener = `Quiero saber más sobre "${word}". Contame qué ves.`;

  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState<"mic" | null>(null);
  const [locked, setLocked] = useState(() => isLockedToday());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { status, startListening, stopListening, listeningText } = useSpeech(
    (text) => {
      if (text.trim()) send(text.trim());
    }
  );

  const listening = status === "listening";
  const unsupported = status === "unsupported";

  useEffect(() => {
    // Con la pausa de seguridad activa no se llama a la IA ni se habla: la
    // tarjeta se abre directamente en el aviso para el adulto.
    if (locked) return;
    void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, busy, listeningText]);

  async function start() {
    setBusy(true);
    try {
      let reply = "";
      const img =
        imageSrc && (await imageToDataUrl(imageSrc).catch(() => null));
      if (img) {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", text: opener, image: img }],
            age,
            level,
            topic,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        reply =
          payload.reply ??
          "¡Uy! No pude mirar esta imagen. ¿Intentamos otra vez?";
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: opener }],
            age,
            level,
            topic,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        reply =
          payload.reply ?? "¡Uy! No pude pensarlo bien. ¿Intentamos otra vez?";
      }
      const next = [
        { role: "user" as const, text: opener },
        { role: "tino" as const, text: reply },
      ];
      setMsgs(next);
      speak(reply);
      // Se registra también la apertura para que el historial de papás no
      // arranque con la respuesta de Tino colgando de la nada.
      logChat({ role: "user", text: opener });
      logChat({ role: "tino", text: reply });
    } catch {
      const reply = "¡Ups! Algo salió mal. ¡Otro intento!";
      setMsgs([{ role: "tino", text: reply }]);
      speak(reply);
      logChat({ role: "tino", text: reply });
    } finally {
      setBusy(false);
    }
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy || locked) return;
    const withOpener: ChatMsg[] =
      msgs.length > 0 ? msgs : [{ role: "user", text: opener }];
    const thread: ChatMsg[] = [...withOpener, { role: "user", text }];
    setMsgs(thread);
    setBusy(true);
    logChat({ role: "user", text });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: thread
            .slice(-7)
            .map((m) => ({
              role: m.role === "tino" ? "assistant" : "user",
              content: m.text,
            })),
          age,
          level,
          topic,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      const reply =
        payload.reply ?? "Uy, no pude responder. ¿Me pedís otra vez?";
      if (payload.safety?.risk === "danger") {
        if (markAlert()) setLocked(true);
      }
      setMsgs((prev) => [...prev, { role: "tino", text: reply }]);
      speak(reply);
      logChat({ role: "tino", text: reply, risk: payload.safety?.risk });
    } catch {
      const reply = "Algo falló. ¿Intentamos de nuevo?";
      setMsgs((prev) => [...prev, { role: "tino", text: reply }]);
      speak(reply);
      logChat({ role: "tino", text: reply });
    } finally {
      setBusy(false);
    }
  }

  const onMicClick = () => {
    if (locked) return;
    if (listening) {
      stopListening();
      return;
    }
    if (!settings.micConsent) {
      setConsent("mic");
      return;
    }
    startListening();
  };

  return (
    <div className="mt-2 w-full rounded-3xl border-2 border-lemon/50 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-bold text-ink">
          {imageSrc ? "Mirá… Tino te escucha 🔍" : "Tino te cuenta… 💬"}
        </p>
        <button
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-bold text-ink transition-transform active:scale-90"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mt-2 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1"
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "tino"
                ? "max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-cream px-3 py-2 text-base text-ink"
                : "max-w-[85%] self-end rounded-2xl rounded-br-sm bg-sky px-3 py-2 text-base text-white"
            }
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="self-start rounded-2xl bg-cream px-3 py-2 text-base text-soft">
            {imageSrc && msgs.length <= 1 ? "Tino mira la imagen… 🔍" : "Tino piensa…"}
          </div>
        )}
        {listeningText && (
          <div className="self-end rounded-2xl bg-sky/70 px-3 py-2 text-base text-white">
            {listeningText}…
          </div>
        )}
      </div>

      {locked ? (
        <p className="mt-3 rounded-2xl bg-cream px-3 py-2 text-base font-semibold text-soft">
          🛡️ Tino hizo una pausa. Pedile a un adulto que abra el Panel de papás.
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <MicButton listening={listening} onClick={onMicClick} size={52} />
          <input
            ref={inputRef}
            type="text"
            placeholder={unsupported ? "Escribe aquí" : "Escribe o usa el micrófono"}
            className="min-w-0 flex-1 rounded-full bg-surface px-4 py-2.5 text-base text-ink shadow-soft outline-none placeholder:text-soft"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                send(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
          <button
            onClick={() => {
              const input = inputRef.current;
              send(input?.value ?? "");
              if (input) input.value = "";
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mascot text-lg text-white shadow-[0_4px_0_#E86A33] transition-transform active:translate-y-0.5 active:shadow-none"
            aria-label="Enviar"
          >
            ➤
          </button>
        </div>
      )}

      {consent && <ConsentModal type={consent} onClose={() => setConsent(null)} />}
    </div>
  );
}