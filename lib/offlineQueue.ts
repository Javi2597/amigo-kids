"use client";

export type QueuedMessage = {
  text: string;
  age: number;
  level: number;
  topic?: string;
  ts: number;
};

const KEY = "tino-offline-queue";

function read(): QueuedMessage[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedMessage[]) : [];
  } catch {
    return [];
  }
}

function write(list: QueuedMessage[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

export function enqueue(msg: Omit<QueuedMessage, "ts">): void {
  const list = read();
  list.push({ ...msg, ts: Date.now() });
  write(list.slice(-20));
}

export function queued(): QueuedMessage[] {
  return read();
}

export function clearQueue(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/** Reenvía todos los mensajes pendientes cuando vuelve la red. */
export function flushQueue(handler: (msg: QueuedMessage) => void): void {
  const list = read();
  if (list.length === 0) return;
  for (const msg of list) {
    handler(msg);
  }
  clearQueue();
}

/** Escucha el evento "online" una vez y drena la cola; devuelve cómo desuscribirse. */
export function registerOnlineFlush(handler: (msg: QueuedMessage) => void): () => void {
  const listener = () => flushQueue(handler);
  window.addEventListener("online", listener);
  return () => window.removeEventListener("online", listener);
}