"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import { completeProject } from "@/lib/progress";
import { sfx } from "@/lib/sounds";
import Celebration from "@/components/Celebration";

export default function ProjectPlayer({ project }: { project: Project }) {
  const [step, setStep] = useState(-1);
  const [celebrate, setCelebrate] = useState(false);

  const total = project.steps.length;
  const isIntro = step === -1;
  const isCreate = step >= total;

  const start = () => {
    sfx.star();
    setStep(0);
  };

  const next = () => {
    if (step >= total - 1) {
      sfx.fanfare();
      completeProject(project.id);
      setCelebrate(true);
      setStep(total);
    } else {
      sfx.star();
      setStep((s) => s + 1);
    }
  };

  const stepData = isCreate ? null : project.steps[step];

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full rounded-3xl bg-cream p-5 text-center">
        <p className="text-5xl">{project.emoji}</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">{project.title}</h2>
      </div>

      {isIntro && (
        <div className="flex flex-col items-center gap-4">
          <p className="rounded-3xl bg-white p-5 text-xl font-semibold text-ink shadow-soft">
            {project.intro}
          </p>
          <button
            onClick={start}
            className="min-h-tap w-full rounded-full bg-mascot px-6 py-4 text-xl font-bold text-white shadow-[0_5px_0_#E86A33] transition-all active:translate-y-1 active:shadow-none"
          >
            🔬 Empezar a investigar
          </button>
        </div>
      )}

      {stepData && (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="w-full rounded-3xl bg-white p-5 shadow-soft">
            <p className="text-center text-5xl">{stepData.emoji}</p>
            <p className="mt-3 text-center text-2xl font-bold text-ink">
              {stepData.title}
            </p>
            <p className="mt-2 text-center text-lg font-semibold text-soft">
              {stepData.text}
            </p>
          </div>
          <div className="flex w-full items-center justify-between">
            <span className="rounded-full bg-cream px-3 py-1 text-base font-bold text-ink">
              Paso {step + 1} de {total}
            </span>
            <button
              onClick={next}
              className="min-h-tap rounded-full bg-sky px-6 py-3 text-xl font-bold text-white shadow-[0_5px_0_#3C97D6] transition-all active:translate-y-1 active:shadow-none"
            >
              {step >= total - 1 ? "¡Crear!" : "Siguiente →"}
            </button>
          </div>
        </div>
      )}

      {isCreate && (
        <div className="flex w-full flex-col items-center gap-4">
          <p className="rounded-3xl bg-lemon p-5 text-center text-2xl font-bold text-ink">
            🎨 ¡Tu proyecto!
          </p>
          <p className="w-full rounded-3xl bg-white p-5 text-xl font-semibold text-ink shadow-soft">
            {project.create}
          </p>
          <button
            onClick={() => {
              setStep(-1);
              setCelebrate(false);
            }}
            className="min-h-tap w-full rounded-full bg-mascot px-6 py-4 text-xl font-bold text-white shadow-[0_5px_0_#E86A33] transition-all active:translate-y-1 active:shadow-none"
          >
            Hacer otro proyecto
          </button>
          <Link
            href="/proyectos"
            className="min-h-tap w-full rounded-full bg-cream px-6 py-4 text-center text-xl font-bold text-ink active:scale-95"
          >
            Volver a los proyectos
          </Link>
        </div>
      )}

      <Celebration
        show={celebrate}
        text="¡Proyecto completado! 🔬"
        onDone={() => setCelebrate(false)}
      />
    </div>
  );
}
