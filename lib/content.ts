export type Item = { word: string; emoji: string; tip?: string };
export type TopicContent = { prompt: string; items: Item[] };
export type LevelId = 1 | 2 | 3 | 4;

export type TopicId =
  | "colores"
  | "numeros"
  | "animales"
  | "formas"
  | "letras"
  | "lectura"
  | "mates"
  | "vocabulario"
  | "clima"
  | "espacio"
  | "transportes"
  | "profesiones"
  | "naturaleza"
  | "musica"
  | "comidas"
  | "deportes"
  | "emociones";

/** Edad del niño (3-12) → nivel automático */
export const AGE_BANDS: { min: number; max: number; level: LevelId }[] = [
  { min: 3, max: 4, level: 1 },
  { min: 5, max: 6, level: 2 },
  { min: 7, max: 9, level: 3 },
  { min: 10, max: 12, level: 4 },
];

export function ageToLevel(age: number): LevelId {
  for (const band of AGE_BANDS) {
    if (age >= band.min && age <= band.max) return band.level;
  }
  return age < 3 ? 1 : 4;
}

export const LEVEL_INFO: Record<LevelId, { label: string; range: string }> = {
  1: { label: "Peques", range: "3–4 años" },
  2: { label: "Infantil", range: "5–6 años" },
  3: { label: "Grandes", range: "7–9 años" },
  4: { label: "Expertos", range: "10–12 años" },
};

export const TOPIC_INFO: Record<
  TopicId,
  { title: string; emoji: string; color: string }
> = {
  colores: { title: "Colores", emoji: "🎨", color: "coral" },
  numeros: { title: "Números", emoji: "🔢", color: "sky" },
  animales: { title: "Animales", emoji: "🦁", color: "mint" },
  formas: { title: "Formas", emoji: "⭐", color: "lemon" },
  letras: { title: "Letras", emoji: "🔤", color: "lavender" },
  lectura: { title: "Lectura", emoji: "📖", color: "mascot" },
  mates: { title: "Mate", emoji: "➕", color: "coral" },
  vocabulario: { title: "Palabras", emoji: "🏠", color: "sky" },
  clima: { title: "Clima", emoji: "☀️", color: "sky" },
  espacio: { title: "Espacio", emoji: "🚀", color: "lavender" },
  transportes: { title: "Transportes", emoji: "🚗", color: "mint" },
  profesiones: { title: "Profesiones", emoji: "🧑‍⚕️", color: "coral" },
  naturaleza: { title: "Naturaleza", emoji: "🌳", color: "lemon" },
  musica: { title: "Música", emoji: "🎵", color: "mascot" },
  comidas: { title: "Comidas", emoji: "🍎", color: "coral" },
  deportes: { title: "Deportes", emoji: "⚽", color: "lemon" },
  emociones: { title: "Emociones", emoji: "😊", color: "mascot" },
};

export const ALL_TOPIC_IDS = Object.keys(TOPIC_INFO) as TopicId[];

// ===== Colores =====
const corL1: Item[] = [
  { word: "Rojo", emoji: "🔴" },
  { word: "Azul", emoji: "🔵" },
  { word: "Verde", emoji: "🟢" },
  { word: "Amarillo", emoji: "🟡" },
];
const corL2: Item[] = [
  { word: "Naranja", emoji: "🟠" },
  { word: "Rosado", emoji: "🩷" },
  { word: "Morado", emoji: "🟣" },
  { word: "Blanco", emoji: "⚪" },
  { word: "Negro", emoji: "⚫" },
];
const corL3: Item[] = [
  { word: "Marrón", emoji: "🟤" },
  { word: "Gris", emoji: "🩶" },
  { word: "Dorado", emoji: "🏆" },
  { word: "Plateado", emoji: "🥈" },
];
const corL4: Item[] = [
  { word: "Turquesa", emoji: "💎" },
  { word: "Lila", emoji: "💜" },
  { word: "Esmeralda", emoji: "💚" },
  { word: "Borgoña", emoji: "🍒" },
  { word: "Beige", emoji: "☕" },
  { word: "Celeste", emoji: "🩵" },
];

// ===== Números =====
const numL1: Item[] = [
  { word: "Cero", emoji: "0️⃣", tip: "El cero es el número que no cuenta nada." },
  { word: "Uno", emoji: "1️⃣" },
  { word: "Dos", emoji: "2️⃣" },
  { word: "Tres", emoji: "3️⃣" },
  { word: "Cuatro", emoji: "4️⃣" },
  { word: "Cinco", emoji: "5️⃣" },
];
const numL2: Item[] = [
  { word: "Seis", emoji: "6️⃣" },
  { word: "Siete", emoji: "7️⃣" },
  { word: "Ocho", emoji: "8️⃣" },
  { word: "Nueve", emoji: "9️⃣" },
  { word: "Diez", emoji: "🔟" },
];
const numL3: Item[] = [
  { word: "Once", emoji: "1️⃣1️⃣" },
  { word: "Doce", emoji: "1️⃣2️⃣" },
  { word: "Quince", emoji: "1️⃣5️⃣" },
  { word: "Diecinueve", emoji: "1️⃣9️⃣" },
  { word: "Veinte", emoji: "2️⃣0️⃣" },
  { word: "Treinta", emoji: "3️⃣0️⃣" },
  { word: "Cincuenta", emoji: "5️⃣0️⃣" },
  { word: "Cien", emoji: "1️⃣0️⃣0️⃣" },
];
const numL4: Item[] = [
  { word: "Doscientos", emoji: "2️⃣0️⃣0️⃣" },
  { word: "Quinientos", emoji: "5️⃣0️⃣0️⃣" },
  { word: "Mil", emoji: "1️⃣0️⃣0️⃣0️⃣" },
  { word: "Decena", emoji: "🔟" },
  { word: "Unidad", emoji: "1️⃣" },
  { word: "Primero", emoji: "🥇" },
  { word: "Segundo", emoji: "🥈" },
  { word: "Tercero", emoji: "🥉" },
];

