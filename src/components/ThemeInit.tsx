"use client";

import { useEffect } from "react";
import { usePrefs, applyTheme } from "@/lib/preferences";

export function ThemeInit() {
  const { prefs } = usePrefs();

  useEffect(() => {
    applyTheme(prefs.theme);
  }, [prefs.theme]);

  return null;
}
