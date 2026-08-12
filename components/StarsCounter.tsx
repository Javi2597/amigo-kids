"use client";

import { useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";

export default function StarsCounter() {
  const { stars } = useProgress();
  const { settings } = useSettings();
  if (!settings.name && stars === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-lemon px-4 py-2 text-lg font-bold text-ink shadow-soft">
      ⭐ {stars}
    </span>
  );
}
