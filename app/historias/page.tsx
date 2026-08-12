import BackButton from "@/components/BackButton";
import Link from "next/link";
import { STORIES } from "@/lib/stories";

export default function Historias() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-ink">📖 Historias</h1>
        <div className="w-20" />
      </div>

      <p className="text-center text-xl text-soft">
        Elige una aventura. ¡Tú decides qué pasa!
      </p>

      <div className="flex flex-col gap-4">
        {STORIES.map((s) => (
          <Link
            key={s.id}
            href={`/historias/${s.id}`}
            className="flex items-center gap-4 rounded-4xl bg-surface p-5 shadow-soft transition-all active:scale-95"
          >
            <span className="text-6xl">{s.emoji}</span>
            <span className="text-2xl font-bold text-ink">{s.title}</span>
            <span className="ml-auto text-3xl text-soft">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
