import BackButton from "@/components/BackButton";
import AdaptiveTopic from "@/components/AdaptiveTopic";
import { TOPIC_INFO, ALL_TOPIC_IDS } from "@/lib/content";

export function generateStaticParams() {
  return ALL_TOPIC_IDS.map((tema) => ({ tema }));
}

export default async function Tema({
  params,
}: {
  params: Promise<{ tema: string }>;
}) {
  const { tema } = await params;
  const topic = (ALL_TOPIC_IDS as string[]).includes(tema) ? tema : "colores";
  const info = TOPIC_INFO[topic as keyof typeof TOPIC_INFO];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-ink">
          {info.emoji} {info.title}
        </h1>
        <div className="w-20" />
      </div>
      <div className="rounded-4xl bg-surface p-6 shadow-soft">
        <AdaptiveTopic topic={topic} />
      </div>
    </main>
  );
}