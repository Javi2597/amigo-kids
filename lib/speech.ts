"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechStatus = "idle" | "listening" | "speaking" | "unsupported";

type Prefs = { voiceOn: boolean; naturalVoice: boolean };

type NativeSpeechRecognition = {
  available: () => Promise<{ available: boolean }>;
  requestPermissions?: () => Promise<{ accepted: boolean }>;
  start: (opts: {
    language?: string;
    maxResults?: number;
    partialResults?: boolean;
    popup?: boolean;
  }) => Promise<void>;
  stop: () => Promise<void>;
  addListener: (ev: string, cb: (data: any) => void) => {
    remove: () => void;
  };
};

/** ¿Estamos dentro de un shell nativo de Capacitor (iOS/Android)? */
function isNative(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as any).Capacitor?.isNativePlatform?.())
  );
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem("tino-parent");
    const s = raw ? JSON.parse(raw) : {};
    return {
      voiceOn: s.voiceOn !== false,
      naturalVoice: s.naturalVoice === true,
    };
  } catch {
    return { voiceOn: true, naturalVoice: false };
  }
}

let audioEl: HTMLAudioElement | null = null;
let audioToken = 0;

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audioEl) audioEl = new Audio();
  return audioEl;
}

export function stopAudio() {
  audioToken++;
  const el = ensureAudio();
  if (el) {
    el.pause();
    el.removeAttribute("src");
    el.load();
  }
}

export function speak(text: string, lang = "es-ES") {
  const prefs = readPrefs();
  if (!prefs.voiceOn) return;
  if (typeof window === "undefined") return;

  // Siempre detiene lo anterior (audio natural + síntesis).
  stopAudio();
  window.speechSynthesis.cancel();

  const clean = String(text).trim();
  if (!clean) return;

  if (prefs.naturalVoice && navigator.onLine) {
    void speakNatural(clean, lang, ++audioToken);
  } else {
    speakSynthesis(clean, lang);
  }
}

async function speakNatural(text: string, lang: string, token: number) {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang }),
    });
    if (!res.ok) throw new Error(`TTS ${res.status}`);
    if (token !== audioToken) return; // llegó una frase más nueva

    const blob = await res.blob();
    const el = ensureAudio();
    if (!el || token !== audioToken) return;
    const url = URL.createObjectURL(blob);
    el.src = url;
    await el.play();
    el.onended = () => URL.revokeObjectURL(url);
  } catch {
    if (token === audioToken) speakSynthesis(text, lang);
  }
}

function speakSynthesis(text: string, lang: string) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.92;
  u.pitch = 1.08;
  const v = pickSpanishVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

function pickSpanishVoice(): SpeechSynthesisVoice | undefined {
  if (!("speechSynthesis" in window)) return undefined;
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }
  return pickBestSpanishVoice(window.speechSynthesis.getVoices());
}

function pickBestSpanishVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;
  const es = voices.filter((v) => v.lang.toLowerCase().startsWith("es"));
  if (es.length === 0) return undefined;
  const goodNames = ["google", "microsoft", "natural", "zira", "helena", "sabina", "laura"];
  return (
    es.find((v) => goodNames.some((n) => v.name.toLowerCase().includes(n))) ??
    es[0]
  );
}

export function useSpeech(onResult: (text: string) => void) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [listeningText, setListeningText] = useState("");
  const recRef = useRef<any>(null);
  const nativeRef = useRef<NativeSpeechRecognition | null>(null);
  const capListenersRef = useRef<{ remove: () => void }[]>([]);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const stopSpeaking = useCallback(() => {
    stopAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const cleanupNative = useCallback(() => {
    capListenersRef.current.forEach((l) => {
      try {
        l.remove();
      } catch {}
    });
    capListenersRef.current = [];
  }, []);

  // Path nativo (Capacitor): plugin @capacitor-community/speech-recognition.
  const startNative = useCallback(async () => {
    let mod: any;
    try {
      mod = await import("@capacitor-community/speech-recognition");
    } catch {
      setStatus("unsupported");
      return;
    }
    const plugin: NativeSpeechRecognition = mod.SpeechRecognition;
    nativeRef.current = plugin;

    try {
      const avail = await plugin.available();
      if (!avail.available) {
        setStatus("unsupported");
        return;
      }
      if (plugin.requestPermissions) {
        const perms = (await plugin.requestPermissions()) as unknown as Record<
          string,
          string
        > | undefined;
        const anyValue = perms
          ? Object.values(perms).filter((v) => typeof v === "string")
          : [];
        // Fallo solo si alguna clave pide "denied" (ausente Android). Ignorar "prompt".
        if (anyValue.length > 0 && anyValue.some((v) => v === "denied")) {
          setStatus("unsupported");
          return;
        }
      }
    } catch {
      setStatus("unsupported");
      return;
    }

    cleanupNative();
    capListenersRef.current.push(
      plugin.addListener("onPartialResults", (data: any) => {
        const txt = firstTranscript(data?.value);
        if (txt) setListeningText(txt);
      }),
      plugin.addListener("onResult", (data: any) => {
        const txt = firstTranscript(data?.value);
        if (txt) {
          onResultRef.current(txt);
          setListeningText("");
        }
      }),
      plugin.addListener(
        "onEnd",
        () => {
          setStatus("idle");
          setListeningText("");
        },
      ),
      plugin.addListener(
        "onError",
        () => {
          setStatus("idle");
          setListeningText("");
          cleanupNative();
        },
      )
    );

    try {
      await plugin.start({
        language: "es-ES",
        maxResults: 2,
        partialResults: true,
        popup: false,
      });
      setStatus("listening");
    } catch {
      setStatus("unsupported");
      cleanupNative();
    }
  }, [cleanupNative]);

  // Path web (PWA/browser): Web Speech API.
  const startWeb = useCallback(
    (SR: any) => {
      stopSpeaking();
      const rec = new SR();
      rec.lang = "es-ES";
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onstart = () => setStatus("listening");
      rec.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) {
            onResultRef.current(r[0].transcript);
            setListeningText("");
            return;
          }
          interim += r[0].transcript;
        }
        setListeningText(interim);
      };
      rec.onerror = () => setStatus("idle");
      rec.onend = () => {
        setStatus("idle");
        setListeningText("");
      };

      recRef.current = rec;
      try {
        rec.start();
      } catch {
        setStatus("idle");
      }
    },
    [stopSpeaking]
  );

  const startListening = useCallback(() => {
    stopSpeaking();

    if (isNative()) {
      void startNative();
      return;
    }

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setStatus("unsupported");
      return;
    }
    startWeb(SR);
  }, [startWeb, startNative, stopSpeaking]);

  const stopListening = useCallback(() => {
    if (isNative()) {
      void nativeRef.current?.stop().catch(() => {});
      cleanupNative();
      setStatus("idle");
      setListeningText("");
      return;
    }
    recRef.current?.stop();
  }, [cleanupNative]);

  useEffect(() => {
    return () => {
      stopAudio();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      recRef.current?.abort?.();
      cleanupNative();
    };
  }, [cleanupNative]);

  return { status, listeningText, startListening, stopListening, stopSpeaking };
}

function firstTranscript(value: string[] | undefined | null): string {
  if (!value || value.length === 0) return "";
  const t = String(value[0] ?? "").trim();
  return t;
}