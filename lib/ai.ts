export function getAIKey() {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error("Falta AI_API_KEY en .env");
  return key;
}

export function getAIBase() {
  return process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
}

export function getAIModel() {
  return process.env.AI_MODEL || "llama-3.3-70b-versatile";
}

export function getSTTBase() {
  return process.env.AI_STT_BASE_URL || getAIBase();
}

export function getSTTModel() {
  return process.env.AI_STT_MODEL || "whisper-large-v3";
}

export function getVisionBase() {
  return process.env.AI_VISION_BASE_URL || getAIBase();
}

export function getVisionModel() {
  return process.env.AI_VISION_MODEL || "qwen/qwen3.6-27b";
}