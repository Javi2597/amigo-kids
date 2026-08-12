import BackButton from "@/components/BackButton";
import AdaptiveQuizzes from "@/components/AdaptiveQuizzes";
import PuzzlesSection from "@/components/PuzzlesSection";
import ChallengeSection from "@/components/ChallengeSection";

export default function Jugar() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold text-ink">🎈 ¡A jugar!</h1>
        <div className="w-20" />
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-4xl bg-surface p-6 shadow-soft">
        <AdaptiveQuizzes />
      </div>

      <ChallengeSection />
      <PuzzlesSection />
    </main>
  );
}
