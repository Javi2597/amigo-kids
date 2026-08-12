"use client";

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.16
) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Efectos de sonido cortos (WebAudio, sin archivos). */
export const sfx = {
  correct() {
    tone(660, 0, 0.12);
    tone(880, 0.1, 0.2);
  },
  wrong() {
    tone(300, 0, 0.18, "square", 0.08);
    tone(220, 0.12, 0.2, "square", 0.06);
  },
  star() {
    tone(880, 0, 0.1, "triangle", 0.2);
    tone(1108, 0.08, 0.12, "triangle", 0.2);
    tone(1318, 0.16, 0.24, "triangle", 0.22);
  },
  fanfare() {
    [523, 659, 784, 1046].forEach((f, i) =>
      tone(f, i * 0.12, 0.2, "triangle", 0.2)
    );
  },
};