// ===== Animales =====
const aniL1: Item[] = [
  { word: "Perro", emoji: "🐶" },
  { word: "Gato", emoji: "🐱" },
  { word: "Pez", emoji: "🐟" },
  { word: "Pato", emoji: "🦆" },
  { word: "Pollito", emoji: "🐤" },
  { word: "Vaca", emoji: "🐮" },
  { word: "Cerdo", emoji: "🐷" },
];
const aniL2: Item[] = [
  { word: "Zorro", emoji: "🦊" },
  { word: "Oso", emoji: "🐻" },
  { word: "León", emoji: "🦁" },
  { word: "Elefante", emoji: "🐘" },
  { word: "Mariposa", emoji: "🦋" },
  { word: "Rana", emoji: "🐸" },
  { word: "Conejo", emoji: "🐰" },
  { word: "Caballo", emoji: "🐴" },
  { word: "Gallina", emoji: "🐔", tip: "La gallina pone huevos." },
  { word: "Cabra", emoji: "🐐", tip: "La cabra salta por las montañas." },
  { word: "Pavo", emoji: "🦃", tip: "El pavo abre su cola como un abanico." },
];
const aniL3: Item[] = [
  { word: "Delfín", emoji: "🐬" },
  { word: "Pingüino", emoji: "🐧" },
  { word: "Águila", emoji: "🦅" },
  { word: "Camaleón", emoji: "🦎" },
  { word: "Tiburón", emoji: "🦈" },
  { word: "Ardilla", emoji: "🐿️" },
  { word: "Panda", emoji: "🐼" },
  { word: "Cocodrilo", emoji: "🐊", tip: "El cocodrilo vive en ríos cálidos." },
  { word: "Hipopótamo", emoji: "🦛", tip: "El hipopótamo vive dentro del agua." },
  { word: "Rinoceronte", emoji: "🦏", tip: "El rinoceronte tiene un cuerno en la nariz." },
];
const aniL4: Item[] = [
  { word: "Murciélago", emoji: "🦇" },
  { word: "Tortuga", emoji: "🐢" },
  { word: "Jirafa", emoji: "🦒" },
  { word: "Cebra", emoji: "🦓" },
  { word: "Cangrejo", emoji: "🦀" },
  { word: "Flamenco", emoji: "🦩" },
  { word: "Camello", emoji: "🐪" },
  { word: "Pulpo", emoji: "🐙" },
  { word: "Guepardo", emoji: "🐆", tip: "El guepardo es el animal más veloz de tierra." },
  { word: "Suricato", emoji: "🐿️" },
];

// ===== Formas =====
const forL1: Item[] = [
  { word: "Círculo", emoji: "⭕" },
  { word: "Cuadrado", emoji: "🟨" },
  { word: "Triángulo", emoji: "🔺" },
];
const forL2: Item[] = [
  { word: "Rectángulo", emoji: "🟥" },
  { word: "Óvalo", emoji: "🥚" },
  { word: "Rombo", emoji: "💠" },
  { word: "Corazón", emoji: "❤️" },
  { word: "Estrella", emoji: "⭐" },
  { word: "Luna", emoji: "🌙" },
  { word: "Cruz", emoji: "➕" },
];
const forL3: Item[] = [
  { word: "Pentágono", emoji: "⭐" },
  { word: "Hexágono", emoji: "✡️" },
  { word: "Espiral", emoji: "🌀" },
  { word: "Diamante", emoji: "🔷" },
];
const forL4: Item[] = [
  { word: "Esfera", emoji: "⚽" },
  { word: "Cilindro", emoji: "🥫" },
  { word: "Cono", emoji: "🍦" },
  { word: "Cubo", emoji: "🎲" },
  { word: "Pirámide", emoji: "📐" },
  { word: "Prisma", emoji: "🧊" },
];

// ===== Letras =====
const letL1: Item[] = [
  { word: "A", emoji: "🅰️" },
  { word: "B", emoji: "🅱️" },
  { word: "C", emoji: "C" },
  { word: "D", emoji: "D" },
  { word: "E", emoji: "E" },
];
const letL2: Item[] = [
  { word: "F", emoji: "F" },
  { word: "G", emoji: "G" },
  { word: "H", emoji: "H" },
  { word: "I", emoji: "I" },
  { word: "J", emoji: "J" },
];
const letL3: Item[] = [
  { word: "K", emoji: "K" },
  { word: "L", emoji: "L" },
  { word: "M", emoji: "M" },
  { word: "N", emoji: "N" },
  { word: "Ñ", emoji: "Ñ" },
  { word: "O", emoji: "O" },
  { word: "P", emoji: "P" },
  { word: "Q", emoji: "Q" },
  { word: "R", emoji: "R" },
  { word: "S", emoji: "S" },
  { word: "T", emoji: "T" },
  { word: "U", emoji: "U" },
  { word: "V", emoji: "V" },
  { word: "W", emoji: "W" },
  { word: "X", emoji: "X" },
  { word: "Y", emoji: "Y" },
  { word: "Z", emoji: "Z" },
];
const letL4: Item[] = [
  { word: "Mamá", emoji: "👩" },
  { word: "Papá", emoji: "👨" },
  { word: "Sol", emoji: "☀️" },
  { word: "Luna", emoji: "🌙" },
  { word: "Pan", emoji: "🍞" },
  { word: "Casa", emoji: "🏠" },
  { word: "Gato", emoji: "🐱" },
  { word: "Pato", emoji: "🦆" },
  { word: "Rana", emoji: "🐸" },
  { word: "Mano", emoji: "🖐️" },
];

