export type RiskLevel = "none" | "sensitive" | "danger";
export type SafetyCategory =
  | "self_harm"
  | "abuse"
  | "violence"
  | "fear"
  | "family"
  | "health"
  | "personal_data"
  | null;

export type SafetyResult = {
  risk: RiskLevel;
  category: SafetyCategory;
  matches: string[];
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Categorías de RIESGO ALTO: se interceptan SIEMPRE con guion fijo, sin
// llamar al modelo. El niño jamás recibe una respuesta generada libremente.
const DANGER_PATTERNS: Record<"self_harm" | "abuse" | "violence", string[]> = {
  self_harm: [
    "quiero morir",
    "me quiero matar",
    "quiero matarme",
    "matarme",
    "suicidio",
    "hacerme daño",
    "herirme",
    "lastimarme",
    "no quiero vivir",
    "cortarme",
    "terminar con mi vida",
    "no despertar",
  ],
  abuse: [
    "me toco",
    "me toca",
    "me hacen cosas",
    "me hace cosas",
    "me hacen cosas raras",
    "no me deja contarlo",
    "prohibido contar",
    "secreto que no puedo contar",
    "me pide que no diga",
    "abuso",
    "me hace algo malo",
  ],
  violence: [
    "me quieren matar",
    "me pegan fuerte",
    "me pegan",
    "me pego fuerte",
    "violencia",
    "hay un arma",
    "una pistola",
    "un cuchillo",
    "secuestro",
    "me raptaron",
    "me quieren raptar",
  ],
};

// Temas sensibles: Tino consuela, sugiere hablar con un adulto y continúa.
const SENSITIVE_PATTERNS: Record<"fear" | "family" | "health", string[]> = {
  fear: [
    "tengo miedo",
    "asustado",
    "asustada",
    "me asusta",
    "no quiero dormir",
    "monstruo",
    "monstruos",
    "fantasma",
    "oscuro",
    "oscuridad",
    "pesadilla",
    "terror",
  ],
  family: [
    "papas pelean",
    "papa y mama pelean",
    "se van a separar",
    "divorcio",
    "discuten todo",
    "gritan en casa",
    "no me hablan",
    "me siento solo en casa",
    "extrano en casa",
    "echo de menos a",
  ],
  health: [
    "me duele",
    "me duele mucho",
    "estoy enfermo",
    "tengo fiebre",
    "vomito",
    "me siento mal",
    "me cai y me hice",
    "me sangra",
    "no respiro bien",
  ],
};

const PERSONAL_DATA_PATTERNS = [
  "direccion",
  "donde vivo",
  "mi escuela se llama",
  "numero de telefono",
  "contrasena",
  "mi clave",
  "mi nombre completo",
  "apellido de mi familia",
];

function matching(words: readonly string[], haystack: string): string[] {
  return words.filter((w) => haystack.includes(w));
}

export function classifyChildText(text: string): SafetyResult {
  const hay = normalize(text);
  const matches: string[] = [];

  for (const cat of ["self_harm", "abuse", "violence"] as const) {
    const hit = matching(DANGER_PATTERNS[cat], hay);
    if (hit.length > 0) {
      matches.push(...hit, `categoria: ${cat}`);
      return { risk: "danger", category: cat, matches };
    }
  }

  for (const cat of ["fear", "family", "health"] as const) {
    const hit = matching(SENSITIVE_PATTERNS[cat], hay);
    if (hit.length > 0) {
      matches.push(...hit, `categoria: ${cat}`);
      return { risk: "sensitive", category: cat, matches };
    }
  }

  const personal = matching(PERSONAL_DATA_PATTERNS, hay);
  if (personal.length > 0) {
    return { risk: "sensitive", category: "personal_data", matches: personal };
  }

  return { risk: "none", category: null, matches: [] };
}

/** Guion fijo (seguro) según el riesgo detectado. Siempre remite a un adulto. */
export function safetyScript(result: SafetyResult): string {
  if (result.risk === "danger") {
    return (
      "Eso se siente muy fuerte para mí también. Un adulto de confianza " +
      "(mamá, papá, abuelos o algún maestro) puede ayudarte y escucharte mejor " +
      "que yo. Porfa, cuéntaselo. Yo estoy aquí para acompañarte. ¿Qué te hace " +
      "sentir un poquito mejor?"
    );
  }
  if (result.category === "personal_data") {
    return (
      "Tu dirección, tu nombre completo o tus secretos son solo para tu familia. " +
      "No los digas en la app. Si algún adulto te los pide, cuéntale a tus papás. " +
      "¿Seguimos con algo más divertido?"
    );
  }
  return (
    "Entiendo que eso sea complicado, y está bien sentirlo. Un adulto de confianza " +
    "es quien puede abrazarte y ayudarte mejor. Yo te escucho siempre. ¿Qué tal si " +
    "hacemos algo lindo para sentirnos en calma?"
  );
}

// Trabas determinista para la RESPUESTA de Tino (sin llamada al modelo).
const REPLY_BLOCKERS = [
  "matalo",
  "matenlos",
  "muerte",
  "suicid",
  "sexo",
  "sexual",
  "pene",
  "vulva",
  "drogas",
  "heroina",
  "pistola",
  "cuchillo",
  "violencia",
  "autolesion",
  "hazte daño",
  "dame tu direccion",
  "dame tu secret",
];

export function isReplySafe(reply: string): boolean {
  const hay = normalize(reply);
  return !REPLY_BLOCKERS.some((w) => hay.includes(w));
}

export const UNSAFE_REPLY_FALLBACK =
  "Esa no es una respuesta para nosotros. Mejor hablemos de algo lindo, " +
  "como un color, un animal, o lo que más te guste. ¿En qué quieres seguir?";