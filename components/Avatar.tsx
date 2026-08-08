"use client";

type AvatarProps = {
  mood?: "happy" | "listening" | "speaking" | "thinking";
  size?: number;
};

export default function Avatar({ mood = "happy", size = 200 }: AvatarProps) {
  return (
    <div
      className="select-none"
      style={{ width: size, height: size * 0.9 }}
      aria-label="Tino el zorrito"
    >
      <svg viewBox="0 0 200 180" width="100%" height="100%">
        {/* Cola */}
        <path
          d="M120 150 q40 5 55 -28 q12 -26 -12 -30 q-20 -2 -28 18 q-8 20 -15 40z"
          fill="#FFB877"
        />
        <path
          d="M152 102 q22 -6 20 -26 q-14 -2 -24 10 q6 10 4 16z"
          fill="#FFF8F1"
          opacity="0.9"
        />
        {/* Orejas */}
        <path d="M45 32 L55 88 L20 74 Z" fill="#E86A33" />
        <path d="M46 48 L50 74 L30 68 Z" fill="#FFB9A8" />
        <path d="M155 32 L145 88 L180 74 Z" fill="#E86A33" />
        <path d="M154 48 L150 74 L170 68 Z" fill="#FFB9A8" />
        {/* Cabeza */}
        <path
          d="M40 60 Q100 52 160 60 Q168 120 150 138 Q100 160 50 138 Q32 120 40 60Z"
          fill="#FF8A42"
        />
        {/* Cara blanca */}
        <path
          d="M58 70 Q100 62 142 70 Q148 116 138 130 Q100 148 62 130 Q52 116 58 70Z"
          fill="#FFF4E3"
        />
        {/* Mejillas */}
        <ellipse cx="70" cy="120" rx="14" ry="9" fill="#FFC2A8" opacity="0.8" />
        <ellipse cx="130" cy="120" rx="14" ry="9" fill="#FFC2A8" opacity="0.8" />
        {/* Ojos */}
        <g className={eyeBlink(mood)}>
          <circle cx="82" cy="82" r="7" fill="#3A3A55" />
          <circle cx="118" cy="82" r="7" fill="#3A3A55" />
          <circle cx="84" cy="80" r="2.2" fill="#fff" />
          <circle cx="120" cy="80" r="2.2" fill="#fff" />
        </g>
        {/* Cejas/gesto */}
        {mood === "thinking" && (
          <>
            <path d="M74 70 q8 -6 16 -2" stroke="#3A3A55" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M126 70 q8 -6 16 -2" stroke="#3A3A55" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* Hocico */}
        <ellipse cx="100" cy="98" rx="11" ry="8" fill="#E86A33" />
        <path d="M102 98 q3 4 0 7 q-3 3 -6 0 q-3 -3 0 -7z" fill="#3A3A55" />
        {/* Boca */}
        <path d="M92 104 q8 6 16 0" stroke="#3A3A55" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* Lengua al hablar */}
        {mood === "speaking" && (
          <ellipse cx="100" cy="108" rx="5" ry="4" fill="#FF6B8B" />
        )}
      </svg>
    </div>
  );
}

function eyeBlink(mood: string) {
  return mood === "speaking" ? "animate-blink" : "";
}