import { NextRequest } from "next/server";
import { getSTTBase, getSTTModel, getAIKey } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("audio") as Blob | null;
  if (!file) {
    return new Response(JSON.stringify({ error: "Falta el archivo de audio" }), { status: 400 });
  }

  const model = (form.get("model") as string) || getSTTModel();

  const body = new FormData();
  body.set("file", file, "audio.webm");
  body.set("model", model);
  body.set("language", "es");

  try {
    const upstream = await fetch(`${getSTTBase()}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getAIKey()}` },
      body,
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return new Response(
        JSON.stringify({ error: `STT error ${upstream.status}`, detail: text }),
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return Response.json({ text: data.text ?? "" });
  } catch (err) {
    console.error("stt error", err);
    return new Response(JSON.stringify({ error: "Error en el reconocimiento de voz" }), {
      status: 502,
    });
  }
}