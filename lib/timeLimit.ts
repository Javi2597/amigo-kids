"use client";

import { activeProfileId } from "./profiles";

const USAGE_PREFIX = "tino-usage:";

type Usage = { seconds: number; date: string };

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
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
  } catch {}
}

function usageKey(): string {
  return `${USAGE_PREFIX}${activeProfileId() ?? "none"}`;
}

export function todaySeconds(): number {
  const u = read<Usage>(usageKey(), { seconds: 0, date: todayKey() });
  return u.date === todayKey() ? u.seconds : 0;
}

function setSeconds(seconds: number) {
  write(usageKey(), { seconds: Math.max(0, Math.floor(seconds)), date: todayKey() });
}

/** Súmale segundos de uso activo al niño actual (perfil activo). */
export function addSeconds(delta: number) {
  setSeconds(todaySeconds() + Math.max(0, delta));
}

/** El adulto reinicia el tiempo acumulado de hoy (desde el panel de papás). */
export function resetUsageToday() {
  setSeconds(0);
}