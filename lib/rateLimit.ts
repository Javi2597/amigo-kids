import { type NextRequest } from "next/server";

type Bucket = { count: number; reset: number };

// Nota: en serverless (Vercel) el mapa vive por instancia, así que esto es una
// protección de "mejor esfuerzo" contra abuso básico, no un límite global duro.
const store = new Map<string, Bucket>();
const MAX_ENTRIES = 10_000;

function key(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : "unknown";
  return `${req.nextUrl.pathname}|${ip}`;
}

/** Devuelve false si la IP excede `max` peticiones en la ventana `windowMs`. */
export function rateLimit(req: NextRequest, max: number, windowMs: number): boolean {
  const k = key(req);
  const now = Date.now();

  if (store.size > MAX_ENTRIES) {
    const nowMs = Date.now();
    for (const [name, b] of store) {
      if (b.reset < nowMs) store.delete(name);
    }
  }

  const bucket = store.get(k);
  if (!bucket || bucket.reset < now) {
    store.set(k, { count: 1, reset: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= max;
}