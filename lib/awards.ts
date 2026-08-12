import type { ProgressState } from "./progress";

export type AwardDef = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  check: (s: ProgressState) => boolean;
};

export const BADGES: AwardDef[] = [
  {
    id: "first_star",
    emoji: "⭐",
    title: "Primera estrella",
    desc: "Gana tu primera estrella.",
    check: (s) => s.stars >= 1,
  },
  {
    id: "stars_10",
    emoji: "🌟",
    title: "10 estrellas",
    desc: "Junta 10 estrellas.",
    check: (s) => s.stars >= 10,
  },
  {
    id: "stars_25",
    emoji: "🏅",
    title: "25 estrellas",
    desc: "Junta 25 estrellas.",
    check: (s) => s.stars >= 25,
  },
  {
    id: "streak_3",
    emoji: "📅",
    title: "3 días seguidos",
    desc: "Juega 3 días sin saltarte.",
    check: (s) => s.streak >= 3,
  },
  {
    id: "quiz_streak_10",
    emoji: "🔥",
    title: "Racha de 10",
    desc: "Acierta 10 preguntas seguidas.",
    check: (s) => s.bestQuizStreak >= 10,
  },
  {
    id: "explorer",
    emoji: "📖",
    title: "Aventurero",
    desc: "Termina una historia.",
    check: (s) => s.completedStories.length >= 1,
  },
  {
    id: "mission_1",
    emoji: "✅",
    title: "Primera misión",
    desc: "Completa tu primera misión del día.",
    check: (s) => Object.values(s.missionsByDay).some((d) => d.length > 0),
  },
];

export const ACHIEVEMENTS: AwardDef[] = [
  {
    id: "quiz_master",
    emoji: "🧠",
    title: "Cerebro veloz",
    desc: "Acierta 30 preguntas en total.",
    check: (s) =>
      Object.values(s.topics).reduce((acc, p) => acc + p.correct, 0) >= 30,
  },
  {
    id: "perfect_topic",
    emoji: "💯",
    title: "Tema perfecto",
    desc: "Acierta 5 preguntas seguidas sin fallar de un tema.",
    check: (s) =>
      Object.values(s.topics).some((p) => p.correct >= 5 && p.wrong === 0),
  },
  {
    id: "streak_7",
    emoji: "🗓️",
    title: "7 días de racha",
    desc: "Juega 7 días seguidos.",
    check: (s) => s.streak >= 7,
  },
  {
    id: "stars_50",
    emoji: "👑",
    title: "50 estrellas",
    desc: "Junta 50 estrellas.",
    check: (s) => s.stars >= 50,
  },
  {
    id: "investigator",
    emoji: "🔬",
    title: "Investigador",
    desc: "Completa un proyecto.",
    check: (s) => s.completedProjects.length >= 1,
  },
  {
    id: "speedster",
    emoji: "⚡",
    title: "Velocista",
    desc: "Gana un reto contra el tiempo.",
    check: (s) => s.challengeWins >= 1,
  },
  {
    id: "storyteller",
    emoji: "🎭",
    title: "Cuentacuentos",
    desc: "Termina 2 historias.",
    check: (s) => s.completedStories.length >= 2,
  },
];

/**
 * Evalúa las condiciones y desbloquea medallas/logros pendientes.
 * Es pura (no toca la tienda) para poder llamarse dentro de commit().
 */
export function applyAwards(s: ProgressState): ProgressState {
  const newBadges = BADGES.filter((b) => !s.badges.includes(b.id) && b.check(s)).map(
    (b) => b.id
  );
  const newAch = ACHIEVEMENTS.filter(
    (a) => !s.achievements.includes(a.id) && a.check(s)
  ).map((a) => a.id);
  if (newBadges.length === 0 && newAch.length === 0) return s;
  return {
    ...s,
    badges: [...s.badges, ...newBadges],
    achievements: [...s.achievements, ...newAch],
    stars: s.stars + newBadges.length * 2 + newAch.length * 3,
  };
}