// ===== Lectura =====
const lecL1: Item[] = [
  { word: "A", emoji: "🍎" },
  { word: "E", emoji: "🐘" },
  { word: "I", emoji: "🍦" },
  { word: "O", emoji: "🐻" },
  { word: "U", emoji: "🦄" },
];
const lecL2: Item[] = [
  { word: "Mamá", emoji: "👩" },
  { word: "Papá", emoji: "👨" },
  { word: "Sol", emoji: "☀️" },
  { word: "Pan", emoji: "🍞" },
  { word: "Luna", emoji: "🌙" },
  { word: "Nido", emoji: "🐦" },
];
const lecL3: Item[] = [
  { word: "Escuela", emoji: "🏫" },
  { word: "Mariposa", emoji: "🦋" },
  { word: "Helado", emoji: "🍦" },
  { word: "Ventana", emoji: "🪟" },
  { word: "Teléfono", emoji: "📞" },
  { word: "Abeja", emoji: "🐝" },
  { word: "Dinosaurio", emoji: "🦕" },
  { word: "Computadora", emoji: "💻" },
];
const lecL4: Item[] = [
  { word: "El gato come pescado", emoji: "🐱🍣" },
  { word: "La luna brilla de noche", emoji: "🌙" },
  { word: "Voy a la escuela en tren", emoji: "🚂" },
  { word: "Me gusta pintar un arcoíris", emoji: "🌈" },
  { word: "El delfín nada en el mar", emoji: "🐬" },
  { word: "Los planetas giran al sol", emoji: "🪐" },
];

// ===== Mate =====
const matL1: Item[] = [
  { word: "Uno", emoji: "⚽" },
  { word: "Dos", emoji: "⚽⚽" },
  { word: "Tres", emoji: "⚽⚽⚽" },
  { word: "Cuatro", emoji: "⚽⚽⚽⚽" },
  { word: "Cinco", emoji: "⚽⚽⚽⚽⚽" },
];
const matL2: Item[] = [
  { word: "Seis", emoji: "🍎🍎🍎🍎🍎🍎" },
  { word: "Siete", emoji: "✋✌️" },
  { word: "Ocho", emoji: "🐙" },
  { word: "Nueve", emoji: "✋✌️✌️" },
  { word: "Diez", emoji: "✋✋" },
];
const matL3: Item[] = [
  { word: "2 + 3 = 5", emoji: "🍎🍎🍎🍎🍎" },
  { word: "4 + 1 = 5", emoji: "🍓🍓🍓🍓🍓" },
  { word: "4 + 4 = 8", emoji: "🍇🍇🍇🍇🍇🍇🍇🍇" },
  { word: "7 - 2 = 5", emoji: "🍊🍊🍊🍊🍊" },
  { word: "9 - 3 = 6", emoji: "🍋🍋🍋🍋🍋🍋" },
];
const matL4: Item[] = [
  { word: "12 + 8 = 20", emoji: "🔢" },
  { word: "30 - 12 = 18", emoji: "1️⃣8️⃣" },
  { word: "4 × 5 = 20", emoji: "✖️" },
  { word: "3 × 3 = 9", emoji: "🟨" },
  { word: "100 ÷ 2 = 50", emoji: "💯" },
];

// ===== Vocabulario =====
const vocL1: Item[] = [
  { word: "Mamá", emoji: "👩" },
  { word: "Papá", emoji: "👨" },
  { word: "Abuelita", emoji: "👵" },
  { word: "Abuelito", emoji: "👴" },
  { word: "Bebé", emoji: "👶" },
  { word: "Hermana", emoji: "👧" },
  { word: "Hermano", emoji: "👦" },
  { word: "Ojos", emoji: "👀" },
  { word: "Nariz", emoji: "👃" },
  { word: "Boca", emoji: "👄" },
  { word: "Orejas", emoji: "👂" },
  { word: "Manos", emoji: "🖐️" },
  { word: "Pies", emoji: "🦶" },
];
const vocL2: Item[] = [
  { word: "Camisa", emoji: "👕" },
  { word: "Pantalón", emoji: "👖" },
  { word: "Vestido", emoji: "👗" },
  { word: "Zapatos", emoji: "👟" },
  { word: "Sombrero", emoji: "👒" },
  { word: "Manzana", emoji: "🍎" },
  { word: "Naranja", emoji: "🍊" },
  { word: "Leche", emoji: "🥛" },
  { word: "Pan", emoji: "🍞" },
  { word: "Queso", emoji: "🧀" },
];
const vocL3: Item[] = [
  { word: "Mesa", emoji: "🍽️" },
  { word: "Silla", emoji: "🪑" },
  { word: "Puerta", emoji: "🚪" },
  { word: "Ventana", emoji: "🪟" },
  { word: "Cocina", emoji: "🍳" },
  { word: "Baño", emoji: "🧼" },
  { word: "Escalera", emoji: "🪜" },
  { word: "Televisión", emoji: "📺" },
];
const vocL4: Item[] = [
  { word: "Refrigerador", emoji: "🧊" },
  { word: "Lavadora", emoji: "🧺" },
  { word: "Computadora", emoji: "💻" },
  { word: "Tablet", emoji: "📱" },
  { word: "Bicicleta", emoji: "🚲" },
  { word: "Autobús", emoji: "🚌" },
  { word: "Avión", emoji: "✈️" },
  { word: "Barco", emoji: "🚢" },
  { word: "Biblioteca", emoji: "📚" },
  { word: "Columpio", emoji: "🛝" },
  { word: "Supermercado", emoji: "🛒", tip: "El supermercado tiene comida y cosas para la casa." },
  { word: "Jardín", emoji: "🌷", tip: "En el jardín crecen flores y plantas." },
];

