"use client";

import { createContext, useContext, useSyncExternalStore, useCallback } from "react";
import { Lang } from "./i18n";

export type Theme = "light" | "mild" | "dark";

export interface Preferences {
  lang: Lang;
  theme: Theme;
}

const STORAGE_KEY = "cryptoex_prefs";
const DEFAULT_PREFS: Preferences = { lang: "en", theme: "light" };
const ALL_LANGS: readonly Lang[] = ["en", "no"];
const ALL_THEMES: readonly Theme[] = ["light", "mild", "dark"];

// Simple external store for preferences
let listeners: Array<() => void> = [];
let cachedRaw: string | null | undefined;
let cachedPrefs: Preferences = DEFAULT_PREFS;

function isLang(value: unknown): value is Lang {
  return typeof value === "string" && ALL_LANGS.includes(value as Lang);
}

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && ALL_THEMES.includes(value as Theme);
}

function normalizePrefs(value: unknown): Preferences {
  if (!value || typeof value !== "object") return DEFAULT_PREFS;
  const parsed = value as Partial<Preferences>;
  return {
    lang: isLang(parsed.lang) ? parsed.lang : DEFAULT_PREFS.lang,
    theme: isTheme(parsed.theme) ? parsed.theme : DEFAULT_PREFS.theme,
  };
}

function emitChange() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedPrefs;

    cachedRaw = raw;
    if (!raw) {
      cachedPrefs = DEFAULT_PREFS;
      return cachedPrefs;
    }

    const next = normalizePrefs(JSON.parse(raw));
    if (next.lang === cachedPrefs.lang && next.theme === cachedPrefs.theme) {
      return cachedPrefs;
    }

    cachedPrefs = next;
    return cachedPrefs;
  } catch {
    cachedRaw = null;
    cachedPrefs = DEFAULT_PREFS;
    return cachedPrefs;
  }
}

function getServerSnapshot(): Preferences {
  return DEFAULT_PREFS;
}

function setPrefs(update: Partial<Preferences>) {
  if (typeof window === "undefined") return;

  const current = getSnapshot();
  const next = { ...current, ...update };
  if (next.lang === current.lang && next.theme === current.theme) return;

  cachedPrefs = next;
  cachedRaw = JSON.stringify(next);

  localStorage.setItem(STORAGE_KEY, cachedRaw);
  applyTheme(next.theme);
  emitChange();
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

// Context for preferences
const PrefsContext = createContext<{
  prefs: Preferences;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
}>({
  prefs: DEFAULT_PREFS,
  setLang: () => {},
  setTheme: () => {},
});

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((lang: Lang) => setPrefs({ lang }), []);
  const setTheme = useCallback((theme: Theme) => setPrefs({ theme }), []);

  return (
    <PrefsContext.Provider value={{ prefs, setLang, setTheme }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  return useContext(PrefsContext);
}
