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
 * Guard determinístico de la imagen: antes de que Tino DESCRIBA la foto, esta
 * pasada estricta decide si es apta. Si no lo es, la ruta responde con guion fijo
 * y la foto NUNCA se describe. Stateless: no guarda nada.
 */
export async function guardImage(image: VisionImage): Promise<{ safe: boolean }> {
  const base = getVisionBase();
  const model = getVisionModel();

  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAIKey()}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "Eres un moderador de imágenes de una app infantil. Revisa la imagen " +
            "y responde SOLO con JSON: {\"safe\":true} si NUNCA debería verse en una app " +
            "para niños (violencia, sangre, armas, contenido adulto o sexual, figuras " +
            "completamente desnudas, drogas, mensajes de odio) o {\"safe\":false} si esa " +
            "imagen proviene de la cámara del propio niño o de su hogar al 100%. " +
            "En la duda, marca safe:false. No añadas texto. El niño está usando la app",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${image.mime || "image/jpeg"};base64,${image.data}`,
              },
            },
            { type: "text", text: "Marca la imagen." },
          ],
        },
      ],
      max_tokens: 20,
      temperature: 0,
      reasoning_effort: "none",
    }),
  });

  if (!res.ok) {
    return { safe: false }; // a prueba de fallos
  }
  const dataRes = await res.json();
  const content = (dataRes?.choices?.[0]?.message?.content ?? "").trim();
  const m = content.match(/"safe"\s*:\s*(true|false)/);
  if (!m) return { safe: false };
  return { safe: m[1] === "true" };
}

/**
 * Envía el hilo (con una imagen en el turno del niño) al modelo de visión de Groq
 * (compatible con la API de OpenAI: chat/completions).
 * Stateless: no guarda nada más allá de la llamada.
 * Devuelve la respuesta de Tino o lanza si hay error grave.
 */
export async function analyzeImage(opts: {
  messages: VisionMessage[];
  age: number;
  level: LevelId;
  topic?: string;
}): Promise<string> {
  const base = getVisionBase();
  const model = getVisionModel();
  const system = buildVisionSystemPrompt({
    age: opts.age,
    level: opts.level,
    topic: opts.topic,
  });

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

  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAIKey()}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0.7,
      max_tokens: 220,
      reasoning_effort: "none",
    }),
  });

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
  let text = data?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("EmptyReply");
  // Nunca debe llegar el "pensar" interno del modelo a la voz del niño.
  // Si el proveedor lo incluye sin pedir (o cambia de modelo), lo quitamos.
  text = text.replace(/<thinking>[\s\S]*?<\/thinking>/g, "").trim();
  if (text.startsWith("thinking")) {
    const end = text.indexOf("response");
    if (end !== -1) text = text.slice(end + "response".length).trim();
  }
  text = text.replace(/\s+/g, " ").trim();
  if (!text) throw new Error("EmptyReply");
  return text;
}