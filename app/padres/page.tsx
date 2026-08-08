"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";
import { useSettings } from "@/lib/settings";
import { ageToLevel, LEVEL_INFO } from "@/lib/content";
import { isLockedToday, resetLock } from "@/lib/historyLog";
import Link from "next/link";

export default function Padres() {
  const { settings, setSettings } = useSettings();
  const level = ageToLevel(settings.age);
  const [locked, setLocked] = useState<boolean>(() => isLockedToday());

  const set = (patch: Partial<typeof settings>) => setSettings(patch);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold text-ink">👨‍👩‍👧 Panel de papás</h1>
        <div className="w-16" />
      </div>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-xl font-bold text-ink">Nombre del peque</h2>
        <input
          type="text"
          value={settings.name}
          placeholder="Ej. Nico"
          className="w-full rounded-full bg-cream px-4 py-3 text-lg text-ink outline-none placeholder:text-soft"
          onChange={(e) => set({ name: e.target.value })}
        />
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-xl font-bold text-ink">Edad del peque</h2>
        <p className="mb-4 text-base text-soft">
          Tino ajusta solo las lecciones, juegos y respuestas a su edad.
        </p>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-5xl font-bold text-mascot">
            {settings.age}
          </span>
          <span className="text-lg font-bold text-ink">años</span>
        </div>
        <input
          type="range"
          min={3}
          max={12}
          step={1}
          value={settings.age}
          onChange={(e) => set({ age: Number(e.target.value) })}
          className="w-full accent-mascot"
          aria-label="Edad del niño"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {([1, 2, 3, 4] as const).map((lv) => (
            <span
              key={lv}
              className={[
                "rounded-full px-3 py-1 text-sm font-bold",
                lv === level ? "bg-mascot text-white" : "bg-cream text-soft",
              ].join(" ")}
            >
              Nivel {lv} · {LEVEL_INFO[lv].range}
            </span>
          ))}
        </div>
        <p className="mt-3 rounded-2xl bg-lemon/25 px-4 py-2 text-base font-semibold text-ink">
          Para esta edad Tino usa: Nivel {level} ({LEVEL_INFO[level].label}).
        </p>
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-xl font-bold text-ink">Preferencias</h2>
        <Row
          title="Voz de Tino (narración)"
          desc="Activa o silencia las respuestas habladas."
          checked={settings.voiceOn}
          onChange={(v) => set({ voiceOn: v })}
        />
        <Row
          title="Voz natural (mejor calidad)"
          desc="Usa la voz natural por internet; si falla, Tino usa la del dispositivo."
          checked={settings.naturalVoice}
          onChange={(v) => set({ naturalVoice: v })}
        />
        <Row
          title="Modo tranquilo"
          desc="Colores más suaves para niños sensibles."
          checked={settings.quietMode}
          onChange={(v) => set({ quietMode: v })}
        />
        <div className="mt-4">
          <label className="mb-1 block font-bold text-ink">
            Límite de uso diario: {settings.timeLimitMin} min
          </label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={settings.timeLimitMin}
            onChange={(e) => set({ timeLimitMin: Number(e.target.value) })}
            className="w-full accent-mascot"
          />
        </div>
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-xl font-bold text-ink">
          Privacidad y consentimientos 🌱
        </h2>
        <p className="mb-4 rounded-2xl bg-cream px-4 py-3 text-base text-soft">
          Tino procesa solo lo mínimo para conversar: el texto (a un proveedor de
          IA), la voz (que se convierte a texto y no se guarda) y, si autorizás la
          cámara, fotos que se analizan al instante y no se guardan. Nunca se
          comparten con terceros para publicidad. Leé la{" "}
          <Link href="/politica-privacidad" className="font-bold text-mascot underline">
            política de privacidad
          </Link>
          .
        </p>
        <Row
          title="Autorizo el micrófono"
          desc="El niño puede hablarle a Tino. El audio se convierte a texto al instante y no se guarda."
          checked={settings.micConsent}
          onChange={(v) => set({ micConsent: v })}
        />
        <Row
          title="Autorizo la cámara / fotos"
          desc="El niño puede mostrarle fotos a Tino. Se analizan al instante, no se guardan y se quitan al cerrar."
          checked={settings.photoConsent}
          onChange={(v) => set({ photoConsent: v })}
        />
        <Row
          title="Guardar historial para revisión"
          desc="Guarda SOLO el texto (sin audio ni fotos) en este dispositivo para revisar los temas que tocó el niño."
          checked={settings.logHistory}
          onChange={(v) => set({ logHistory: v })}
        />
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-xl font-bold text-ink">Historial y pausa de seguridad 🛡️</h2>
        <p className="mb-3 text-base text-soft">
          Revisar los temas que tocó el niño (solo texto, sin audio ni fotos) y
          gestionar la pausa automática si hubo varias alertas de riesgo.
        </p>
        <Link
          href="/padres/historial"
          className="block rounded-full bg-cream px-4 py-3 text-center text-base font-bold text-ink active:scale-95"
        >
          Ver historial guardado
        </Link>
        {locked && (
          <button
            onClick={() => {
              resetLock();
              setLocked(false);
            }}
            className="mt-2 block w-full rounded-full bg-coral px-4 py-3 text-center text-base font-bold text-white active:scale-95"
          >
            Quitar la pausa de seguridad
          </button>
        )}
      </section>

      <section className="rounded-4xl bg-lemon/25 p-5">
        <h2 className="mb-2 text-lg font-bold text-ink">Consejos de uso 🧡</h2>
        <ul className="list-inside list-disc space-y-1 text-base text-ink">
          <li>Al poner la edad, todo el contenido se adapta automáticamente (3 a 12 años).</li>
          <li>Tino responde en frases cortas y del nivel correcto para cada peque.</li>
          <li>El niño toca el micrófono, dice su frase y suelta.</li>
          <li>Guiad los primeros usos para enseñarle el ritmo.</li>
          <li>Tino acompaña momentos de juego y aprendizaje: nunca reemplaza la supervisión de un adulto.</li>
          <li>Pueden cambiar la edad cuando crezca y los niveles suben solos.</li>
        </ul>
      </section>
    </main>
  );
}

function Row({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 border-b border-cream py-3 last:border-none">
      <span>
        <span className="block font-bold text-ink">{title}</span>
        <span className="block text-sm text-soft">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-8 w-8 accent-mascot"
      />
    </label>
  );
}