export type StoryNode = {
  text: string;
  choices: { label: string; next: string }[];
};

export type Story = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  start: string;
  nodes: Record<string, StoryNode>;
};

export const STORIES: Story[] = [
  {
    id: "tesoro-isla",
    title: "El tesoro de la isla",
    emoji: "🏝️",
    color: "mint",
    start: "inicio",
    nodes: {
      inicio: {
        text: "Tu barco llegó a una isla misteriosa. Encuentras un mapa viejo con una X roja: ¡el tesoro! ¿Por dónde empiezas?",
        choices: [
          { label: "Ir a la playa", next: "playa" },
          { label: "Entrar a la selva", next: "selva" },
        ],
      },
      playa: {
        text: "En la playa, la arena brilla como el oro. Entre las olas hay una botella con un mensaje: «El tesoro está donde canta el pájaro rojo».",
        choices: [
          { label: "Buscar al pájaro rojo", next: "pajaro" },
          { label: "Mirar otra vez el mapa", next: "mapa" },
        ],
      },
      selva: {
        text: "En la selva, un mono curioso salta frente a ti y señala una fruta caída. Parece que quiere que se la des.",
        choices: [
          { label: "Darle la banana", next: "banana" },
          { label: "Seguir caminando", next: "rastro" },
        ],
      },
      pajaro: {
        text: "Sigues el canto hasta un árbol enorme. Un pájaro rojo está sobre una rama… ¡y debajo hay una puerta escondida!",
        choices: [{ label: "Abrir la puerta", next: "puerta" }],
      },
      mapa: {
        text: "El mapa esconde una línea punteada que llega hasta el árbol más alto de la isla. ¡Allá vamos!",
        choices: [{ label: "Caminar hacia el árbol alto", next: "pajaro" }],
      },
      banana: {
        text: "Le das la banana. El mono aplaude feliz y te muestra un camino secreto entre la vegetación.",
        choices: [{ label: "Seguir el camino", next: "camino" }],
      },
      rastro: {
        text: "Sigues caminando y encuentras unas huellas raras… pero se pierden en la arena. ¡Mejor vuelves a pensar!",
        choices: [{ label: "Volver a la playa", next: "playa" }],
      },
      camino: {
        text: "El camino secreto termina en una laguna de agua cristalina. En el fondo se ve algo brillante: ¡una llave dorada!",
        choices: [{ label: "Bucear por la llave", next: "llave" }],
      },
      puerta: {
        text: "La puerta se abre de golpe. ¡Adentro hay un cofre lleno de estrellas doradas! 🌟 Tino sabía que lo lograrías.",
        choices: [],
      },
      llave: {
        text: "Con la llave dorada abres un cofre bajo el agua… estaba lleno de conchas de cristal. ¡Un tesoro precioso, pequeño explorador!",
        choices: [],
      },
    },
  },
  {
    id: "dragon",
    title: "El dragón que no sabía rugir",
    emoji: "🐉",
    color: "coral",
    start: "inicio",
    nodes: {
      inicio: {
        text: "En Villa Pradera vive Draco, un dragón muy amable que nunca aprendió a rugir. Los otros dragones se ríen de él. ¿Lo ayudas?",
        choices: [
          { label: "Enseñarle a rugir", next: "practica" },
          { label: "Hablar con la alcaldesa", next: "alcaldesa" },
        ],
      },
      practica: {
        text: "Le muestras: infla el pecho, abre la boca… «¡R-R-RUUU!» Draco lo intenta, pero sale un sonido de estornudo gracioso.",
        choices: [
          { label: "Practicar otra vez", next: "practica2" },
          { label: "Probar con el eco", next: "eco" },
        ],
      },
      alcaldesa: {
        text: "La alcaldesa sonríe: «A Draco le encanta contar cuentos, pero nadie lo escucha». Te da una idea: ¡un festival de cuentos!",
        choices: [{ label: "Contarle la idea a Draco", next: "festival" }],
      },
      practica2: {
        text: "¡Casi! Draco saca un rugidito. Infla el pecho una vez más… y esta vez suena un rugido de verdad: ¡RAAAAAAR!",
        choices: [{ label: "Aplaudir muy fuerte", next: "rugido" }],
      },
      eco: {
        text: "Subes a la montaña del eco. Draco ruge y el eco se multiplica: ¡RUA-RUA-RUA! ¡Suena impresionante!",
        choices: [{ label: "Bajar a contarlo al pueblo", next: "rugido" }],
      },
      festival: {
        text: "En el festival, Draco cuenta una historia tan divertida que todos aplauden. ¡Ahora todos quieren ser sus amigos!",
        choices: [],
      },
      rugido: {
        text: "¡DRACO RUGIÓ! Todos los dragones lo escucharon y lo felicitaron. Draco descubrió que lo importante no es rugir fuerte, sino tener un gran corazón.",
        choices: [],
      },
    },
  },
];

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id);
}
