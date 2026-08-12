import type { ProgressState } from "./progress";

/** Precisión (0..1) de un tema, o null si aún no hay intentos. */
export function topicAccuracy(
  state: ProgressState,
  topic: string
): number | null {
  const p = state.topics[topic];
  if (!p || p.correct + p.wrong === 0) return null;
  return p.correct / (p.correct + p.wrong);
}

/**
 * Temas sugeridos por Tino: primero los que más necesita repasar
 * (menor precisión con intentos), luego los que aún no exploró,
 * y por último los demás.
 */
export function suggestTopics(
  state: ProgressState,
  allIds: string[],
  count = 3
): string[] {
  const weak = allIds
    .filter((t) => {
      const acc = topicAccuracy(state, t);
      return acc !== null && acc < 0.6;
    })
    .sort((a, b) => (topicAccuracy(state, a) ?? 0) - (topicAccuracy(state, b) ?? 0));
  const unseen = allIds.filter((t) => {
    const p = state.topics[t];
    return !p || p.seen === 0;
  });
  const rest = allIds.filter((t) => !weak.includes(t) && !unseen.includes(t));
  return [...weak, ...unseen, ...rest].slice(0, count);
}

/** Temas con precisión baja y con intentos (para avisar "repasa esto"). */
export function weakTopics(state: ProgressState, allIds: string[]): string[] {
  return allIds
    .filter((t) => {
      const acc = topicAccuracy(state, t);
      return acc !== null && acc < 0.6;
    })
    .sort((a, b) => (topicAccuracy(state, a) ?? 0) - (topicAccuracy(state, b) ?? 0))
    .slice(0, 2);
}
