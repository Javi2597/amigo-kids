"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";
import { pinLocked, lockWaitMs, verifyPin } from "@/lib/pin";

export default function PinConfirm({
  onConfirm,
  onClose,
  title,
  message,
}: {
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  message?: string;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(() => pinLocked());
  const [wait, setWait] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!pinLocked()) return;
    setLocked(true);
    const id = setInterval(() => {
      const ms = lockWaitMs();
      setWait(Math.ceil(ms / 1000));
      if (ms <= 0) {
        setLocked(false);
        setWait(0);
        setPin("");
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{4}$/.test(pin)) {
      setError("El PIN tiene 4 números.");
      return;
    }
    const ok = await verifyPin(pin);
    if (ok) {
      setPin("");
      onConfirm();
      return;
    }
    setPin("");
    if (pinLocked()) {
      setLocked(true);
      setWait(Math.ceil(lockWaitMs() / 1000));
      setError("Demasiados intentos. Esperá un ratito.");
    } else {
      setError("PIN incorrecto.");
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="pin-confirm-title">
      <div className="text-center">
        <div className="text-5xl">🔐</div>
        <h2 id="pin-confirm-title" className="mt-2 text-xl font-bold text-ink">
          {title ?? "Confirmar con PIN"}
        </h2>
        <p className="mt-2 text-base text-soft">
          {message ?? "Solo para adultos. Tecleá tu PIN para continuar."}
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            pattern="[0-9]*"
            autoComplete="current-password"
            value={pin}
            disabled={locked}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="PIN"
            aria-label="PIN de 4 números"
            className="rounded-full bg-cream px-4 py-3 text-center font-mono text-2xl tracking-widest text-ink outline-none placeholder:text-soft placeholder:text-lg disabled:opacity-60"
          />
          {locked && (
            <p className="text-base font-semibold text-coral">
              Demasiados intentos. Esperá {Math.max(0, wait)} s para volver a intentar.
            </p>
          )}
          {error && !locked && (
            <p className="text-base font-semibold text-coral">{error}</p>
          )}
          <button
            type="submit"
            disabled={locked}
            className="rounded-full bg-mascot px-4 py-3 text-lg font-bold text-white active:scale-95 disabled:opacity-60"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cream px-4 py-2 text-base font-bold text-soft active:scale-95"
          >
            Cancelar
          </button>
        </form>
      </div>
    </Modal>
  );
}