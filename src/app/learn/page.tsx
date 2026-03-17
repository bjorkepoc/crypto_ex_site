"use client";

import { usePrefs } from "@/lib/preferences";
import { useHydrated } from "@/lib/useHydrated";
import { t } from "@/lib/i18n";
import { loadLearnState } from "@/lib/learnStorage";
import { ALL_LECTURE_IDS } from "@/types/learn";
import LearningPath from "@/components/learn/LearningPath";
import XpBar from "@/components/learn/XpBar";

export default function LearnPage() {
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;

  if (!hydrated) return null;

  const state = loadLearnState();
  const masteredCount = ALL_LECTURE_IDS.filter(
    (id) => state.lectureProgress[id].stage === "mastered"
  ).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-th-text mb-2">{t("learn.title", lang)}</h1>
      <p className="text-sm text-th-text-muted mb-6">
        {t("learn.subtitle", lang)}
      </p>

      {/* Stats bar */}
      <div className="rounded-lg border border-th-border bg-th-card p-4 mb-6 space-y-3">
        <XpBar totalXp={state.totalXp} />
        <div className="flex items-center gap-4 text-xs text-th-text-muted">
          <span>{masteredCount}/15 {t("learn.lectures_mastered", lang)}</span>
          {state.currentStreak > 0 && (
            <span className="text-th-warning">
              {state.currentStreak} {t("learn.day_streak", lang)}
            </span>
          )}
        </div>
      </div>

      {/* Learning path */}
      <LearningPath state={state} />
    </div>
  );
}
