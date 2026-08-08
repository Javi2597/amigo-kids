"use client";

export type HistoryEntry = {
  ts: number;
  role: "user" | "tino";
  text: string;
  risk?: "sensitive" | "danger";
  category?: string | null;
};

const HISTORY_KEY = "tino-history";
const ALERT_PREFIX = "tino-alerts:";
const ALERT_LIMIT = 3;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // almacenamiento lleno/deshabilitado: se ignora, no debe romper el chat
  }
}

/** ¿El padre habilitó el historial? Lo decide desde la configuración guardada. */
export function historyEnabled(): boolean {
  try {
    const raw = localStorage.getItem("tino-parent");
    const s = raw ? JSON.parse(raw) : {};
    return s.logHistory === true;
  } catch {
    return false;
  }
}

/** Guarda SOLO texto (sin audio ni fotos). Si el padre desactivó el historial, no hace nada. */
export function logChat(entry: Omit<HistoryEntry, "ts">): void {
  if (!historyEnabled()) return;
  const list = read<HistoryEntry[]>(HISTORY_KEY, []);
  list.push({ ...entry, ts: Date.now() });
  // Límite local: retiene las últimas 500 entradas para no crecer sin control.
  write(HISTORY_KEY, list.slice(-500));
}

export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(HISTORY_KEY, []);
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

// ==== Bloqueo suave de seguridad (3 alertas de riesgo ALTO por día) ====

export function alertCountToday(): number {
  return Number(read<number>(`${ALERT_PREFIX}${todayKey()}`, 0));
}

/** Registra una alerta de riesgo alto. Devuelve true si quedó bloqueado. */
export function markAlert(): boolean {
  const count = alertCountToday() + 1;
  write(`${ALERT_PREFIX}${todayKey()}`, count);
  return count >= ALERT_LIMIT;
}

export function isLockedToday(): boolean {
  return alertCountToday() >= ALERT_LIMIT;
}

/** Solo un padre puede quitar la pausa (desde el panel de papás). */
export function resetLock(): void {
  try {
    localStorage.removeItem(`${ALERT_PREFIX}${todayKey()}`);
  } catch {}
}