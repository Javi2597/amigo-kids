"use client";

import { useEffect, useReducer } from "react";
import { activeProfileId } from "./profiles";
import { applyAwards } from "./awards";

export type Performance = { seen: number; correct: number; wrong: number };

export type DailyCounts = Record<string, { correct: number; flashcards: number }>;

export type ProgressState = {
  stars: number;
  badges: string[];
  achievements: string[];
  missionsByDay: Record<string, string[]>;
  streak: number;
  lastActiveDay: string | null;
  topics: Record<string, Performance>;
  quizStreak: number;
  bestQuizStreak: number;
  completedStories: string[];
  completedProjects: string[];
  challengeWins: number;
  dailyCounts: DailyCounts;
};

const KEY_PREFIX = "tino-progress:";
const listeners = new Set<() => void>();

export function emptyState(): ProgressState {
  return {
    stars: 0,
    badges: [],
    achievements: [],
    missionsByDay: {},
    streak: 0,
    lastActiveDay: null,
    topics: {},
    quizStreak: 0,
    bestQuizStreak: 0,
    completedStories: [],
    completedProjects: [],
    challengeWins: 0,
    dailyCounts: {},
  };
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function dayOffsetKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

let cached: ProgressState = emptyState();
let cachedPid: string | null = null;

export function getState(): ProgressState {
  const pid = activeProfileId();
  if (cachedPid !== pid) {
    cachedPid = pid;
    cached = pid ? read<ProgressState>(KEY_PREFIX + pid, emptyState()) : emptyState();
  }
  return cached;
}

function commit(next: ProgressState) {
  const final = applyAwards(next);
  cached = final;
  const pid = activeProfileId();
  if (pid) write(KEY_PREFIX + pid, final);
  emitProgressChange();
}

export function emitProgressChange(): void {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function addStars(n: number) {
  const s = getState();
  commit({ ...s, stars: s.stars + n });
}

function bumpDaily<T>(s: ProgressState, key: "correct" | "flashcards"): ProgressState {
  const day = todayKey();
  const prev = s.dailyCounts[day] ?? { correct: 0, flashcards: 0 };
  return {
    ...s,
    dailyCounts: {
      ...s.dailyCounts,
      [day]: { ...prev, [key]: prev[key] + 1 },
    },
  };
}

/** Registra una respuesta de quiz y devuelve si fue correcta (para celebrar). */
export function recordQuiz(topic: string, correct: boolean): boolean {
  const s = getState();
  const perf = s.topics[topic] ?? { seen: 0, correct: 0, wrong: 0 };
  const nextPerf = correct
    ? { ...perf, correct: perf.correct + 1 }
    : { ...perf, wrong: perf.wrong + 1 };
  const quizStreak = correct ? s.quizStreak + 1 : 0;
  let next: ProgressState = {
    ...s,
    stars: s.stars + (correct ? 1 : 0),
    quizStreak,
    bestQuizStreak: Math.max(s.bestQuizStreak, quizStreak),
    topics: { ...s.topics, [topic]: nextPerf },
  };
  if (correct) next = bumpDaily(next, "correct");
  commit(next);
  const day = next.dailyCounts[todayKey()]?.correct ?? 0;
  if (correct && day >= 3) completeMission("quiz3");
  return correct;
}

export function recordFlashcardSeen(topic: string) {
  const s = getState();
  const perf = s.topics[topic] ?? { seen: 0, correct: 0, wrong: 0 };
  const next = bumpDaily(
    {
      ...s,
      topics: { ...s.topics, [topic]: { ...perf, seen: perf.seen + 1 } },
    },
    "flashcards"
  );
  commit(next);
  completeMission("tema");
}

export function touchDaily() {
  const s = getState();
  const today = todayKey();
  if (s.lastActiveDay === today) return;
  const streak = s.lastActiveDay === dayOffsetKey(-1) ? s.streak + 1 : 1;
  commit({ ...s, streak, lastActiveDay: today });
}

/** Marca una misión diaria como hecha y da +1 estrella. */
export function completeMission(id: string) {
  const s = getState();
  touchDaily();
  const refreshed = getState();
  const day = todayKey();
  const done = new Set(refreshed.missionsByDay[day] ?? []);
  if (done.has(id)) return;
  done.add(id);
  commit({
    ...refreshed,
    missionsByDay: { ...refreshed.missionsByDay, [day]: [...done] },
    stars: refreshed.stars + 1,
  });
}

export function missionsDoneToday(): string[] {
  const s = getState();
  return s.missionsByDay[todayKey()] ?? [];
}

export function completeStory(id: string) {
  const s = getState();
  if (s.completedStories.includes(id)) return;
  commit({
    ...s,
    completedStories: [...s.completedStories, id],
    stars: s.stars + 2,
  });
  completeMission("historia");
}

export function completeProject(id: string) {
  const s = getState();
  if (s.completedProjects.includes(id)) return;
  commit({
    ...s,
    completedProjects: [...s.completedProjects, id],
    stars: s.stars + 3,
  });
}

export function recordChallengeWin() {
  const s = getState();
  commit({ ...s, challengeWins: s.challengeWins + 1, stars: s.stars + 3 });
}

export function unlockBadge(id: string) {
  const s = getState();
  if (s.badges.includes(id)) return;
  commit({ ...s, badges: [...s.badges, id], stars: s.stars + 2 });
}

export function unlockAchievement(id: string) {
  const s = getState();
  if (s.achievements.includes(id)) return;
  commit({ ...s, achievements: [...s.achievements, id], stars: s.stars + 3 });
}

export function hasBadge(id: string): boolean {
  return getState().badges.includes(id);
}

export function hasAchievement(id: string): boolean {
  return getState().achievements.includes(id);
}

export function topicPerformance(topic: string): Performance {
  return getState().topics[topic] ?? { seen: 0, correct: 0, wrong: 0 };
}

/** Estrellas de un perfil sin cambiar el perfil activo (para la tabla local). */
export function readProfileStars(profileId: string): number {
  return read<ProgressState>(KEY_PREFIX + profileId, emptyState()).stars;
}

export function resetProgress() {
  const pid = activeProfileId();
  if (pid) {
    try {
      localStorage.removeItem(KEY_PREFIX + pid);
    } catch {}
  }
  commit(emptyState());
}

/** Hook reactivo: devuelve el progreso del perfil activo. */
export function useProgress(): ProgressState {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribe(force), []);
  return getState();
}