// ===== Clima =====
const cliL1: Item[] = [
  { word: "Sol", emoji: "☀️" },
  { word: "Lluvia", emoji: "🌧️" },
  { word: "Nube", emoji: "☁️" },
  { word: "Nieve", emoji: "❄️" },
  { word: "Viento", emoji: "💨" },
];
const cliL2: Item[] = [
  { word: "Arcoíris", emoji: "🌈" },
  { word: "Tormenta", emoji: "⛈️" },
  { word: "Relámpago", emoji: "⚡" },
  { word: "Nublado", emoji: "🌥️" },
  { word: "Frío", emoji: "🥶" },
  { word: "Calor", emoji: "🥵", tip: "Cuando hace calor brillamos como el sol." },
];
const cliL3: Item[] = [
  { word: "Primavera", emoji: "🌸" },
  { word: "Verano", emoji: "🏖️" },
  { word: "Otoño", emoji: "🍂" },
  { word: "Invierno", emoji: "⛄" },
];
const cliL4: Item[] = [
  { word: "Huracán", emoji: "🌀" },
  { word: "Sequía", emoji: "🏜️" },
  { word: "Granizo", emoji: "🧊" },
  { word: "Termómetro", emoji: "🌡️" },
  { word: "Niebla", emoji: "🌫️", tip: "La niebla es una nube que toca el suelo." },
];

// ===== Espacio =====
const espL1: Item[] = [
  { word: "Sol", emoji: "🌞" },
  { word: "Luna", emoji: "🌙" },
  { word: "Estrella", emoji: "⭐" },
  { word: "Cohete", emoji: "🚀" },
];
const espL2: Item[] = [
  { word: "Planeta", emoji: "🪐" },
  { word: "Tierra", emoji: "🌍" },
  { word: "Astronauta", emoji: "🧑‍🚀" },
  { word: "Telescopio", emoji: "🔭" },
];
const espL3: Item[] = [
  { word: "Mercurio", emoji: "⚪" },
  { word: "Venus", emoji: "🟡" },
  { word: "Marte", emoji: "🔴" },
  { word: "Júpiter", emoji: "🟤" },
  { word: "Saturno", emoji: "🪐" },
  { word: "Urano", emoji: "🩵" },
  { word: "Neptuno", emoji: "🔵" },
  { word: "Plutón", emoji: "🪐", tip: "Plutón es un planeta enano y muy frío." },
];
const espL4: Item[] = [
  { word: "Fase lunar", emoji: "🌗" },
  { word: "Órbita", emoji: "☄️" },
  { word: "Galaxia", emoji: "🌌" },
  { word: "Asteroides", emoji: "💫" },
  { word: "Estación espacial", emoji: "🛰️", tip: "Ahí viven los astronautas en el espacio." },
];

// ===== Transportes =====
const traL1: Item[] = [
  { word: "Auto", emoji: "🚗" },
  { word: "Tren", emoji: "🚂" },
  { word: "Bicicleta", emoji: "🚲" },
  { word: "Avión", emoji: "✈️" },
];
const traL2: Item[] = [
  { word: "Barco", emoji: "🚢" },
  { word: "Autobús", emoji: "🚌" },
  { word: "Moto", emoji: "🏍️" },
  { word: "Tractor", emoji: "🚜" },
];
const traL3: Item[] = [
  { word: "Metro", emoji: "🚇" },
  { word: "Taxi", emoji: "🚕" },
  { word: "Helicóptero", emoji: "🚁" },
  { word: "Crucero", emoji: "⛴️" },
];
const traL4: Item[] = [
  { word: "Semáforo", emoji: "🚦" },
  { word: "Estación de tren", emoji: "🚉" },
  { word: "Camión", emoji: "🚛" },
  { word: "Puente", emoji: "🌉" },
];

// ===== Profesiones =====
const proL1: Item[] = [
  { word: "Doctor", emoji: "🧑‍⚕️" },
  { word: "Cocinero", emoji: "👨‍🍳" },
  { word: "Maestro", emoji: "🧑‍🏫" },
  { word: "Bombero", emoji: "👨‍🚒" },
  { word: "Peinadora", emoji: "💇", tip: "La peinadora corta el pelo y hace peinados." },
];
const proL2: Item[] = [
  { word: "Veterinaria", emoji: "🐾" },
  { word: "Policía", emoji: "👮" },
  { word: "Panadero", emoji: "🥖" },
  { word: "Camarero", emoji: "🍽️" },
  { word: "Carpintera", emoji: "🪚", tip: "La carpintera construye muebles de madera." },
];
const proL3: Item[] = [
  { word: "Dentista", emoji: "🦷" },
  { word: "Ingeniera", emoji: "🏗️" },
  { word: "Arquitecto", emoji: "🏛️" },
  { word: "Granjero", emoji: "🌾" },
];
const proL4: Item[] = [
  { word: "Astronauta", emoji: "🧑‍🚀" },
  { word: "Exploradora", emoji: "🧭" },
  { word: "Jardinera", emoji: "🌱" },
  { word: "Música", emoji: "🎻" },
  { word: "Directora", emoji: "🎬" },
  { word: "Programadora", emoji: "💻", tip: "Crea juegos y aplicaciones en la computadora." },
];

// ===== Naturaleza =====
const natL1: Item[] = [
  { word: "Árbol", emoji: "🌳" },
  { word: "Flor", emoji: "🌷" },
  { word: "Río", emoji: "🏞️" },
  { word: "Montaña", emoji: "⛰️" },
  { word: "Mar", emoji: "🌊" },
];
const natL2: Item[] = [
  { word: "Desierto", emoji: "🏜️" },
  { word: "Selva", emoji: "🌴" },
  { word: "Bosque", emoji: "🌲" },
  { word: "Lago", emoji: "🛶" },
  { word: "Volcán", emoji: "🌋", tip: "De un volcán sale piedra derretida muy caliente." },
];
const natL3: Item[] = [
  { word: "Pradera", emoji: "🌾" },
  { word: "Arrecife de coral", emoji: "🪸" },
  { word: "Tundra", emoji: "🐻‍❄️" },
  { word: "Estanque", emoji: "🐸" },
];
const natL4: Item[] = [
  { word: "Ciclo del agua", emoji: "💧" },
  { word: "Fotosíntesis", emoji: "🌿" },
  { word: "Reciclaje", emoji: "♻️" },
  { word: "Huerto", emoji: "🥬" },
  { word: "Ecosistema", emoji: "🌍", tip: "Todos los seres vivos de un lugar forman un ecosistema." },
  { word: "Cadena alimentaria", emoji: "🦊", tip: "El pez come plantas, y el pez lo come otro animal." },
];

