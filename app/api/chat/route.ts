import { NextRequest } from "next/server";
import { buildKidsPrompt } from "@/lib/kidsPrompt";
import { ageToLevel, type LevelId } from "@/lib/content";
import { getProviders } from "@/lib/ai";
import { chatCompletion } from "@/lib/aiRouter";
import { localTinoReply } from "@/lib/localBot";
import { rateLimit } from "@/lib/rateLimit";
import {
  classifyChildText,
  safetyScript,
  isReplySafe,
  UNSAFE_REPLY_FALLBACK,
} from "@/lib/safety";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 8;
const RATE_MAX = 20;
const RATE_WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  if (!rateLimit(req, RATE_MAX, RATE_WINDOW_MS)) {
    return new Response(
      JSON.stringify({ error: "Demasiados intentos. Esperá un momento." }),
      { status: 429 }
    );
  }

  let body: { messages?: { role: string; content: string }[]; age?: number; topic?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-MAX_MESSAGES).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 500),
  }));

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "Sin mensajes" }), { status: 400 });
  }

  // Moderación de ENTRADA: el riesgo alto se bloquea antes de gastar una
  // llamada al proveedor y SIEMPRE usa guion fijo seguro (sin generación libre).
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    const verdict = classifyChildText(lastUser.content);
    if (verdict.risk !== "none") {
      return Response.json({
        reply: safetyScript(verdict),
        safety: { risk: verdict.risk, category: verdict.category },
      });
    }
  }

  const age = Math.min(12, Math.max(3, Number(body.age) || 5));
  const level: LevelId = ageToLevel(age);
  const topic = body.topic ? String(body.topic).slice(0, 60) : undefined;
  const system = buildKidsPrompt({ age, level, topic });

  const conversations = [
    { role: "system", content: system },
    ...messages,
  ];

  try {
    const result = await chatCompletion(getProviders(), {
      messages: conversations,
      temperature: 0.7,
      max_tokens: 220,
      stream: false,
    });

    if (!result.ok) {
      // Todos los proveedores fallaron (cuota agotada o caídos): Tino local.
      console.warn("chat: todos los proveedores fallaron, respondo Tino local");
      return Response.json({
        reply: localTinoReply(lastUser?.content ?? "", { age, level, topic }),
        fallback: true,
      });
    }

    // Guard de RESPUESTA: si el texto iba a ser inapropiado, se reemplaza
    // por un mensaje seguro. Formato de lista determinista (sin llamada extra).
    const reply = isReplySafe(result.reply) ? result.reply : UNSAFE_REPLY_FALLBACK;
    return Response.json({ reply });
  } catch (err) {
    console.error("chat error", err);
    return Response.json({
      reply: localTinoReply(lastUser?.content ?? "", { age, level, topic }),
      fallback: true,
    });
  }
}