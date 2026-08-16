"use client";

const PREFIX = "tino-";

export function exportData(): void {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `amigo-kids-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function validateBackup(
  json: string
): { ok: boolean; error?: string; data?: Record<string, string> } {
  let data: Record<string, string>;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, error: "no es un archivo JSON válido" };
  }
  if (!data || typeof data !== "object") {
    return { ok: false, error: "el respaldo está vacío" };
  }
  if (typeof data["tino-profiles"] !== "string") {
    return { ok: false, error: "no parece un respaldo de Amigo Kids" };
  }
  try {
    JSON.parse(data["tino-profiles"]);
  } catch {
    return { ok: false, error: "el respaldo está dañado" };
  }
  return { ok: true, data };
}

function persistBackup(data: Record<string, string>): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  }
  for (const [key, value] of Object.entries(data)) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
}

/** Valida y aplica un respaldo. Úsalo cuando ya no haga falta re-confirmar. */
export function restoreData(
  json: string
): { ok: boolean; error?: string } {
  const v = validateBackup(json);
  if (!v.ok || !v.data) return { ok: false, error: v.error };
  persistBackup(v.data);
  return { ok: true };
}

/** Aplica un respaldo ya validado (por ejemplo, tras confirmar el PIN). */
export function applyBackup(data: Record<string, string>): void {
  persistBackup(data);
}