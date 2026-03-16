"use client";

import { getAllExerciseSets } from "@/data/exercises";
import { usePrefs } from "@/lib/preferences";
import { t, topicNames } from "@/lib/i18n";
import Link from "next/link";

export default function ExercisesPage() {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const sets = getAllExerciseSets();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-th-text">
        {t("exercises.title", lang)}
      </h1>

      {sets.length === 0 ? (
        <p className="text-th-text-muted">{t("exercises.no_sets", lang)}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/exercises/${set.id}`}
              className="rounded-lg border border-th-border bg-th-card p-4 shadow-[var(--shadow-th-sm)] transition-colors hover:bg-th-card-hover"
            >
              <h2 className="mb-1 text-base font-semibold text-th-text-secondary">
                {set.title[lang]}
              </h2>
              {set.description && (
                <p className="mb-2 text-xs text-th-text-faint">
                  {set.description[lang]}
                </p>
              )}
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-th-text-faint">
                {t("exercises.themes", lang)}
              </div>
              <div className="mb-2 flex flex-wrap gap-1">
                {set.topics.map((topicId) => {
                  const name = topicNames[topicId]?.[lang] ?? topicId;
                  return (
                    <span
                      key={topicId}
                      className="rounded-full bg-th-muted px-2 py-0.5 text-[10px] text-th-text-muted"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
              {set.lectures && set.lectures.length > 0 && (
                <>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-th-text-faint">
                    {t("exercises.lectures", lang)}
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {set.lectures.map((lecture) => (
                      <span
                        key={lecture}
                        className="rounded-full bg-th-selected px-2 py-0.5 text-[10px] text-th-text-accent"
                      >
                        {lecture}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <span className="text-xs text-th-text-muted">
                {t("exercises.count", lang, set.exercises.length)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
