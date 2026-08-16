"use client";

import { useEffect, useRef, useState } from "react";

type MicButtonProps = {
  listening: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
};

export default function MicButton({
  listening,
  onClick,
  disabled,
  size = 96,
}: MicButtonProps) {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listening) {
      const el = ringRef.current;
      if (!el) return;
      const reduce =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      let raf = 0;
      const loop = () => {
        const t = performance.now() / 320;
        const r = 20 + ((t % 1) * 40);
        el.style.boxShadow = `0 0 0 ${r}px rgba(255,138,66,${Math.max(
          0,
          0.22 - r / 500
        )})`;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }
  }, [listening]);

  return (
    <button
      onClick={onClick}
      disabled={disabled !== undefined}
      aria-label={listening ? "Dejar de escuchar" : "Hablar con Tino"}
      className={[
        "relative flex items-center justify-center rounded-full",
        "transition-transform active:scale-95 select-none",
        listening
          ? "bg-coral shadow-[0_8px_0_#E85474]"
          : "bg-mascot shadow-[0_8px_0_#E86A33] hover:brightness-105",
        disabled !== undefined ? "opacity-60 cursor-wait" : "",
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      <div
        ref={ringRef}
        className="absolute inset-0 rounded-full"
        style={{ pointerEvents: "none" }}
      />
      <MicSvg listening={listening} />
    </button>
  );
}

function MicSvg({ listening }: { listening: boolean }) {
  return (
    <svg
      width="38%"
      height="38%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="21.5" />
      {listening && (
        <path d="M4 20l16 0" stroke="#FFF" strokeWidth="2" />
      )}
    </svg>
  );
}