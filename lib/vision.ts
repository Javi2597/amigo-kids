import { getAIKey, getVisionBase, getVisionModel } from "@/lib/ai";
import { buildKidsPrompt } from "@/lib/kidsPrompt";
import type { LevelId } from "@/lib/content";

export type VisionImage = { data: string; mime: string };
export type VisionMessage = {
  role: "user" | "tino" | "assistant";
  text: string;
  image?: VisionImage;
};

/** Prompt del sistema con las reglas de seguridad + reglas para mirar fotos. */
export function buildVisionSystemPrompt(opts: {
  age: number;
  level: LevelId;
  topic?: string;
}): string {
  const base = buildKidsPrompt({ age: opts.age, level: opts.level });

  const topicLine = opts.topic
    ? `\nEl niño está aprendiendo el tema "${opts.topic}" y te muestra una foto sobre eso. Ayúdale a descubrir lo que ve relacionado con ese tema.`
    : "";

  return `${base}

El niño acaba de mostrarte una FOTO (además de lo que haya dicho en el chat).

REGLAS PARA LA FOTO:
- Mira la foto con cariño y cuéntale QUÉ VES de forma simple y divertida, acorde a su edad.
- Nombra los objetos, animales o personas que aparecen y hazle 1 o 2 preguntas sencillas sobre ella.
- Si la foto contiene algo inapropiado, adulto, peligroso o que no debería estar en la pantalla:
  NO lo describas en detalle. Responde suavemente: "Esa imagen no es para mí. Mejor muéstrame otra cosa bonita, y si encuentras algo raro, cuéntaselo a tus papás."
- Nunca pidas datos personales aunque aparezcan objetos reconocibles con información privada (direcciones, caras de otros niños claramente, correo).
- No inventes información de salud ni segura; si la foto sugiere algo de eso, sugiere a un adulto.
- Mantén la respuesta corta para que se pueda leer en voz alta.${topicLine}
`;
}

/**
 * Una SOLA llamada de visión que hace a la vez de guard de seguridad y de
 * generador de la respuesta. Devuelve {
 *   safe: boolean, // true = apropiado para describir, false = bloquear
 *   message: string  // mensaje de Tino (solo se usa si safe es true)
 * }.
 * Fusionado en una llamada porque el plan gratuito de Groq limita por tokens/min:
 * hacer guard + descripción por separado doblaba el costo y caía en 429.
 * Stateless: no guarda nada.
 */
export async function analyzeImage(opts: {
  messages: VisionMessage[];
  age: number;
  level: LevelId;
  topic?: string;
}): Promise<VisionResult> {
  const base = getVisionBase();
  const model = getVisionModel();
  const baseSystem = buildVisionSystemPrompt({
    age: opts.age,
    level: opts.level,
    topic: opts.topic,
  });
  const system = `${baseSystem}

IMPORTANTE: responde SOLO con JSON en la forma exacta:
{"safe":true,"message":"<tu respuesta para el niño>"}
donde:
- "safe" es true si la imagen es APROPIADA para niños (juguetes, dibujos, animales,
  plantas, comida, ropa, lugares de casa, personas vestidas) y false si contiene algo
  que NUNCA debería verse en una app infantil (violencia, sangre, armas, desnudos,
  contenido adulto/sexual, drogas, odio). Ante la duda marca false.
- "message" es la respuesta de Tino siguiendo todas las reglas de arriba, SIEMPRE y
  solo cuando safe es true. Si safe es false, deja message vacío ("").
No añadas texto fuera del JSON.`;

  const messages = (opts.messages ?? []).slice(-6).map((m) => {
    const role = m.role === "user" ? "user" : "assistant";
    if (m.image && m.image.data) {
      return {
        role,
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${m.image.mime || "image/jpeg"};base64,${m.image.data}`,
            },
          },
          { type: "text", text: m.text || "Miré mi foto." },
        ],
      };
    }
    return { role, content: m.text || "" };
  });

  const res = await fetchWithRetry(
    `${base.replace(/\/$/, "")}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAIKey()}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, ...messages],
        temperature: 0.7,
        max_tokens: 260,
        reasoning_effort: "none",
      }),
    }
  );

  if (res.status === 429) {
    throw new Error("QuotaExceeded");
  }
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error?.message ?? String(res.status);
    } catch {}
    throw new Error(`Groq ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "";
  if (!raw.trim()) {
    // A prueba de fallos: si el proveedor no devolvió nada, no se describe.
    return { safe: false, message: "" };
  }
  return parseVisionResult(raw);
}

export type VisionResult = { safe: boolean; message: string };

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_MS = 1500;

/**
 * Reintenta ante 429 (límite de tokens/minuto del plan gratuito de Groq),
 * respetando `Retry-After` si viene. Deja pasar 429 si se agotan los intentos
 * para que la ruta responda el mensaje amistoso de Tino.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit
): Promise<Response> {
  let last: Response | null = null;
  for (
    let attempt = 0;
    attempt <= RETRY_ATTEMPTS;
    attempt++
  ) {
    last = await fetch(url, init);
    if (last.status !== 429) return last;
    const retryAfter = Number(last.headers.get("retry-after") || 0);
    const wait = Math.max(retryAfter * 1000 || 0, RETRY_BASE_MS * 2 ** attempt);
    await new Promise((r) => setTimeout(r, wait));
  }
  return last as Response;
}

/** Prueba varios formatos: JSON puro, con fences ```json```, o salpicado de ruido. */
export function parseVisionResult(rawText: string): VisionResult {
  let text = rawText
    .replace(/<thinking>[\s\S]*?<\/thinking>/g, "")
    .replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1")
    .trim()
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "");

  let safe = false;
  let message = "";
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null) {
      safe = parsed.safe === true;
      message = String(parsed.message ?? "").trim();
    }
  } catch {
    // fallback a regex si el JSON no fue estricto
    const sm = text.match(/"safe"\s*:\s*(true|false)/);
    if (sm) safe = sm[1] === "true";
    const mm = text.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (mm) message = mm[1].replace(/\\"/g, '"').replace(/\\n/g, " ");
  }

  message = message.replace(/\s+/g, " ").trim();
  return { safe, message };
}