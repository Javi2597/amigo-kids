import { NextRequest } from "next/server";
import { analyzeImage, type VisionMessage } from "@/lib/vision";
import { ageToLevel } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const UNSAFE_IMAGE_REPLY =
  "Esa imagen no es para mí. Mejor muéstrame otra cosa bonita, y si " +
  "encontraste algo raro, cuéntale a tus papás.";

type Msg = {
  role?: string;
  text?: string;
  image?: { data?: string; mime?: string };
};

export async function POST(req: NextRequest) {
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
    return Response.json({ reply: result.message });
  } catch (err) {
    console.error("vision error", err);
    const msg = String((err as Error)?.message ?? "");
    if (msg.includes("QuotaExceeded")) {
      return Response.json(
        {
          reply:
            "Uy, Tino está descansando un ratito y no puede mirar tu foto ahora mismo. Inténtalo en unos segundos, ¡o muéstrame otra cosa!",
        },
        { status: 429 }
      );
    }
    return Response.json(
      {
        reply: "¡Ups! Se me escapó la foto. ¿Podemos volver a intentarlo juntos?",
      },
      { status: 502 }
    );
  }
}