import { NextRequest } from "next/server";
import { analyzeImage, type VisionMessage } from "@/lib/vision";
import { ageToLevel } from "@/lib/content";
import { localPhotoReply } from "@/lib/localBot";
import { rateLimit } from "@/lib/rateLimit";
import {
  classifyChildText,
  safetyScript,
  isReplySafe,
  UNSAFE_REPLY_FALLBACK,
} from "@/lib/safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const RATE_MAX = 10;
const RATE_WINDOW_MS = 60_000;

const UNSAFE_IMAGE_REPLY =
  "Esa imagen no es para mí. Mejor muéstrame otra cosa bonita, y si " +
  "encontraste algo raro, cuéntale a tus papás.";

type Msg = {
  role?: string;
  text?: string;
  image?: { data?: string; mime?: string };
};

export async function POST(req: NextRequest) {
  if (!rateLimit(req, RATE_MAX, RATE_WINDOW_MS)) {
    return new Response(
      JSON.stringify({ error: "Demasiados intentos. Esperá un momento." }),
      { status: 429 }
    );
  }

  let body: { messages?: Msg[]; age?: number; topic?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400 });
  }

  const raw = (body.messages ?? []).filter(
    (m): m is Msg => Boolean(m) && typeof m === "object"
  );

  let hasImage = false;
  const messages: VisionMessage[] = [];

  for (const m of raw) {
    const text = String(m.text ?? "").slice(0, 500);
    let image: { data: string; mime: string } | undefined;
    if (m.image && typeof m.image.data === "string" && m.image.data) {
      const mime = String(m.image.mime ?? "image/jpeg");
      if (!ALLOWED_MIME.has(mime)) {
        return new Response(
          JSON.stringify({ error: "Tipo de imagen no permitido" }),
          { status: 415 }
        );
      }
      const bytes = Buffer.from(m.image.data, "base64").byteLength;
      if (bytes > MAX_IMAGE_BYTES) {
        return new Response(
          JSON.stringify({ error: "Imagen demasiado grande", detail: "más de 4 MB" }),
          { status: 413 }
        );
      }
      image = { data: m.image.data, mime };
      hasImage = true;
    }
    messages.push({ role: m.role === "tino" ? "assistant" : "user", text, image });
  }

  if (!hasImage) {
    return new Response(JSON.stringify({ error: "Sin imagen" }), { status: 400 });
  }
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "Sin mensajes" }), { status: 400 });
  }

  // Moderación de ENTRADA, igual que en /api/chat: el texto que acompaña a la
  // foto pasa por el mismo clasificador. Antes esta ruta era un camino para
  // saltarse el guion fijo, la alerta y la pausa de 3 avisos. Además, el riesgo
  // se atrapa ANTES de subir la imagen al proveedor.
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser?.text) {
    const verdict = classifyChildText(lastUser.text);
    if (verdict.risk !== "none") {
      return Response.json({
        reply: safetyScript(verdict),
        safety: { risk: verdict.risk, category: verdict.category },
      });
    }
  }

  const age = Math.min(12, Math.max(3, Number(body.age) || 5));
  const level = ageToLevel(age);
  const topic =
    typeof body.topic === "string" && body.topic ? body.topic.slice(0, 40) : undefined;

  try {
    // Una SOLA llamada: si la imagen no es apta el modelo devuelve safe:false y
    // la ruta responde con guion fijo; la foto NUNCA se describe.
    const result = await analyzeImage({ messages, age, level, topic });
    if (!result.safe || !result.message) {
      return Response.json({
        reply: UNSAFE_IMAGE_REPLY,
        safety: { risk: "sensitive", category: "unsafe_image" },
      });
    }
    // Guard de SALIDA: la descripción de la foto pasa por la misma traba
    // determinista que la respuesta del chat.
    return Response.json({
      reply: isReplySafe(result.message) ? result.message : UNSAFE_REPLY_FALLBACK,
    });
  } catch (err) {
    console.error("vision error", err);
    // Las fotos solo van a Groq (privacidad). Si falla o agota cuota, Tino
    // responde con texto local SIN describir la foto y sin reenviarla.
    return Response.json({
      reply: localPhotoReply(topic),
      fallback: true,
    });
  }
}