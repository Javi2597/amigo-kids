"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import BackButton from "@/components/BackButton";
import { hasPin, pinLocked, lockWaitMs, setPin, verifyPin, resetPin } from "@/lib/pin";

function makeChallenge(): { a: number; b: number } {
  return { a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) };
}

export default function PinGate({
  onUnlocked,
}: {
  onUnlocked: () => void;
}) {
  const [creating, setCreating] = useState(() => !hasPin());
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [wait, setWait] = useState(0);
  const [showReset, setShowReset] = useState(false);
  const [challenge, setChallenge] = useState(makeChallenge);
  const inputRef = useRef<HTMLInputElement>(null);

  const firstTime = !hasPin();

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  useEffect(() => {
    if (!pinLocked()) return;
    setLocked(true);
    const id = setInterval(() => {
      const ms = lockWaitMs();
      setWait(Math.ceil(ms / 1000));
      if (ms <= 0) {
        setLocked(false);
        setWait(0);
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  function resetLocal() {
    if (confirm(`Se va a quitar el PIN. Los perfiles y el progreso NO se borran.\n\n¿Continuar?`)) {
      resetPin();
      setPinValue("");
      setConfirm("");
      setError("");
      setShowReset(false);
      setCreating(true); // sin PIN de nuevo → modo crear
      setChallenge(makeChallenge());
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (creating) {
      if (!/^\d{4}$/.test(pin)) {
        setError("El PIN debe tener 4 números.");
        return;
      }
      if (pin !== confirmPin) {
        setError("Los PIN no coinciden.");
        return;
      }
      await setPin(pin);
      onUnlocked();
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("El PIN tiene 4 números.");
      return;
    }
    const ok = await verifyPin(pin);
    if (ok) {
      setPinValue("");
      onUnlocked();
    } else {
      setError(pinLocked() ? "Demasiados intentos. Esperá un ratito." : "PIN incorrecto.");
      setPinValue("");
      if (pinLocked()) {
        setLocked(true);
        setWait(Math.ceil(lockWaitMs() / 1000));
      }
    }
  }

  const lockedMsg = locked
    ? `Demasiados intentos. Esperá ${Math.max(0, wait)} s para volver a intentar.`
    : "";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-5 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold text-ink">👨‍👩‍👧 Panel de papás</h1>
        <div className="w-16" />
      </div>

      <section className="rounded-4xl bg-surface p-6 text-center shadow-soft">
        <div className="text-6xl">🔐</div>
        <h2 className="mt-2 text-2xl font-bold text-ink">
          {creating ? "Crea tu PIN" : "Ingresá tu PIN"}
        </h2>
        <p className="mt-2 text-base text-soft">
          {creating
            ? "Elegí un PIN de 4 números. Lo vas a necesitar para abrir este panel."
            : "El panel de papás está protegido. Tecleá tu PIN de 4 números."}
        </p>

        {creating ? (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]*"
              autoComplete="new-password"
              value={pin}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
              placeholder="PIN de 4 números"
              aria-label="PIN nuevo de 4 números"
              className="rounded-full bg-cream px-4 py-3 text-center font-mono text-2xl tracking-widest text-ink outline-none placeholder:text-soft placeholder:text-lg"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]*"
              autoComplete="new-password"
              value={confirmPin}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
              placeholder="Repetí el PIN"
              aria-label="Repetí el PIN"
              className="rounded-full bg-cream px-4 py-3 text-center font-mono text-2xl tracking-widest text-ink outline-none placeholder:text-soft placeholder:text-lg"
            />
            <button
              type="submit"
              className="rounded-full bg-mascot px-4 py-3 text-lg font-bold text-white active:scale-95"
            >
              Crear PIN
            </button>
            {!firstTime && (
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-full bg-cream px-4 py-2 text-base font-bold text-soft active:scale-95"
              >
                Volver
              </button>
            )}
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]*"
                autoComplete="current-password"
                value={pin}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                placeholder="PIN"
                aria-label="PIN de 4 números"
                disabled={locked}
                className="rounded-full bg-cream px-4 py-3 text-center font-mono text-2xl tracking-widest text-ink outline-none placeholder:text-soft placeholder:text-lg disabled:opacity-60"
              />
              {locked && (
                <p className="text-base font-semibold text-coral">{lockedMsg}</p>
              )}
              <button
                type="submit"
                disabled={locked}
                className="rounded-full bg-mascot px-4 py-3 text-lg font-bold text-white active:scale-95 disabled:opacity-60"
              >
                Entrar
              </button>
              {!firstTime && (
                <button
                  type="button"
                  onClick={() => setShowReset((v) => !v)}
                  className="text-sm font-bold text-soft underline active:scale-95"
                >
                  ¿Olvidaste tu PIN?
                </button>
              )}
            </form>

            {showReset && (
              <div className="mt-4 rounded-2xl bg-cream p-4">
                <p className="text-base text-soft">
                  Para quitar el PIN, resolvé esta cuenta:{" "}
                  <strong className="text-ink">
                    {challenge.a} + {challenge.b}
                  </strong>
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v && Number(v) === challenge.a + challenge.b) resetLocal();
                  }}
                  aria-label="Resultado de la suma para restablecer el PIN"
                  className="mt-3 w-full rounded-full bg-surface px-4 py-2 text-center font-mono text-lg text-ink outline-none"
                />
              </div>
            )}
            {error && !locked && (
              <p className="mt-3 text-base font-semibold text-coral">{error}</p>
            )}
          </>
        )}
      </section>

      <section className="rounded-4xl bg-lemon/25 p-5">
        <h2 className="mb-2 text-lg font-bold text-ink">👶 Para los más chiquitos</h2>
        <p className="text-base text-ink">
          Este panel es solo para adultos (toca la mascota y los niños pueden
          seguir jugando con Tino).
        </p>
      </section>
    </main>
  );
}