import { type AiProvider } from "@/lib/ai";

export type ChatPayload = {
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

export type ChatResult =
  | { ok: true; reply: string; providerId: string }
  | { ok: false; error: string };

const TIMEOUT_MS = 15_000;
const COOLDOWN_429_MS = 60_000;
const COOLDOWN_DAILY_MS = 30 * 60 * 1000;
const COOLDOWN_ERROR_MS = 15_000;
const COOLDOWN_AUTH_MS = 5 * 60 * 1000;

// Cooldown por instancia (igual que rateLimit): es una protección de mejor
// esfuerzo. Un proveedor en cooldown se saltea en las siguientes peticiones
// para no gastar tiempo (el niño pasa directo al siguiente proveedor).
const cooldowns = new Map<string, number>();

function markCooldown(id: string, ms: number) {
  cooldowns.set(id, Date.now() + ms);
}

function isCoolingDown(id: string): boolean {
  const until = cooldowns.get(id);
  if (!until) return false;
  if (until < Date.now()) {
    cooldowns.delete(id);
    return false;
  }
  return true;
}

async function postCompletion(
  provider: AiProvider,
  payload: ChatPayload
): Promise<{ status: number; text: string; headers: Headers }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${provider.baseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({ ...payload, model: provider.chatModel }),
        signal: controller.signal,
      }
    );
    const text = await res.text();
    return { status: res.status, text, headers: res.headers };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Prueba los proveedores en orden, saltándose los que estén en cooldown.
 * Primer éxito gana; si todos fallan devuelve { ok: false }.
 */
export async function chatCompletion(
  providers: AiProvider[],
  payload: ChatPayload
): Promise<ChatResult> {
  for (const provider of providers) {
    if (isCoolingDown(provider.id)) continue;

    let res: { status: number; text: string; headers: Headers };
    try {
      res = await postCompletion(provider, payload);
    } catch {
      markCooldown(provider.id, COOLDOWN_ERROR_MS);
      continue;
    }

    if (res.status === 200) {
      try {
        const data = JSON.parse(res.text);
        const reply = data?.choices?.[0]?.message?.content;
        if (typeof reply === "string" && reply.trim()) {
          return { ok: true, reply, providerId: provider.id };
        }
      } catch {}
      // 200 sin contenido útil: tratarlo como fallo del proveedor.
      markCooldown(provider.id, COOLDOWN_ERROR_MS);
      continue;
    }

    if (res.status === 429) {
      // Groq expone cuántas peticiones quedan en la ventana; si llegó a 0 el
      // límite puede ser diario y el cooldown debe ser largo.
      const remaining = Number(
        res.headers.get("x-ratelimit-remaining-requests") ?? ""
      );
      if (provider.id === "groq" && remaining === 0) {
        markCooldown(provider.id, COOLDOWN_DAILY_MS);
      } else {
        const retryAfter = Number(res.headers.get("retry-after") ?? 0) * 1000;
        markCooldown(
          provider.id,
          Math.max(retryAfter, COOLDOWN_429_MS)
        );
      }
      continue;
    }

    if (res.status === 400 || res.status === 401) {
      markCooldown(provider.id, COOLDOWN_AUTH_MS);
      continue;
    }

    // 5xx u otros: cooldown corto y probar el siguiente proveedor.
    markCooldown(provider.id, COOLDOWN_ERROR_MS);
  }

  return { ok: false, error: "Todos los proveedores fallaron" };
}