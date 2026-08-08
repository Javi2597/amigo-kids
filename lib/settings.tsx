"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ageToLevel, type LevelId } from "./content";

export type Settings = {
  voiceOn: boolean;
  naturalVoice: boolean;
  timeLimitMin: number;
  quietMode: boolean;
  name: string;
  age: number;
};

const DEFAULTS: Settings = {
  voiceOn: true,
  naturalVoice: true,
  timeLimitMin: 30,
  quietMode: false,
  name: "",
  age: 5,
};

type SettingsContextValue = {
  settings: Settings;
  age: number;
  level: LevelId;
  setSettings: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tino-parent");
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("tino-parent", JSON.stringify(settings));
    const r = document.documentElement as HTMLElement;
    r.style.filter = settings.quietMode
      ? "saturate(0.7) brightness(0.98)"
      : "";
  }, [settings, loaded]);

  const set = useCallback(
    (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })),
    []
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        age: settings.age,
        level: ageToLevel(settings.age),
        setSettings: set,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const v = useContext(SettingsContext);
  if (!v) throw new Error("useSettings debe usarse dentro de SettingsProvider");
  return v;
}