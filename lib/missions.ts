export type MissionDef = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
};

/** Misiones diarias (se reinician cada día; el progreso las completa automáticamente). */
export const DAILY_MISSIONS: MissionDef[] = [
  {
    id: "quiz3",
    emoji: "❓",
    title: "Responde 3 preguntas",
    desc: "Acierta 3 preguntas hoy.",
  },
  {
    id: "tema",
    emoji: "🎨",
    title: "Repasa un tema",
    desc: "Mira una tarjeta en Aprender.",
  },
  {
    id: "rutina",
    emoji: "📅",
    title: "Completa una rutina",
    desc: "Termina todos los pasos de una rutina.",
  },
  {
    id: "historia",
    emoji: "📖",
    title: "Lee una historia",
    desc: "Termina una aventura.",
  },
];
