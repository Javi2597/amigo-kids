"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";
import { useSettings } from "@/lib/settings";
import { ageToLevel, LEVEL_INFO } from "@/lib/content";
import { isLockedToday, resetLock } from "@/lib/historyLog";
import { resetProgress } from "@/lib/progress";
import Link from "next/link";

export default function Padres() {
  const { settings, setSettings, profiles, activeProfile, switchProfile, createProfile, removeProfile } =
    useSettings();
  const level = ageToLevel(settings.age);
  const [locked, setLocked] = useState<boolean>(() => isLockedToday());
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState(5);

  const set = (patch: Partial<typeof settings>) => setSettings(patch);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold text-ink">👨‍👩‍👧 Panel de papás</h1>
        <div className="w-16" />
      </div>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-xl font-bold text-ink">¿Quién usa Amigo Kids? 🧒</h2>
        <p className="mb-3 text-base text-soft">
          Cada niño tiene su propia edad, nombre, estrellas y logros. El progreso
          se guarda solo en este dispositivo.
        </p>
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={[
                "flex items-center gap-2 rounded-full pl-4 pr-2 py-2",
                p.id === activeProfile?.id
                  ? "bg-mascot text-white"
                  : "bg-cream text-ink",
              ].join(" ")}
            >
              <button
                onClick={() => switchProfile(p.id)}
                className="text-lg font-bold"
                aria-label={`Usar perfil ${p.name}`}
              >
                {p.name} ({p.age} años)
              </button>
              {profiles.length > 1 && (
                <button
                  onClick={() => removeProfile(p.id)}
                  className="tap-target flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-sm font-bold text-coral"
                  aria-label={`Borrar perfil ${p.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setAdding((v) => !v)}
            className="rounded-full bg-cream px-4 py-2 text-lg font-bold text-soft"
          >
            + Agregar
          </button>
        </div>

        {adding && (
          <div className="mt-4 rounded-2xl bg-cream p-4">
            <input
              type="text"
              value={newName}
              placeholder="Nombre del niño"
              className="w-full rounded-full bg-surface px-4 py-3 text-lg text-ink outline-none placeholder:text-soft"
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-lg font-bold text-ink">Edad:</span>
              <span className="text-2xl font-bold text-mascot">{newAge}</span>
              <input
                type="range"
                min={3}
                max={12}
                step={1}
                value={newAge}
                onChange={(e) => setNewAge(Number(e.target.value))}
                className="flex-1 accent-mascot"
                aria-label="Edad del nuevo perfil"
              />
            </div>
            <button
              onClick={() => {
                createProfile(newName, newAge);
                setNewName("");
                setNewAge(5);
                setAdding(false);
              }}
              className="mt-3 w-full rounded-full bg-mascot px-4 py-3 text-lg font-bold text-white active:scale-95"
            >
              Crear perfil y usarlo
            </button>
          </div>
        )}
      </section>

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
        <Row
          title="Tabla de la familia (sin presión)"
          desc="Muestra un ranking local de estrellas entre los perfiles de este dispositivo. Solo se ve con 2+ perfiles y para niños de 10 a 12 años."
          checked={settings.leaderboardOn}
          onChange={(v) => set({ leaderboardOn: v })}
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
        <button
          onClick={() => {
            if (confirm("¿Borrar estrellas y logros del perfil activo? Esta acción no se puede deshacer.")) {
              resetProgress();
            }
          }}
          className="mt-2 block w-full rounded-full bg-cream px-4 py-3 text-center text-base font-bold text-soft active:scale-95"
        >
          Borrar progreso de {activeProfile?.name ?? "este perfil"}
        </button>
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