// ===== Música =====
const musL1: Item[] = [
  { word: "Tambor", emoji: "🥁" },
  { word: "Guitarra", emoji: "🎸" },
  { word: "Piano", emoji: "🎹" },
  { word: "Flauta", emoji: "🪈" },
];
const musL2: Item[] = [
  { word: "Violín", emoji: "🎻" },
  { word: "Batería", emoji: "🥁" },
  { word: "Maracas", emoji: "🪅" },
  { word: "Micrófono", emoji: "🎤" },
];
const musL3: Item[] = [
  { word: "Notas", emoji: "🎵" },
  { word: "Escala", emoji: "🎼" },
  { word: "Orquesta", emoji: "🎷" },
  { word: "Director", emoji: "🎬" },
  { word: "Saxofón", emoji: "🎷", tip: "El saxofón suena en el jazz y en las bandas." },
  { word: "Corneta", emoji: "🎺", tip: "¡Taratatá! La corneta es metálica y brillante." },
];
const musL4: Item[] = [
  { word: "Rock", emoji: "🎸" },
  { word: "Jazz", emoji: "🎷" },
  { word: "Salsa", emoji: "💃" },
  { word: "Clásica", emoji: "🎻" },
  { word: "Cumbia", emoji: "🪇", tip: "La cumbia se baila con pasos alegres." },
];

// ===== Comidas =====
const comL1: Item[] = [
  { word: "Manzana", emoji: "🍎" },
  { word: "Plátano", emoji: "🍌" },
  { word: "Uvas", emoji: "🍇" },
  { word: "Fresa", emoji: "🍓" },
];
const comL2: Item[] = [
  { word: "Zanahoria", emoji: "🥕" },
  { word: "Tomate", emoji: "🍅" },
  { word: "Brócoli", emoji: "🥦" },
  { word: "Lechuga", emoji: "🥬" },
  { word: "Pepino", emoji: "🥒" },
];
const comL3: Item[] = [
  { word: "Sopa", emoji: "🥣" },
  { word: "Pasta", emoji: "🍝" },
  { word: "Pizza", emoji: "🍕" },
  { word: "Ensalada", emoji: "🥗" },
];
const comL4: Item[] = [
  { word: "Frutas", emoji: "🍎" },
  { word: "Verduras", emoji: "🥦" },
  { word: "Lácteos", emoji: "🥛" },
  { word: "Cereales", emoji: "🌾" },
  { word: "Proteínas", emoji: "🍗" },
];

// ===== Deportes =====
const depL1: Item[] = [
  { word: "Pelota", emoji: "⚽" },
  { word: "Correr", emoji: "🏃" },
  { word: "Nadar", emoji: "🏊" },
  { word: "Bailar", emoji: "💃" },
];
const depL2: Item[] = [
  { word: "Baloncesto", emoji: "🏀" },
  { word: "Gimnasia", emoji: "🤸" },
  { word: "Ciclismo", emoji: "🚴" },
  { word: "Tenis", emoji: "🎾" },
];
const depL3: Item[] = [
  { word: "Vóleibol", emoji: "🏐" },
  { word: "Béisbol", emoji: "⚾" },
  { word: "Rugby", emoji: "🏉" },
  { word: "Estadio", emoji: "🏟️" },
];
const depL4: Item[] = [
  { word: "Trofeo", emoji: "🏆" },
  { word: "Esquí", emoji: "⛷️" },
  { word: "Patín", emoji: "🛼" },
  { word: "Tabla", emoji: "🏄" },
];

// ===== Emociones =====
const emoL1: Item[] = [
  { word: "Alegre", emoji: "😄", tip: "¡Qué feliz que estoy!" },
  { word: "Triste", emoji: "😢" },
  { word: "Enojado", emoji: "😠" },
  { word: "Asustado", emoji: "😨" },
];
const emoL2: Item[] = [
  { word: "Sorprendido", emoji: "😮" },
  { word: "Aburrido", emoji: "😐" },
  { word: "Tímido", emoji: "😊" },
  { word: "Cansado", emoji: "😪" },
];
const emoL3: Item[] = [
  { word: "Emocionado", emoji: "🥳", tip: "¡Qué alegría tan grande!" },
  { word: "Preocupado", emoji: "😟" },
  { word: "Confiado", emoji: "😎" },
  { word: "Frustrado", emoji: "😤" },
];
const emoL4: Item[] = [
  { word: "Agradecido", emoji: "🙏", tip: "Es bueno decir gracias." },
  { word: "Cariñoso", emoji: "🥰", tip: "Los besitos y abrazos son cariño." },
  { word: "Orgulloso", emoji: "😄" },
  { word: "Empatía", emoji: "💛", tip: "Empatía es sentir lo que otros sienten." },
  { word: "Calma", emoji: "🧘", tip: "Respira lento y te sentirás en calma." },
];

const PROMPTS: Record<TopicId, string> = {
  colores: "¿Qué color es este?",
  numeros: "¿Qué número ves?",
  animales: "¿Qué animalito es este?",
  formas: "¿Qué forma es esta?",
  letras: "¿Qué letra es esta?",
  lectura: "¿Qué dice aquí?",
  mates: "Resuelve y di el resultado",
  vocabulario: "¿Qué palabra es esta?",
  clima: "¿Qué tiempo hace hoy?",
  espacio: "¿Qué ves en el cielo?",
  transportes: "¿Qué medio de transporte es?",
  profesiones: "¿Quién es esta persona?",
  naturaleza: "¿Qué es esto en la naturaleza?",
  musica: "¿Qué instrumento es?",
  comidas: "¿De qué alimento se trata?",
  deportes: "¿Qué deporte es?",
  emociones: "¿Cómo te sientes hoy?",
};

const build = (base: Item[], extras: Item[]): Item[] => [
  ...base,
  ...extras,
];

