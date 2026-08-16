"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";
import PinGate from "@/components/PinGate";
import PinConfirm from "@/components/PinConfirm";
import { useSettings } from "@/lib/settings";
import { ageToLevel, LEVEL_INFO } from "@/lib/content";
import { isLockedToday, resetLock } from "@/lib/historyLog";
import { resetProgress } from "@/lib/progress";
import { todaySeconds, resetUsageToday } from "@/lib/timeLimit";
import { exportData, validateBackup, applyBackup } from "@/lib/backup";
import Link from "next/link";

type DestructiveAction =
  | { kind: "remove-profile"; id: string; name: string }
  | { kind: "reset-progress" }
  | { kind: "reset-lock" }
  | { kind: "reset-usage" }
  | { kind: "restore" };

export default function Padres() {
  const { settings, setSettings, profiles, activeProfile, switchProfile, createProfile, removeProfile } =
    useSettings();
  const level = ageToLevel(settings.age);
  const [unlocked, setUnlocked] = useState(false);
  const [locked, setLocked] = useState<boolean>(() => isLockedToday());
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState(5);
  const [restoreMsg, setRestoreMsg] = useState("");
  const [pendingAction, setPendingAction] = useState<DestructiveAction | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Record<string, string> | null>(null);

  const set = (patch: Partial<typeof settings>) => setSettings(patch);

  function runDestructive() {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    switch (action.kind) {
      case "remove-profile":
        removeProfile(action.id);
        break;
      case "reset-progress":
        resetProgress();
        break;
      case "reset-lock":
        resetLock();
        setLocked(false);
        break;
      case "reset-usage":
        resetUsageToday();
        break;
      case "restore":
        if (pendingRestore) {
          try {
            applyBackup(pendingRestore);
            setRestoreMsg("✅ Copia restaurada. Recargá la página para ver los cambios.");
          } catch {
            setRestoreMsg("No se pudo restaurar la copia.");
          }
        }
        setPendingRestore(null);
        break;
    }
  }

  const destructiveCopy: { title: string; message: string } | null = (() => {
    if (!pendingAction) return null;
    switch (pendingAction.kind) {
      case "remove-profile":
        return {
          title: "Borrar perfil",
          message: `Se va a borrar a ${pendingAction.name} y todo su progreso. Esta acción no se puede deshacer.`,
        };
      case "reset-progress":
        return {
          title: "Borrar progreso",
          message: `Se borrarán las estrellas y logros de ${activeProfile?.name ?? "este perfil"}. No se puede deshacer.`,
        };
      case "reset-lock":
        return { title: "Quitar la pausa", message: "Se levantará la pausa de seguridad de hoy." };
      case "reset-usage":
        return { title: "Reiniciar tiempo", message: "Se reinicia el tiempo de uso acumulado hoy." };
      case "restore":
        return { title: "Restaurar copia", message: "Se reemplazará TODO el contenido actual por el respaldo elegido." };
    }
  })();

  if (!unlocked) return <PinGate onUnlocked={() => setUnlocked(true)} />;

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
                  onClick={() => setPendingAction({ kind: "remove-profile", id: p.id, name: p.name })}
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
          <p className="mt-2 text-sm text-soft">
            Hoy usó Tino {formatMinutes(todaySeconds())} de {settings.timeLimitMin} min.
          </p>
        </div>
        <button
          onClick={() => setPendingAction({ kind: "reset-usage" })}
          className="mt-2 w-full rounded-full bg-cream px-4 py-3 text-center text-base font-bold text-soft active:scale-95"
        >
          Reiniciar el tiempo de uso de hoy
        </button>
      </section>

      <section className="rounded-4xl bg-surface p-5 shadow-soft">
        <h2 className="mb-2 text-xl font-bold text-ink">Respaldo de datos 💾</h2>
        <p className="mb-3 text-base text-soft">
          Descargás una copia con los perfiles, estrellas y logros de este
          dispositivo, y podés restaurarla en otro o si se borra.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={exportData}
            className="rounded-full bg-mascot px-4 py-3 text-center text-base font-bold text-white active:scale-95"
          >
            Guardar copia (descargar)
          </button>
          <label className="rounded-full bg-cream px-4 py-3 text-center text-base font-bold text-ink active:scale-95">
            Restaurar una copia
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const res = validateBackup(text);
                e.target.value = "";
                if (!res.ok || !res.data) {
                  setRestoreMsg(`No se puede restaurar: ${res.error ?? "archivo inválido"}`);
                  return;
                }
                setPendingRestore(res.data);
                setPendingAction({ kind: "restore" });
              }}
            />
          </label>
          {restoreMsg && (
            <p className="rounded-2xl bg-cream px-4 py-2 text-sm font-semibold text-soft">
              {restoreMsg}
            </p>
          )}
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
          onClick={() => setPendingAction({ kind: "reset-progress" })}
          className="mt-2 block w-full rounded-full bg-cream px-4 py-3 text-center text-base font-bold text-soft active:scale-95"
        >
          Borrar progreso de {activeProfile?.name ?? "este perfil"}
        </button>
        {locked && (
          <button
            onClick={() => setPendingAction({ kind: "reset-lock" })}
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

      {pendingAction && destructiveCopy && (
        <PinConfirm
          title={destructiveCopy.title}
          message={destructiveCopy.message}
          onClose={() => setPendingAction(null)}
          onConfirm={runDestructive}
        />
      )}
    </main>
  );
}

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatMinutes(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${pad(m)}:${pad(s)}`;
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