"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Avatar from "@/components/Avatar";
import MicButton from "@/components/MicButton";
import { speak, useSpeech } from "@/lib/speech";
import { useSettings } from "@/lib/settings";
import { enqueue, isOnline, registerOnlineFlush, type QueuedMessage } from "@/lib/offlineQueue";

type Msg = { role: "user" | "tino"; text: string };

const MAX_CONTEXT = 12;

export default function FloatingTino() {
  const pathname = usePathname();
  const { age, level, settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pushUser = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setMsgs((prev) => [...prev, { role: "user", text: clean }]);
      if (!isOnline()) {
        enqueue({ text: clean, age, level });
        setMsgs((prev) => [
          ...prev,
          {
            role: "tino",
            text: "Estamos sin conexión 🌫️ Te guardo el mensaje y lo mando apenas vuelva la señal.",
          },
        ]);
        scrollToBottom();
        return;
      }
      setThinking(true);
      replyTo(
        clean,
        msgs.slice(-MAX_CONTEXT),
        age,
        level
      ).then((reply) => {
        setThinking(false);
        setMsgs((prev) => [...prev, { role: "tino", text: reply }]);
        speak(reply);
        scrollToBottom();
      });
    },
    [msgs, age, level]
  );

  // Reenvía los mensajes guardados cuando vuelve la red.
  const pushUserRef = useRef(pushUser);
  pushUserRef.current = pushUser;
  useEffect(() => {
    return registerOnlineFlush((msg: QueuedMessage) => pushUserRef.current(msg.text));
  }, []);

  const { status, startListening, stopListening, listeningText } = useSpeech(
    (text) => pushUser(text)
  );

  const listening = status === "listening";
  const unsupported = status === "unsupported";

  const openChat = () => {
    setOpen(true);
    setMsgs((prev) =>
      prev.length === 0
        ? [
            {
              role: "tino",
              text: settings.name
                ? `¡Hola, ${settings.name}! Soy Tino. ¿Qué quieres hacer hoy?`
                : "¡Hola! Soy Tino el zorrito. ¿Qué quieres hacer hoy?",
            },
          ]
        : prev
    );
  };

  const closeChat = () => {
    setOpen(false);
    stopListening();
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [msgs, open, thinking, listeningText]);

  if (pathname?.startsWith("/hablar")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <>
          <button
            aria-label="Cerrar chat"
            onClick={closeChat}
            className="fixed inset-0 z-40 bg-transparent"
          />
          <div className="relative z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-4xl bg-surface shadow-2xl ring-1 ring-mascot/20">
            <div className="flex items-center justify-between gap-2 border-b border-cream px-4 py-3">
              <div className="flex items-center gap-2">
                {thinking ? (
                  <Avatar mood="thinking" size={44} />
                ) : (
                  <Avatar mood={listening ? "listening" : "happy"} size={44} />
                )}
                <div>
                  <p className="font-bold text-ink">Tino</p>
                  <p className="text-sm text-soft">
                    {listening ? "Te escucho…" : "Mini-chat"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeChat}
                aria-label="Cerrar"
                className="tap-target flex h-10 w-10 items-center justify-center rounded-full text-xl text-soft transition-colors hover:bg-cream"
              >
                ✕
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex max-h-56 flex-col gap-2 overflow-y-auto px-3 py-3"
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
              {thinking && (
                <div className="self-start rounded-2xl bg-cream px-3 py-1.5 text-base text-soft">
                  Tino piensa…
                </div>
              )}
              {listeningText && (
                <div className="self-end rounded-2xl bg-sky/70 px-3 py-1.5 text-base text-white">
                  {listeningText}…
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-cream p-3">
              <MicButton
                listening={listening}
                size={56}
                onClick={listening ? stopListening : startListening}
              />
              <input
                type="text"
                placeholder={unsupported ? "Escribe aquí" : "Toca el micrófono o escribe…"}
                className="w-full rounded-full bg-cream px-4 py-2.5 text-base text-ink outline-none placeholder:text-soft"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    pushUser(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>
        </>
      )}

      <button
        onClick={open ? closeChat : openChat}
        aria-label={open ? "Cerrar chat con Tino" : "Hablar con Tino"}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-2xl ring-2 ring-mascot transition-transform active:scale-90 hover:brightness-105"
      >
        <span
          className="absolute inset-0 rounded-full bg-mascot/30"
          style={{ animation: "bounce-soft 2.4s ease-in-out infinite" }}
        />
        <Avatar mood="happy" size={52} />
      </button>
    </div>
  );
}

async function replyTo(
  text: string,
  context: Msg[],
  age: number,
  level: number
): Promise<string> {
  try {
    const history: { role: string; content: string }[] = context.map((m) => ({
      role: m.role === "tino" ? "assistant" : "user",
      content: m.text,
    }));
    history.push({ role: "user", content: text });

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, age, level }),
    });
    const data = await res.json();
    return data.reply ?? "Uy, no pude responder. ¿Tocas mi botón para pedirme otra vez?";
  } catch {
    return "Algo falló con mi voz. ¿Intentamos de nuevo?";
  }
}