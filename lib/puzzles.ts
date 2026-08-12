export type SeqPuzzle = {
  id: string;
  title: string;
  emoji: string;
  items: string[];
};

export type SortItem = { label: string; emoji: string; bucket: number };

export type SortPuzzle = {
  id: string;
  title: string;
  emoji: string;
  prompt: string;
  buckets: string[];
  items: SortItem[];
};

export const SEQUENCES: SeqPuzzle[] = [
  { id: "cuenta123", title: "Cuenta del 1 al 3", emoji: "🔢", items: ["1️⃣", "2️⃣", "3️⃣"] },
  { id: "cuenta456", title: "Del 4 al 6", emoji: "4️⃣", items: ["4️⃣", "5️⃣", "6️⃣"] },
  { id: "semilla", title: "De la semilla a la flor", emoji: "🌱", items: ["🌱", "🌿", "🌷"] },
  { id: "huevo", title: "¿Qué pasa primero?", emoji: "🐣", items: ["🥚", "🐣", "🐤", "🐔"] },
  { id: "luna", title: "Las fases de la luna", emoji: "🌙", items: ["🌑", "🌒", "🌓", "🌕"] },
  { id: "dias", title: "Los días de la semana", emoji: "📅", items: ["Lun", "Mar", "Mié", "Jue", "Vie"] },
];

export const SORTING: SortPuzzle[] = [
  {
    id: "mar-tierra",
    title: "¿En el mar o en la tierra?",
    emoji: "🌊",
    prompt: "¿Dónde vive?",
    buckets: ["En el mar", "En la tierra"],
    items: [
      { label: "Delfín", emoji: "🐬", bucket: 0 },
      { label: "Pez", emoji: "🐠", bucket: 0 },
      { label: "Pulpo", emoji: "🐙", bucket: 0 },
      { label: "Cangrejo", emoji: "🦀", bucket: 0 },
      { label: "León", emoji: "🦁", bucket: 1 },
      { label: "Caballo", emoji: "🐎", bucket: 1 },
      { label: "Perro", emoji: "🐶", bucket: 1 },
      { label: "Tortuga de tierra", emoji: "🐢", bucket: 1 },
    ],
  },
  {
    id: "fruta-verdura",
    title: "¿Fruta o verdura?",
    emoji: "🍎",
    prompt: "¿Qué es?",
    buckets: ["Fruta", "Verdura"],
    items: [
      { label: "Manzana", emoji: "🍎", bucket: 0 },
      { label: "Plátano", emoji: "🍌", bucket: 0 },
      { label: "Fresa", emoji: "🍓", bucket: 0 },
      { label: "Uvas", emoji: "🍇", bucket: 0 },
      { label: "Zanahoria", emoji: "🥕", bucket: 1 },
      { label: "Brócoli", emoji: "🥦", bucket: 1 },
      { label: "Lechuga", emoji: "🥬", bucket: 1 },
      { label: "Pepino", emoji: "🥒", bucket: 1 },
    ],
  },
  {
    id: "dia-noche",
    title: "¿De día o de noche?",
    emoji: "🌞",
    prompt: "¿Cuándo lo ves?",
    buckets: ["De día", "De noche"],
    items: [
      { label: "Sol", emoji: "☀️", bucket: 0 },
      { label: "Arcoíris", emoji: "🌈", bucket: 0 },
      { label: "Playa", emoji: "🏖️", bucket: 0 },
      { label: "Luna", emoji: "🌙", bucket: 1 },
      { label: "Estrella", emoji: "⭐", bucket: 1 },
      { label: "Pijama", emoji: "🛏️", bucket: 1 },
    ],
  },
  {
    id: "vehiculos",
    title: "¿Vuela o rueda?",
    emoji: "✈️",
    prompt: "¿Cómo se mueve?",
    buckets: ["Vuela", "Rueda"],
    items: [
      { label: "Avión", emoji: "✈️", bucket: 0 },
      { label: "Helicóptero", emoji: "🚁", bucket: 0 },
      { label: "Pájaro", emoji: "🐦", bucket: 0 },
      { label: "Auto", emoji: "🚗", bucket: 1 },
      { label: "Bicicleta", emoji: "🚲", bucket: 1 },
      { label: "Tren", emoji: "🚂", bucket: 1 },
    ],
  },
];
