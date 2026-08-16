"use client";

const PIN_KEY = "tino-pin";
const LOCK_KEY = "tino-pin-lock";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;

type Lock = { attempts: number; until: number };

async function sha256(text: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    }
    return String(h >>> 0);
  }
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hashPin(pin: string): Promise<string> {
  return sha256(`amigo-kids:${pin}`);
}

function readLock(): Lock {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    return raw ? (JSON.parse(raw) as Lock) : { attempts: 0, until: 0 };
  } catch {
    return { attempts: 0, until: 0 };
  }
}

function writeLock(lock: Lock) {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
  } catch {}
}

export function hasPin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(PIN_KEY));
  } catch {
    return false;
  }
}

export function pinLocked(): boolean {
  const lock = readLock();
  return lock.until > Date.now();
}

export function lockWaitMs(): number {
  const lock = readLock();
  return Math.max(0, lock.until - Date.now());
}

export async function setPin(pin: string): Promise<void> {
  localStorage.setItem(PIN_KEY, await hashPin(pin));
  localStorage.removeItem(LOCK_KEY);
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (pinLocked()) return false;
  const stored = localStorage.getItem(PIN_KEY);
  // Fail-closed: sin un PIN guardado, nadie entra.
  if (!stored) return false;
  const ok = stored === (await hashPin(pin));
  if (ok) {
    localStorage.removeItem(LOCK_KEY);
  } else {
    const lock = readLock();
    const attempts = lock.attempts + 1;
    writeLock({
      attempts,
      until: attempts >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0,
    });
  }
  return ok;
}

export function resetPin(): void {
  try {
    localStorage.removeItem(PIN_KEY);
    localStorage.removeItem(LOCK_KEY);
  } catch {}
}