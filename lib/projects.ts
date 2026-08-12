export type ProjectStep = { title: string; emoji: string; text: string };

export type Project = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  intro: string;
  steps: ProjectStep[];
  create: string;
};

export const PROJECTS: Project[] = [
  {
    id: "planetas",
    title: "Los planetas del sistema solar",
    emoji: "🪐",
    color: "lavender",
    intro:
      "¿Cuántos planetas hay? ¿Cuál es el más grande? Investiga con Tino y descubre datos sorprendentes.",
    steps: [
      {
        title: "¿Qué es un planeta?",
        emoji: "🌍",
        text: "Un planeta es una gran bola de roca o gas que gira alrededor del Sol. ¡Es nuestra casa, la Tierra!",
      },
      {
        title: "Nuestro vecindario",
        emoji: "🔭",
        text: "Hay 8 planetas. El más cercano al Sol es Mercurio y el más lejano es Neptuno. ¿Sabías que entre el Sol y Marte hay un cinturón de asteroides?",
      },
      {
        title: "El planeta gigante",
        emoji: "🟤",
        text: "Júpiter es el planeta más grande: ¡dentro cabrían más de 1.300 Tierras! Es una bola gigante de gas.",
      },
      {
        title: "Un planeta con anillos",
        emoji: "🪐",
        text: "Saturno tiene anillos de hielo y roca. Son enormes, ¡pero tan delgados que parecen papel desde lejos!",
      },
    ],
    create:
      "Crea tu propia noticia espacial: escribe o dibuja 3 datos sorprendentes sobre tu planeta favorito.",
  },
  {
    id: "ciclo-agua",
    title: "El viaje del agua",
    emoji: "💧",
    color: "sky",
    intro:
      "¿A dónde va el agua cuando llueve? Sigue a una gotita en su viaje alrededor del mundo.",
    steps: [
      {
        title: "El viaje de la gota",
        emoji: "☀️",
        text: "Una gotita vive en el mar. El Sol la calienta y se convierte en vapor que sube al cielo: eso se llama evaporación.",
      },
      {
        title: "Sube a las nubes",
        emoji: "☁️",
        text: "El vapor se junta en las nubes. Cuando hay muchísimo vapor, las gotitas se juntan y caen: condensación y precipitación.",
      },
      {
        title: "De vuelta a casa",
        emoji: "🏞️",
        text: "La lluvia corre por ríos y arroyos y regresa al mar. ¡El viaje de la gotita nunca termina!",
      },
    ],
    create:
      "Cuenta la aventura de la gotita en 4 dibujos o con frases cortas. ¡Compártela con tu familia!",
  },
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
