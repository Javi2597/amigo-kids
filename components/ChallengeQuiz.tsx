"use client";

import { useEffect, useState } from "react";
import { getLevelQuizzes } from "@/lib/content";
import { recordChallengeWin } from "@/lib/progress";
import { sfx } from "@/lib/sounds";
import Celebration from "@/components/Celebration";

const TIME_PER_QUESTION = 15;
const QUESTIONS = 5;
const TO_WIN = 3;

export default function ChallengeQuiz() {
  const questions = getLevelQuizzes(4).slice(0, QUESTIONS);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const current = questions[index];

  const finish = (finalScore: number) => {
    setFinished(true);
    if (finalScore >= TO_WIN) {
      recordChallengeWin();
      sfx.fanfare();
      setCelebrate(true);
    }
  };

  const goNext = (correct: boolean) => {
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    if (correct) sfx.correct();
    else sfx.wrong();
    if (index + 1 >= questions.length) {
      finish(newScore);
    } else {
      setIndex((i) => i + 1);
    }
  };

  useEffect(() => {
    if (finished) return;
    setTimeLeft(TIME_PER_QUESTION);
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [index, finished]);

  useEffect(() => {
    if (timeLeft <= 0 && !finished) goNext(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, finished]);

  const reset = () => {
    setIndex(0);
    setScore(0);
    setFinished(false);
    setCelebrate(false);
    setTimeLeft(TIME_PER_QUESTION);
  };

  const won = score >= TO_WIN;

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-center text-2xl font-bold text-ink">⏱️ Reto contra el tiempo</p>

      {!finished ? (
        <>
          <div className="flex w-full items-center justify-between">
            <span className="rounded-full bg-cream px-3 py-1 text-base font-bold text-ink">
              Pregunta {index + 1} de {QUESTIONS}
            </span>
            <span
              className={[
                "flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white shadow-soft",
                timeLeft <= 5 ? "bg-coral" : "bg-sky",
              ].join(" ")}
            >
              {timeLeft}
            </span>
          </div>

          <p className="text-3xl font-semibold text-ink">{current.emoji}</p>
          <p className="min-h-14 text-center text-xl font-semibold text-ink">
            {current.question}
          </p>

          <div className="grid w-full grid-cols-1 gap-3">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => !finished && goNext(opt === current.answer)}
                className="min-h-tap w-full rounded-2xl bg-sky px-4 py-4 text-xl font-bold text-white shadow-[0_5px_0_#3C97D6] transition-all active:translate-y-1 active:shadow-none"
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-soft">
            ⭐ {score} correctas · necesitas {TO_WIN} para ganar
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-7xl">{won ? "🏆" : "💪"}</div>
          <p className="text-2xl font-bold text-ink">
            {won
              ? `¡Ganaste con ${score} de ${QUESTIONS}!`
              : `Llegaste a ${score} de ${QUESTIONS}. ¡A intentarlo otra vez!`}
          </p>
          <button
            onClick={reset}
            className="rounded-full bg-mascot px-8 py-4 text-2xl font-bold text-white shadow-[0_6px_0_#E86A33] active:translate-y-1 active:shadow-none transition-all"
          >
            Otro reto
          </button>
        </div>
      )}

      <Celebration
        show={celebrate}
        text="¡Reto superado! ⚡"
        onDone={() => setCelebrate(false)}
      />
    </div>
  );
}
