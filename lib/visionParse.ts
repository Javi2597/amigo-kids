export type VisionResult = { safe: boolean; message: string };

/**
 * Parseo del JSON que devuelve el modelo de visión. Vive aparte de `vision.ts`
 * (que hace la llamada de red) para poder probarlo solo, sin claves ni fetch.
 *
 * Es fail-closed: cualquier cosa que no diga explícitamente `safe: true`
 * devuelve `safe: false`, y entonces la foto NO se describe.
 */
export function parseVisionResult(rawText: string): VisionResult {
  const text = rawText
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
  // Sin mensaje no hay nada que decir del contenido de la foto.
  if (!message) return { safe: false, message: "" };
  return { safe, message };
}
