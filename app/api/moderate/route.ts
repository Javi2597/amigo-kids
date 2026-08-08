import { NextRequest } from "next/server";
import { getAIKey, getAIModel, getAIBase } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOCKED = [
  "violencia", "matarme", "mata", "suicidio", "sangre", "dañarme",
  "daño fisico", "secuestro", "miedo a dormir solo porque",
];

export async function POST(req: NextRequest) {
  let text = "";
  try {
    const body = await req.json();
    text = String(body.text ?? "").toLowerCase();
  } catch {
    return Response.json({ allowed: true });
  }

  // Revisión rápida por palabras clave (sin gastar llamada al proveedor).
  if (BLOCKED.some((w) => text.includes(w))) {
    return Response.json({
      allowed: false,
      reply:
        "Eso parece importante. Hablemos con alguna persona adulta de confianza que pueda ayudarte. Mientras tanto, ¿qué te hace feliz?",
    });
  }

  // Revisión por el modelo como segunda capa.
  try {
    const res = await fetch(`${getAIBase()}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAIKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: getAIModel(),
        messages: [
          {
            role: "system",
            content:
              "Actúa como moderador de contenido de una app infantil. Responde SOLO con la palabra OK si el texto es seguro para niños de 3-6 años, o con la palabra NO si tiene algo violento, sexual, peligroso o que pida datos personales. No añadas nada más.",
          },
          { role: "user", content: text },
        ],
        max_tokens: 5,
      }),
    });
    const data = await res.json();
    const verdict = (data.choices?.[0]?.message?.content ?? "OK").trim().toUpperCase();
    return Response.json({
      allowed: verdict === "OK",
      reply: verdict !== "OK"
        ? "Eso no es apropiado para niños. Mejor hablamos de algo lindo o le contamos a una persona adulta."
        : "",
    });
  } catch {
    return Response.json({ allowed: true });
  }
}