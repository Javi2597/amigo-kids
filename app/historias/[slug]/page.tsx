import BackButton from "@/components/BackButton";
import StoryPlayer from "@/components/StoryPlayer";
import { getStory, STORIES } from "@/lib/stories";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.id }));
}

export default async function Historia({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="w-20" />
      </div>
      <StoryPlayer story={story} />
    </main>
  );
}
