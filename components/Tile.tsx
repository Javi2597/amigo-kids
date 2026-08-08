import Link from "next/link";

type TileColor = "coral" | "lemon" | "mint" | "sky" | "lavender" | "mascot";

const palettes: Record<TileColor, { bg: string; deep: string }> = {
  coral: { bg: "bg-coral", deep: "shadow-[0_6px_0_#E85474]" },
  lemon: { bg: "bg-lemon", deep: "shadow-[0_6px_0_#E0AC22]" },
  mint: { bg: "bg-mint", deep: "shadow-[0_6px_0_#53B887]" },
  sky: { bg: "bg-sky", deep: "shadow-[0_6px_0_#3BA7D6]" },
  lavender: { bg: "bg-lavender", deep: "shadow-[0_6px_0_#7A6BD1]" },
  mascot: { bg: "bg-mascot", deep: "shadow-[0_6px_0_#E86A33]" },
};

type TilePropsType = {
  href: string;
  title: string;
  emoji: string;
  color: TileColor;
  onClick?: () => void;
};

export default function Tile({ href, title, emoji, color, onClick }: TilePropsType) {
  const p = palettes[color];
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "flex min-h-tap flex-col items-center justify-center gap-1 rounded-4xl p-4",
        "text-white tap-target transition-transform active:translate-y-1 active:shadow-none",
        p.bg,
        p.deep,
      ].join(" ")}
    >
      <span className="text-5xl drop-shadow-sm">{emoji}</span>
      <span className="text-xl font-semibold text-shadow-soft">{title}</span>
    </Link>
  );
}