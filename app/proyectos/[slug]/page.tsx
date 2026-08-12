import BackButton from "@/components/BackButton";
import ProjectPlayer from "@/components/ProjectPlayer";
import { getProject, PROJECTS } from "@/lib/projects";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.id }));
}

export default async function Proyecto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="w-20" />
      </div>
      <ProjectPlayer project={project} />
    </main>
  );
}
