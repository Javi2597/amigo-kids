"use client";

import { useProgress } from "@/lib/progress";

export default function ProgressBar({
  topic,
  title,
  value,
}: {
  topic: string;
  title: string;
  value?: number;
}) {
  const { topics } = useProgress();
  const p = topics[topic] ?? { seen: 0, correct: 0, wrong: 0 };
  const total = p.correct + p.wrong;
  const pct =
    value !== undefined
      ? Math.min(100, Math.max(0, Math.round(value)))
      : total > 0
      ? Math.round((p.correct / total) * 100)
      : 0;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm font-bold text-soft">
        <span>{title}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-cream">
        <div
          className="h-3 rounded-full bg-mascot transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
