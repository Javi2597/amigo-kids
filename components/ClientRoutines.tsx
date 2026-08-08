"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";
import RoutineSteps from "@/components/RoutineSteps";
import { routinesMorning, routinesNight } from "@/lib/content";

export function ClientRoutines() {
  const [tab, setTab] = useState<"morning" | "night">("morning");
  const steps = tab === "morning" ? routinesMorning : routinesNight;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-ink">📅 Rutinas</h1>
        <div className="w-20" />
      </div>

      <div className="flex gap-3">
        <TabButton active={tab === "morning"} onClick={() => setTab("morning")}>
          🌞 Mañana
        </TabButton>
        <TabButton active={tab === "night"} onClick={() => setTab("night")}>
          🌙 Noche
        </TabButton>
      </div>

      <RoutineSteps steps={steps} />

      <p className="text-center text-base text-soft">
        Toca cada tarea cuando la termines. ¡Tino te anima!
      </p>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 rounded-full px-4 py-3 text-xl font-bold transition-all active:scale-95",
        active
          ? "bg-mascot text-white shadow-[0_5px_0_#E86A33]"
          : "bg-surface text-ink shadow-soft",
      ].join(" ")}
    >
      {children}
    </button>
  );
}