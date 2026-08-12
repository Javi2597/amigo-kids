import BackButton from "@/components/BackButton";
import Link from "next/link";
import { PROJECTS } from "@/lib/projects";

export default function Proyectos() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-ink">🔬 Proyectos</h1>
        <div className="w-20" />
      </div>

      <p className="text-center text-xl text-soft">
        Investiga, descubre y crea tus propios proyectos.
      </p>

      <div className="flex flex-col gap-4">
        {PROJECTS.map((p) => (
          <Link
            key={p.id}
            href={`/proyectos/${p.id}`}
            className="flex items-center gap-4 rounded-4xl bg-surface p-5 shadow-soft transition-all active:scale-95"
          >
            <span className="text-6xl">{p.emoji}</span>
            <span className="text-2xl font-bold text-ink">{p.title}</span>
            <span className="ml-auto text-3xl text-soft">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
