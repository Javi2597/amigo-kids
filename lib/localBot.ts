import { classifyChildText, safetyScript } from "@/lib/safety";
import {
  TOPIC_INFO,
  getLevelQuizzes,
  getTopicContent,
  type LevelId,
  type TopicId,
} from "@/lib/content";

// Palabras clave para detectar el tema del mensaje del niño (sin IA).
const TOPIC_KEYWORDS: Record<TopicId, string[]> = {
  colores: ["color", "colores", "rojo", "azul", "verde", "amarillo", "naranja", "pintar", "pinta", "morado"],
  numeros: ["numero", "numeros", "contar", "cuenta", "contame", "numeral", "uno", "dos", "tres", "diez"],
  animales: ["animal", "animales", "perro", "gato", "zorro", "leon", "elefante", "vaca", "mascota", "pollito", "pez"],
  formas: ["forma", "formas", "circulo", "cuadrado", "triangulo", "figura", "figuras", "estrella", "corazon"],
  letras: ["letra", "letras", "abecedario", "alfabeto", "escribir", "vocales"],
  lectura: ["leer", "lectura", "cuento", "cuentos", "historia", "historias", "libro", "libros"],
  mates: ["sumar", "suma", "resta", "restar", "multiplicar", "mate", "matematica"],
  vocabulario: ["palabra", "palabras", "vocabulario", "decir", "nombres"],
  clima: ["clima", "lluvia", "sol", "nube", "nieve", "viento", "frio", "calor", "tiempo", "tormenta"],
  espacio: ["espacio", "planeta", "planetas", "luna", "estrella", "estrellas", "cohete", "astronauta", "marte", "saturno"],
  transportes: ["transporte", "transportes", "auto", "tren", "barco", "avion", "bicicleta", "moto", "colectivo"],
  profesiones: ["profesion", "profesiones", "doctor", "doctora", "maestro", "maestra", "bombero", "policia", "cocinero"],
  naturaleza: ["naturaleza", "arbol", "flor", "rio", "mar", "montana", "planta", "desierto", "bosque"],
  musica: ["musica", "cancion", "canciones", "cantar", "instrumento", "bailar", "baile"],
  comidas: ["comida", "comidas", "comer", "manzana", "fruta", "frutas", "verdura", "helado", "pizza", "pan"],
  deportes: ["deporte", "deportes", "jugar", "pelota", "correr", "futbol", "nadar", "dibujar"],
  emociones: ["emocion", "emociones", "alegre", "triste", "enojado", "asustado", "feliz", "sentir", "miedo"],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectTopic(input: string): TopicId | undefined {
  const hay = normalize(input);
  for (const entry of Object.entries(TOPIC_KEYWORDS) as [TopicId, string[]][]) {
    const [topic, words] = entry;
    if (words.some((w) => hay.includes(w))) return topic;
  }
  return undefined;
}

function topicFromTitle(title: string | undefined): TopicId | undefined {
  if (!title) return undefined;
  const hay = normalize(title);
  for (const entry of Object.entries(TOPIC_INFO) as [TopicId, { title: string }][]) {
    const [id, info] = entry;
    if (normalize(info.title) === hay) return id;
  }
  return undefined;
}

let counter = 0;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const GENERIC_REPLIES = [
  "Uy, ¡justo ahora mi conexión con el cielo se durmió! Pero no importa: mientras despierta, ¿jugamos con un animal 🦁, un número 🔢 o un color 🎨?",
  "Mi magia está recargando baterías, pero igual quiero jugar. Decime un animal que te guste y te cuento algo de él. 🦊",
  "¡Qué conversación tan linda! Tino está en modo tranquilo ahora mismo. ¿Qué preferís: un juego de contar, de colores o de adivinanzas?",
  "Hoy el viento se llevó mis respuestas, ¡pero quedé para jugar! Pensá en una fruta 🍎, un animal 🐶 o un planeta 🪐 y jugamos con eso.",
  "Mis ideas están de paseo, pero eso no me para. ¿Cuántos deditos tenés en las dos manos? Contalos y después te doy un reto. 🙌",
  "¡Estoy aquí y quiero jugar! Elegí un color y busco algo de ese color en mi memoria mágica. 🎨",
  "Tino está en modo descanso, pero los juegos no se toman siesta. ¿Vamos con una adivinanza de animales? 🐾",
  "¡Hola! Mi cabeza mágica se quedó sin chispa por un momento. Contame de tu juego favorito y hacemos algo divertido. 🧸",
];

const QUIZ_OPENERS = [
  "¡Buenísimo! Mientras mi conexión despierta, juguemos: ",
  "¡Me encanta eso! Vamos con un mini-juego: ",
  "¡Perfecto para jugar ahora! ",
];

const ITEM_OPENERS = [
  "¡Qué tema tan lindo! ",
  "¡Aprendamos un poquito! ",
  "Tino te enseña una cosa de este tema: ",
];

/**
 * Tino "local": responde sin IA cuando todos los proveedores fallan o cuando
 * el dispositivo está sin conexión. Usa el contenido educativo existente
 * (quizzes y tarjetas por nivel) y nunca baja el guard de seguridad.
 */
export function localTinoReply(
  input: string,
  opts: { age: number; level: LevelId; topic?: string }
): string {
  const safety = classifyChildText(input);
  if (safety.risk !== "none") {
    return safetyScript(safety);
  }

  counter = (counter + 1) % 1000;
  const seed = hash(input) + counter;

  const topic = detectTopic(input) ?? topicFromTitle(opts.topic);

  if (topic && TOPIC_INFO[topic]) {
    // Tema detectado → tarjeta de ESE tema (contenido real de la app).
    const content = getTopicContent(topic, opts.level);
    if (content.items.length > 0) {
      const it = content.items[seed % content.items.length];
      const opener = ITEM_OPENERS[seed % ITEM_OPENERS.length];
      return `${opener}${content.prompt} ${it.emoji} ${it.word}${
        it.tip ? ` — ${it.tip}` : ""
      }.`;
    }
  }

  const quizzes = getLevelQuizzes(opts.level);
  if (quizzes.length > 0) {
    const q = quizzes[seed % quizzes.length];
    const opener = QUIZ_OPENERS[seed % QUIZ_OPENERS.length];
    return `${opener}${q.question} ${q.options.join("  ")}  ¿Cuál elegís?`;
  }

  return GENERIC_REPLIES[seed % GENERIC_REPLIES.length];
}

/** Respuesta local cuando no se puede analizar una foto (sin describirla). */
export function localPhotoReply(topic?: string): string {
  return topic
    ? `¡Qué linda idea mostrarme algo de ${topic}! Justo ahora mis ojitos están descansando, pero si me contás qué es con palabras, seguimos jugando 🦊`
    : "¡Qué linda idea mostrarme algo! Justo ahora mis ojitos están descansando, pero si me contás qué es con palabras, seguimos jugando 🦊";
}