export const TOPIC_CONTENT: Record<TopicId, Record<LevelId, TopicContent>> = {
  colores: {
    1: { prompt: PROMPTS.colores, items: corL1 },
    2: { prompt: PROMPTS.colores, items: build(corL1, corL2) },
    3: { prompt: PROMPTS.colores, items: build(corL1, [...corL2, ...corL3]) },
    4: { prompt: PROMPTS.colores, items: build(corL1, [...corL2, ...corL3, ...corL4]) },
  },
  numeros: {
    1: { prompt: PROMPTS.numeros, items: numL1 },
    2: { prompt: PROMPTS.numeros, items: build(numL1, numL2) },
    3: { prompt: PROMPTS.numeros, items: build(numL1, [...numL2, ...numL3]) },
    4: { prompt: PROMPTS.numeros, items: build(numL1, [...numL2, ...numL3, ...numL4]) },
  },
  animales: {
    1: { prompt: PROMPTS.animales, items: aniL1 },
    2: { prompt: PROMPTS.animales, items: build(aniL1, aniL2) },
    3: { prompt: PROMPTS.animales, items: build(aniL1, [...aniL2, ...aniL3]) },
    4: { prompt: PROMPTS.animales, items: build(aniL1, [...aniL2, ...aniL3, ...aniL4]) },
  },
  formas: {
    1: { prompt: PROMPTS.formas, items: forL1 },
    2: { prompt: PROMPTS.formas, items: build(forL1, forL2) },
    3: { prompt: PROMPTS.formas, items: build(forL1, [...forL2, ...forL3]) },
    4: { prompt: PROMPTS.formas, items: build(forL1, [...forL2, ...forL3, ...forL4]) },
  },
  letras: {
    1: { prompt: PROMPTS.letras, items: letL1 },
    2: { prompt: PROMPTS.letras, items: build(letL1, letL2) },
    3: { prompt: PROMPTS.letras, items: build(letL1, [...letL2, ...letL3]) },
    4: { prompt: PROMPTS.letras, items: build(letL1, [...letL2, ...letL3, ...letL4]) },
  },
  lectura: {
    1: { prompt: "¡Aprende las vocales!", items: lecL1 },
    2: { prompt: PROMPTS.lectura, items: lecL2 },
    3: { prompt: PROMPTS.lectura, items: lecL3 },
    4: { prompt: "¿Qué oración dice?", items: lecL4 },
  },
  mates: {
    1: { prompt: "¿Cuántos ves?", items: matL1 },
    2: { prompt: "Cuenta con Tino", items: matL2 },
    3: { prompt: "Suma y resta", items: matL3 },
    4: { prompt: "Operaciones", items: matL4 },
  },
  vocabulario: {
    1: { prompt: PROMPTS.vocabulario, items: vocL1 },
    2: { prompt: PROMPTS.vocabulario, items: build(vocL1, vocL2) },
    3: { prompt: PROMPTS.vocabulario, items: build(vocL1, [...vocL2, ...vocL3]) },
    4: { prompt: PROMPTS.vocabulario, items: build(vocL1, [...vocL2, ...vocL3, ...vocL4]) },
  },
  clima: {
    1: { prompt: PROMPTS.clima, items: cliL1 },
    2: { prompt: PROMPTS.clima, items: build(cliL1, cliL2) },
    3: { prompt: PROMPTS.clima, items: build(cliL1, [...cliL2, ...cliL3]) },
    4: { prompt: PROMPTS.clima, items: build(cliL1, [...cliL2, ...cliL3, ...cliL4]) },
  },
  espacio: {
    1: { prompt: PROMPTS.espacio, items: espL1 },
    2: { prompt: PROMPTS.espacio, items: build(espL1, espL2) },
    3: { prompt: PROMPTS.espacio, items: build(espL1, [...espL2, ...espL3]) },
    4: { prompt: "¡Misión espacial!", items: build(espL1, [...espL2, ...espL3, ...espL4]) },
  },
  transportes: {
    1: { prompt: PROMPTS.transportes, items: traL1 },
    2: { prompt: PROMPTS.transportes, items: build(traL1, traL2) },
    3: { prompt: PROMPTS.transportes, items: build(traL1, [...traL2, ...traL3]) },
    4: { prompt: PROMPTS.transportes, items: build(traL1, [...traL2, ...traL3, ...traL4]) },
  },
  profesiones: {
    1: { prompt: PROMPTS.profesiones, items: proL1 },
    2: { prompt: PROMPTS.profesiones, items: build(proL1, proL2) },
    3: { prompt: PROMPTS.profesiones, items: build(proL1, [...proL2, ...proL3]) },
    4: { prompt: PROMPTS.profesiones, items: build(proL1, [...proL2, ...proL3, ...proL4]) },
  },
  naturaleza: {
    1: { prompt: PROMPTS.naturaleza, items: natL1 },
    2: { prompt: PROMPTS.naturaleza, items: build(natL1, natL2) },
    3: { prompt: PROMPTS.naturaleza, items: build(natL1, [...natL2, ...natL3]) },
    4: { prompt: PROMPTS.naturaleza, items: build(natL1, [...natL2, ...natL3, ...natL4]) },
  },
  musica: {
    1: { prompt: PROMPTS.musica, items: musL1 },
    2: { prompt: PROMPTS.musica, items: build(musL1, musL2) },
    3: { prompt: PROMPTS.musica, items: build(musL1, [...musL2, ...musL3]) },
    4: { prompt: PROMPTS.musica, items: build(musL1, [...musL2, ...musL3, ...musL4]) },
  },
  comidas: {
    1: { prompt: PROMPTS.comidas, items: comL1 },
    2: { prompt: PROMPTS.comidas, items: build(comL1, comL2) },
    3: { prompt: PROMPTS.comidas, items: build(comL1, [...comL2, ...comL3]) },
    4: { prompt: "¿Qué grupo alimenticio?", items: build(comL1, [...comL2, ...comL3, ...comL4]) },
  },
  deportes: {
    1: { prompt: PROMPTS.deportes, items: depL1 },
    2: { prompt: PROMPTS.deportes, items: build(depL1, depL2) },
    3: { prompt: PROMPTS.deportes, items: build(depL1, [...depL2, ...depL3]) },
    4: { prompt: PROMPTS.deportes, items: build(depL1, [...depL2, ...depL3, ...depL4]) },
  },
  emociones: {
    1: { prompt: "¿Cómo te sientes hoy?", items: emoL1 },
    2: { prompt: "¿Cómo te sientes hoy?", items: build(emoL1, emoL2) },
    3: { prompt: "¿Cómo te sientes hoy?", items: build(emoL1, [...emoL2, ...emoL3]) },
    4: { prompt: "¿Qué emoción sientes y por qué?", items: build(emoL1, [...emoL2, ...emoL3, ...emoL4]) },
  },
};

