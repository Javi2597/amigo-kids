"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import { useSettings } from "@/lib/settings";
import { todaySeconds, addSeconds } from "@/lib/timeLimit";

export default function TimeLimitGate() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [seconds, setSeconds] = useState(() => todaySeconds());
  const lastTick = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === "visible") {
        const delta = Math.min(10, Math.round((now - lastTick.current) / 1000));
        if (delta > 0) addSeconds(delta);
      }
      lastTick.current = now;
      setSeconds(todaySeconds());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const limitSec = settings.timeLimitMin * 60;
  const remaining = Math.max(0, limitSec - seconds);
  const over = seconds >= limitSec;
  const nudge = !over && remaining <= 60;

  // El adulto necesita entrar al panel para reiniciar el tiempo: ahí no bloqueamos.
  const isParents = pathname?.startsWith("/padres") === true;

  if (over && !isParents) {
    return (
      <Modal labelledBy="time-limit-title">
        <div className="text-center">
          <div className="flex justify-center">
            <Avatar mood="happy" size={96} />
          </div>
          <h2 id="time-limit-title" className="mt-2 text-2xl font-bold text-ink">
            Tino se tomó una siestita 💤
          </h2>
          <p className="mt-2 text-lg text-soft">
            ¡Ya jugamos mucho hoy! Descansemos y volvemos mañana con más energía.
            Si un adulto quiere darte un ratito más, puede cambiarlo en el panel de
            papás.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/padres"
              className="rounded-full bg-mascot px-4 py-3 text-lg font-bold text-white active:scale-95"
            >
              Para papás
            </Link>
          </div>
        </div>
      </Modal>
    );
  }

  if (!nudge || isParents) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex justify-center px-5 pt-3"
    >
      <div className="flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-bold text-white shadow-soft">
        🕐 Quedan {Math.ceil(remaining / 60)} min de juego de Tino
      </div>
    </div>
  );
}