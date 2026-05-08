"use client";

import { usePrefs } from "@/lib/preferences";
import { useHydrated } from "@/lib/useHydrated";
import { t } from "@/lib/i18n";
import { loadLearnState } from "@/lib/learnStorage";
import { ALL_LECTURE_IDS } from "@/types/learn";
import LearningPath from "@/components/learn/LearningPath";
import XpBar from "@/components/learn/XpBar";
import { LearnPageSkeleton } from "@/components/learn/LearnSkeleton";

export default function LearnPage() {
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;

  if (!hydrated) return <LearnPageSkeleton />;

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
            <span className={`inline-flex items-center gap-1 text-th-warning${state.currentStreak >= 3 ? " anim-pulse-ring rounded-full" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M12 23c-4.97 0-9-3.13-9-7 0-2.08.88-3.97 2.29-5.34L8 8l1.46 1.46C10.41 8.17 11.6 6.41 12 4c1.26 2.71 3.29 4.99 4.6 7.53.46.9.72 1.84.72 2.87 0 3.57-2.31 6.6-5.32 7.6m0-16s-2 4-2 7 1 4 2 5c1-1 2-2 2-5s-2-7-2-7z"/>
              </svg>
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
