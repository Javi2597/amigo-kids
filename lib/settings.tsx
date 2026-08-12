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
import {
  ensureProfiles,
  getProfiles,
  getActiveProfile,
  upsertProfile,
  addProfile,
  setActiveProfile as persistActive,
  deleteProfile as persistDelete,
  type Profile,
} from "./profiles";
import { emitProgressChange } from "./progress";

export type Settings = {
  voiceOn: boolean;
  naturalVoice: boolean;
  timeLimitMin: number;
  quietMode: boolean;
  name: string;
  age: number;
  micConsent: boolean;
  photoConsent: boolean;
  logHistory: boolean;
  leaderboardOn: boolean;
};

const DEFAULTS: Settings = {
  voiceOn: true,
  naturalVoice: false,
  timeLimitMin: 30,
  quietMode: false,
  name: "",
  age: 5,
  micConsent: false,
  photoConsent: false,
  logHistory: false,
  leaderboardOn: false,
};

type SettingsContextValue = {
  settings: Settings;
  age: number;
  level: LevelId;
  profiles: Profile[];
  activeProfile: Profile | null;
  setSettings: (patch: Partial<Settings>) => void;
  switchProfile: (id: string) => void;
  createProfile: (name: string, age: number) => void;
  removeProfile: (id: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    ensureProfiles();
    setProfiles(getProfiles());
    try {
      const raw = localStorage.getItem("tino-parent");
      const saved = raw ? JSON.parse(raw) : {};
      const active = getActiveProfile();
      setSettingsState({
        ...DEFAULTS,
        ...saved,
        age: active?.age ?? saved.age ?? DEFAULTS.age,
        name: active?.name ?? saved.name ?? DEFAULTS.name,
      });
    } catch {
      setSettingsState((s) => ({ ...s, age: getActiveProfile()?.age ?? s.age }));
    }
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

  const set = useCallback((patch: Partial<Settings>) => {
    setSettingsState((s) => {
      const profilePatch: Partial<Profile> = {};
      if ("age" in patch && patch.age !== undefined) profilePatch.age = patch.age;
      if ("name" in patch && patch.name !== undefined) profilePatch.name = patch.name;
      if (Object.keys(profilePatch).length > 0) {
        const active = getActiveProfile();
        if (active) {
          upsertProfile({ ...active, ...profilePatch });
          setProfiles(getProfiles());
        }
      }
      const next = { ...s, ...patch };
      return next;
    });
  }, []);

  const switchProfile = useCallback((id: string) => {
    persistActive(id);
    setProfiles(getProfiles());
    const p = getActiveProfile();
    setSettingsState((s) => ({ ...s, age: p?.age ?? s.age, name: p?.name ?? s.name }));
    emitProgressChange();
  }, []);

  const createProfile = useCallback((name: string, age: number) => {
    const p = addProfile(name.trim() || "Peque", age);
    persistActive(p.id);
    setProfiles(getProfiles());
    setSettingsState((s) => ({ ...s, age: p.age, name: p.name }));
    emitProgressChange();
  }, []);

  const removeProfile = useCallback((id: string) => {
    persistDelete(id);
    setProfiles(getProfiles());
    const p = getActiveProfile();
    setSettingsState((s) => ({ ...s, age: p?.age ?? s.age, name: p?.name ?? s.name }));
    emitProgressChange();
  }, []);

  const activeProfile = getActiveProfile();

  return (
    <SettingsContext.Provider
      value={{
        settings,
        age: settings.age,
        level: ageToLevel(settings.age),
        profiles,
        activeProfile,
        setSettings: set,
        switchProfile,
        createProfile,
        removeProfile,
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
