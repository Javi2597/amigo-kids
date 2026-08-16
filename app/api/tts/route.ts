import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 600;
const RATE_MAX = 30;
const RATE_WINDOW_MS = 60_000;
const cache = new Map<string, { ts: Buffer; expiresAt: number }>();
const TTL = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
  if (!rateLimit(req, RATE_MAX, RATE_WINDOW_MS)) {
    return new Response(
      JSON.stringify({ error: "Demasiados intentos. Esperá un momento." }),
      { status: 429 }
    );
  }

  let body: { text?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400 });
  }

  const text = String(body.text ?? "").trim().slice(0, MAX_TEXT);
  if (!text) {
    return new Response(JSON.stringify({ error: "Sin texto" }), { status: 400 });
  }

  const lang = /^[a-z]{2}(-[A-Z]{2})?$/.test(String(body.lang ?? ""))
    ? String(body.lang)
    : "es";

  const key = `${lang}:${text}`;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return audioResponse(hit.ts);
  }

  const url = new URL("https://translate.google.com/translate_tts");
  url.searchParams.set("ie", "UTF-8");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("tl", lang);
  url.searchParams.set("q", text);

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Proveedor TTS: ${upstream.status}` }),
        { status: upstream.status }
      );
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.byteLength === 0) {
      return new Response(JSON.stringify({ error: "Audio vacío" }), { status: 502 });
    }

    cache.set(key, { ts: buf, expiresAt: Date.now() + TTL });
    if (cache.size > 200) {
      const now = Date.now();
      for (const [k, v] of cache) {
        if (v.expiresAt < now) cache.delete(k);
      }
    }

    return audioResponse(buf);
  } catch {
    return new Response(JSON.stringify({ error: "Error TTS" }), { status: 502 });
  }
}

function audioResponse(buf: Buffer) {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buf.byteLength),
      "Cache-Control": "public, max-age=1800",
    },
  });
}