export function getTopicContent(
  topic: string,
  level: LevelId
): TopicContent {
  const any = topic as TopicId;
  const mod = TOPIC_CONTENT[any];
  if (!mod) return { prompt: "¿Qué quieres ver?", items: [{ word: "Hola", emoji: "👋" }] };
  return mod[level] ?? mod[2];
}

export function getTopicItems(topic: string, level: LevelId): Item[] {
  return getTopicContent(topic, level).items;
}

// ===== Quizzes por nivel =====
export type Quiz = {
  question: string;
  options: string[];
  answer: string;
  emoji: string;
};

const QUIZ_L1: Quiz[] = [
  { question: "¿Cuál es el perro?", options: ["🐱", "🐶", "🐮"], answer: "🐶", emoji: "🐶" },
  { question: "¿Qué color es este círculo?", options: ["Rojo", "Azul", "Verde"], answer: "Rojo", emoji: "🔴" },
  { question: "¿Cuántos puntos hay? ⚽⚽⚽", options: ["Dos", "Tres", "Cuatro"], answer: "Tres", emoji: "⚽⚽⚽" },
  { question: "¿Qué forma es esta?", options: ["Círculo", "Cuadrado", "Triángulo"], answer: "Círculo", emoji: "⭕" },
  { question: "¿Cuál es el azul?", options: ["🔵", "🟢", "🟡"], answer: "🔵", emoji: "🟡" },
  { question: "¿Con qué letra empieza Abeja?", options: ["A", "B", "C"], answer: "A", emoji: "🐝" },
];

const QUIZ_L2: Quiz[] = [
  { question: "¿Cuántos pájaros hay? 🐦🐦🐦🐦🐦", options: ["Cuatro", "Cinco", "Seis"], answer: "Cinco", emoji: "🐦🐦🐦🐦🐦" },
  { question: "¿Cuál es la mariposa?", options: ["🐶", "🦋", "🐸"], answer: "🦋", emoji: "🦋" },
  { question: "¿Cuál es el triángulo?", options: ["⭕", "🔺", "💠"], answer: "🔺", emoji: "🔺" },
  { question: "¿Qué palabra empieza con G?", options: ["Gato", "Perro", "Pato"], answer: "Gato", emoji: "🐱" },
  { question: "¿De qué color es la manzana?", options: ["Verde", "Rojo", "Azul"], answer: "Rojo", emoji: "🍎" },
];

const QUIZ_L3: Quiz[] = [
  { question: "¿Cuánto es 6 + 4?", options: ["9", "10", "11"], answer: "10", emoji: "🔟" },
  { question: "¿Cuál es el pingüino?", options: ["🐬", "🐧", "🦅"], answer: "🐧", emoji: "🐧" },
  { question: "¿Qué número es 15?", options: ["Quince", "Cincuenta", "Cien"], answer: "Quince", emoji: "1️⃣5️⃣" },
  { question: "¿Qué forma tiene 6 lados?", options: ["Pentágono", "Hexágono", "Óvalo"], answer: "Hexágono", emoji: "✡️" },
  { question: "¿Cómo se escribe 'escuela'?", options: ["escuela", "escula", "esquela"], answer: "escuela", emoji: "🏫" },
];

const QUIZ_L4: Quiz[] = [
  { question: "¿Cuánto es 12 + 8?", options: ["18", "20", "22"], answer: "20", emoji: "➕" },
  { question: "¿Qué animal es un mamífero que vuela?", options: ["Murciélago", "Águila", "Pez"], answer: "Murciélago", emoji: "🦇" },
  { question: "¿Cuál es redonda y se puede inflar?", options: ["Cubo", "Esfera", "Cono"], answer: "Esfera", emoji: "⚽" },
  { question: "¿Qué oración está bien escrita?", options: ["el gato come pescado", "El gato come pescado", "El gato come pesacado"], answer: "El gato come pescado", emoji: "🐱🍽️" },
  { question: "¿Cuánto es 600 − 100?", options: ["400", "500", "600"], answer: "500", emoji: "💯" },
  { question: "¿Cuánto es 3 × 3?", options: ["6", "9", "12"], answer: "9", emoji: "🟨" },
];

const QUIZ_L1_EXTRA: Quiz[] = [
  { question: "¿Cuál es el cohete?", options: ["🚀", "🚗", "🚲"], answer: "🚀", emoji: "🚀" },
  { question: "¿Qué fruta es esta?", options: ["🍎", "🥕", "🥦"], answer: "🍎", emoji: "🍎" },
  { question: "¿Qué se usa para no mojarse?", options: ["Paraguas", "Sombrero", "Bufanda"], answer: "Paraguas", emoji: "☂️" },
  { question: "¿Qué animal hace miau?", options: ["🐶", "🐱", "🐮"], answer: "🐱", emoji: "🐱" },
  { question: "¿Cómo te sientes cuando sonríes?", options: ["Alegre", "Triste", "Enojado"], answer: "Alegre", emoji: "😄" },
  { question: "¿Cuál es el número cero?", options: ["1️⃣", "0️⃣", "2️⃣"], answer: "0️⃣", emoji: "0️⃣" },
];

