import BackButton from "@/components/BackButton";
import Tile from "@/components/Tile";
import { ALL_TOPIC_IDS, TOPIC_INFO } from "@/lib/content";

export default function Aprender() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-ink">🎨 Aprender</h1>
        <div className="w-20" />
      </div>

      <p className="text-center text-xl text-soft">
        Elige un tema y aprende con Tino.
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {ALL_TOPIC_IDS.map((id) => (
          <Tile
            key={id}
            href={`/aprender/${id}`}
            title={TOPIC_INFO[id].title}
            emoji={TOPIC_INFO[id].emoji}
            color={TOPIC_INFO[id].color as "coral" | "sky" | "mint" | "lemon" | "lavender" | "mascot"}
          />
        ))}
      </div>
    </main>
  );
}