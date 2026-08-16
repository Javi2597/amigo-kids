"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";
import PinGate from "@/components/PinGate";
import PinConfirm from "@/components/PinConfirm";
import { clearHistory, getHistory, type HistoryEntry } from "@/lib/historyLog";

const RISK_LABEL: Record<string, string> = {
  danger: "Riesgo alto",
  sensitive: "Tema sensible",
};

export default function Historial() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory());
  const [unlocked, setUnlocked] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!unlocked) return <PinGate onUnlocked={() => setUnlocked(true)} />;

  const sorted = [...entries].sort((a, b) => b.ts - a.ts);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-5 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold text-ink">Historial</h1>
        <div className="w-16" />
      </div>

      <p className="rounded-2xl bg-cream px-4 py-3 text-base text-soft">
        Solo se guarda el texto del chat (sin audio ni fotos) si está activado en
        el panel de papás. Todo queda en este dispositivo; no se envía a ningún
        servidor.
      </p>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-lg text-soft">
          Todavía no hay nada guardado.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((e, i) => (
            <li
              key={`${e.ts}-${i}`}
              className="rounded-3xl bg-surface p-4 shadow-soft"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-soft">
                  {e.role === "user" ? "🧒 Niño" : "🦊 Tino"} ·{" "}
                  {new Date(e.ts).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {e.risk && (
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-bold text-white",
                      e.risk === "danger" ? "bg-coral" : "bg-sky",
                    ].join(" ")}
                  >
                    {RISK_LABEL[e.risk] ?? e.risk}
                  </span>
                )}
              </div>
              <p className="text-lg text-ink">{e.text}</p>
            </li>
          ))}
        </ul>
      )}

      {sorted.length > 0 && (
        <button
          onClick={() => setConfirmClear(true)}
          className="rounded-full bg-coral px-4 py-3 text-lg font-bold text-white active:scale-95"
        >
          Borrar todo el historial
        </button>
      )}

      {confirmClear && (
        <PinConfirm
          title="Borrar historial"
          message="Se va a borrar todo el historial guardado. Esta acción no se puede deshacer."
          onClose={() => setConfirmClear(false)}
          onConfirm={() => {
            clearHistory();
            setEntries([]);
          }}
        />
      )}
    </main>
  );
}