const QUIZ_L2_EXTRA: Quiz[] = [
  { question: "¿Cuál es el arcoíris?", options: ["🌈", "☁️", "⛈️"], answer: "🌈", emoji: "🌈" },
  { question: "¿En qué planeta vivimos?", options: ["Marte", "Tierra", "Sol"], answer: "Tierra", emoji: "🌍" },
  { question: "¿Qué medio de transporte vuela?", options: ["Avión", "Barco", "Auto"], answer: "Avión", emoji: "✈️" },
  { question: "¿Qué animal pone huevos?", options: ["Gallina", "Perro", "Tiburón"], answer: "Gallina", emoji: "🐔" },
  { question: "¿Cómo te sientes cuando algo te sorprende?", options: ["Sorprendido", "Aburrido", "Cansado"], answer: "Sorprendido", emoji: "😮" },
  { question: "¿Quién corta y arregla el pelo?", options: ["Peinadora", "Cocinero", "Bombero"], answer: "Peinadora", emoji: "💇" },
];

const QUIZ_L3_EXTRA: Quiz[] = [
  { question: "¿Cuál es el planeta anillado?", options: ["Saturno", "Marte", "Venus"], answer: "Saturno", emoji: "🪐" },
  { question: "¿Cuántos planetas hay en nuestro sistema solar?", options: ["8", "10", "12"], answer: "8", emoji: "🔢" },
  { question: "¿Qué estación hace mucho frío?", options: ["Invierno", "Verano", "Primavera"], answer: "Invierno", emoji: "⛄" },
  { question: "¿Quién cuida los dientes?", options: ["Dentista", "Cocinero", "Maestro"], answer: "Dentista", emoji: "🦷" },
  { question: "¿Cuál de estos es un planeta enano?", options: ["Plutón", "Júpiter", "Neptuno"], answer: "Plutón", emoji: "🪐" },
  { question: "¿Qué animal es un gran reptil de río?", options: ["Cocodrilo", "Gato", "Conejo"], answer: "Cocodrilo", emoji: "🐊" },
  { question: "¿Qué instrumento es de metal y suena fuerte?", options: ["Corneta", "Piano", "Guitarra"], answer: "Corneta", emoji: "🎺" },
  { question: "¿Cómo te sientes en tu cumpleaños?", options: ["Emocionado", "Triste", "Aburrido"], answer: "Emocionado", emoji: "🥳" },
];

const QUIZ_L4_EXTRA: Quiz[] = [
  { question: "¿Qué grupo alimenticio es el queso?", options: ["Lácteos", "Cereales", "Carne"], answer: "Lácteos", emoji: "🧀" },
  { question: "¿De qué color es Neptuno?", options: ["Azul", "Rojo", "Amarillo"], answer: "Azul", emoji: "🔵" },
  { question: "¿Qué instrumento toca el violín en una orquesta?", options: ["Cuerdas", "Viento", "Percusión"], answer: "Cuerdas", emoji: "🎻" },
  { question: "¿Cuántas ruedas tiene una bicicleta?", options: ["2", "4", "6"], answer: "2", emoji: "🚲" },
  { question: "¿Quién crea juegos en la computadora?", options: ["Programadora", "Granjero", "Panadero"], answer: "Programadora", emoji: "💻" },
  { question: "¿De dónde sale la piedra derretida?", options: ["Volcán", "Río", "Lago"], answer: "Volcán", emoji: "🌋" },
  { question: "¿Sentir lo que siente otra persona se llama?", options: ["Empatía", "Calma", "Sorpresa"], answer: "Empatía", emoji: "💛" },
  { question: "¿Cuánto es 40 ÷ 8?", options: ["5", "8", "6"], answer: "5", emoji: "🔢" },
];

export const QUIZZES_BY_LEVEL: Record<LevelId, Quiz[]> = {
  1: [...QUIZ_L1, ...QUIZ_L1_EXTRA],
  2: [...QUIZ_L2, ...QUIZ_L2_EXTRA],
  3: [...QUIZ_L3, ...QUIZ_L3_EXTRA],
  4: [...QUIZ_L4, ...QUIZ_L4_EXTRA],
};

export function getLevelQuizzes(level: LevelId): Quiz[] {
  return QUIZZES_BY_LEVEL[level] ?? QUIZ_L1;
}

// ===== Rutinas (siguen igual, universales) =====
export const routinesMorning: {
  id: string;
  label: string;
  emoji: string;
  cue: string;
}[] = [
  { id: "m1", label: "Me despierto", emoji: "🌅", cue: "¡Buenos días! A despertarse con energía." },
  { id: "m2", label: "Lavo mi cara", emoji: "💦", cue: "¡Muy bien! Agüita para la carita." },
  { id: "m3", label: "Me cepillo los dientes", emoji: "🪥", cue: "¡Dientes brillantes! Cepilla arriba y abajo." },
  { id: "m4", label: "Desayuno", emoji: "🥣", cue: "¡Qué rico desayuno para crecer fuerte!" },
  { id: "m5", label: "Me visto", emoji: "👕", cue: "¡A vestirse como un súper héroe!" },
];

export const routinesNight: {
  id: string;
  label: string;
  emoji: string;
  cue: string;
}[] = [
  { id: "n1", label: "Recojo mis juguetes", emoji: "🧸", cue: "¡Cada juguete a su casita!" },
  { id: "n2", label: "Me baño", emoji: "🛁", cue: "¡Agüita tibia y burbujas!" },
  { id: "n3", label: "Me cepillo los dientes", emoji: "🪥", cue: "¡Dientes limpios y felices!" },
  { id: "n4", label: "Me pongo el pijama", emoji: "🌙", cue: "¡Pijama suavecito!" },
  { id: "n5", label: "Cuento de buenas noches", emoji: "📖", cue: "Una historia tranquila para soñar." },
  { id: "n6", label: "A dormir", emoji: "💤", cue: "Que descanses. Mañana jugamos más." },
];