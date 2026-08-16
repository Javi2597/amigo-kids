export type AiProvider = {
  id: string;
  baseUrl: string;
  apiKey: string;
  chatModel: string;
};

function envOr(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function getAIKey() {
  const key = envOr("AI_API_KEY");
  if (!key) throw new Error("Falta AI_API_KEY en .env");
  return key;
}

export function getAIBase() {
  return process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
}

export function getAIModel() {
  return process.env.AI_MODEL || "llama-3.3-70b-versatile";
}

export function getVisionBase() {
  return process.env.AI_VISION_BASE_URL || getAIBase();
}

export function getVisionModel() {
  return process.env.AI_VISION_MODEL || "qwen/qwen3.6-27b";
}

const DEFAULT_FALLBACK_BASE =
  "https://generativelanguage.googleapis.com/v1beta/openai/";
const DEFAULT_FALLBACK_MODEL = "gemini-3.1-flash-lite";

/**
 * Lista ordenada de proveedores de chat. Primero Groq (obligatorio si hay
 * key) y después el respaldo opcional (p. ej. Gemini free). Si no hay ninguna
 * key configurada, la lista queda vacía y la ruta responde con Tino local.
 */
export function getProviders(): AiProvider[] {
  const providers: AiProvider[] = [];

  const primaryKey = envOr("AI_API_KEY");
  if (primaryKey) {
    providers.push({
      id: "groq",
      baseUrl: getAIBase(),
      apiKey: primaryKey,
      chatModel: getAIModel(),
    });
  }

  const fallbackKey = envOr("FALLBACK_AI_API_KEY");
  if (fallbackKey) {
    providers.push({
      id: "fallback",
      baseUrl: envOr("FALLBACK_AI_BASE_URL") || DEFAULT_FALLBACK_BASE,
      apiKey: fallbackKey,
      chatModel: envOr("FALLBACK_AI_MODEL") || DEFAULT_FALLBACK_MODEL,
    });
  }

  return providers;
}