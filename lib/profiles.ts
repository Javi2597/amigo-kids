"use client";

export type Profile = { id: string; name: string; age: number };

const KEY = "tino-profiles";
const ACTIVE_KEY = "tino-active";

function genId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function save(list: Profile[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // almacenamiento lleno/deshabilitado: se ignora.
  }
}

export function getProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  } catch {
    return [];
  }
}

export function activeProfileId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function getActiveProfile(): Profile | null {
  const id = activeProfileId();
  return getProfiles().find((p) => p.id === id) ?? null;
}

/** Crea el primer perfil si no existe, migrando el nombre/edad globales de la versión anterior. */
export function ensureProfiles(): void {
  if (getProfiles().length > 0) return;
  let legacyName = "";
  let legacyAge = 5;
  try {
    const raw = localStorage.getItem("tino-parent");
    if (raw) {
      const s = JSON.parse(raw);
      legacyName = String(s.name ?? "");
      legacyAge = Number(s.age) || 5;
    }
  } catch {}
  const p: Profile = { id: genId(), name: legacyName || "Peque", age: legacyAge };
  save([p]);
  try {
    localStorage.setItem(ACTIVE_KEY, p.id);
  } catch {}
}

export function upsertProfile(p: Profile): void {
  const list = getProfiles();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.push(p);
  save(list);
  if (!activeProfileId()) {
    try {
      localStorage.setItem(ACTIVE_KEY, p.id);
    } catch {}
  }
}

export function addProfile(name: string, age: number): Profile {
  const p: Profile = { id: genId(), name, age };
  const list = getProfiles();
  save([...list, p]);
  return p;
}

export function setActiveProfile(id: string): void {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {}
}

export function deleteProfile(id: string): void {
  let list = getProfiles().filter((p) => p.id !== id);
  if (list.length === 0) {
    list = [{ id: genId(), name: "Peque", age: 5 }];
  }
  save(list);
  // Limpia el progreso huérfano de ese perfil para no acumular claves.
  try {
    localStorage.removeItem(`tino-progress:${id}`);
  } catch {}
  try {
    const active = activeProfileId();
    if (active === id) {
      localStorage.setItem(ACTIVE_KEY, list[0].id);
    }
  } catch {}
}
