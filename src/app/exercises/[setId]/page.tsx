"use client";

import { useParams } from "next/navigation";
import { getExerciseSetById } from "@/data/exercises";
import { usePrefs } from "@/lib/preferences";
import { t, topicNames } from "@/lib/i18n";
import AlphaListText from "@/components/AlphaListText";
import SolutionPanel from "@/components/SolutionPanel";
import Link from "next/link";
import { useState } from "react";

export default function ExerciseSetPage() {
  const params = useParams();
  const setId = params.setId as string;
  const set = getExerciseSetById(setId);
  const { prefs } = usePrefs();
  const lang = prefs.lang;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  if (!set) {
    return (
      <div className="py-12 text-center text-th-text-muted">
        {t("exercises.set_not_found", lang)}{" "}
        <Link href="/exercises" className="text-th-text-accent hover:underline">
          {t("practice.back_link", lang)}
        </Link>
      </div>
    );
  }

  const exercise = set.exercises[currentIndex];
  const exerciseThemes =
    exercise.topics && exercise.topics.length > 0
      ? exercise.topics
      : set.topics;
  const lectureRefs =
    exercise.lectures && exercise.lectures.length > 0
      ? exercise.lectures
      : set.lectures ?? [];
  const isRevealed = revealed.has(exercise.id);

  function toggleSolution() {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(exercise.id)) {
        next.delete(exercise.id);
      } else {
        next.add(exercise.id);
      }
      return next;
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/exercises"
          className="text-sm text-th-text-faint hover:text-th-text-muted"
        >
          {t("exercises.back", lang)}
        </Link>
        <span className="text-xs text-th-text-faint">/</span>
        <span className="text-sm font-medium text-th-text-secondary">
          {set.title[lang]}
        </span>
      </div>

      <div className="mb-4 space-y-2">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-th-text-faint">
            {t("exercises.themes", lang)}
          </div>
          <div className="flex flex-wrap gap-1">
            {set.topics.map((topicId) => (
              <span
                key={topicId}
                className="rounded-full bg-th-muted px-2 py-0.5 text-[10px] text-th-text-muted"
              >
                {topicNames[topicId]?.[lang] ?? topicId}
              </span>
            ))}
          </div>
        </div>

        {set.lectures && set.lectures.length > 0 && (
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-th-text-faint">
              {t("exercises.lectures", lang)}
            </div>
            <div className="flex flex-wrap gap-1">
              {set.lectures.map((lecture) => (
                <span
                  key={lecture}
                  className="rounded-full bg-th-selected px-2 py-0.5 text-[10px] text-th-text-accent"
                >
                  {lecture}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-th-text-muted">
          {t("exercises.exercise_of", lang, currentIndex + 1, set.exercises.length)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded border border-th-border px-3 py-1 text-sm text-th-text-muted transition-colors hover:bg-th-muted disabled:opacity-30"
          >
            {t("practice.prev", lang)}
          </button>
          <button
            onClick={() =>
              setCurrentIndex((i) => Math.min(set.exercises.length - 1, i + 1))
            }
            disabled={currentIndex === set.exercises.length - 1}
            className="rounded border border-th-border px-3 py-1 text-sm text-th-text-muted transition-colors hover:bg-th-muted disabled:opacity-30"
          >
            {t("practice.next", lang)}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-th-border bg-th-card p-5">
        {exerciseThemes.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-1">
            <span className="text-xs text-th-text-faint">{t("exercises.themes", lang)}:</span>
            {exerciseThemes.map((topicId) => (
              <span
                key={`${exercise.id}-${topicId}`}
                className="rounded-full bg-th-muted px-2 py-0.5 text-[10px] text-th-text-muted"
              >
                {topicNames[topicId]?.[lang] ?? topicId}
              </span>
            ))}
          </div>
        )}

        {lectureRefs.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1">
            <span className="text-xs text-th-text-faint">{t("exercises.lectures", lang)}:</span>
            {lectureRefs.map((lecture) => (
              <span
                key={`${exercise.id}-${lecture}`}
                className="rounded-full bg-th-selected px-2 py-0.5 text-[10px] text-th-text-accent"
              >
                {lecture}
              </span>
            ))}
          </div>
        )}

        <div className="mb-4 text-th-text">
          <AlphaListText text={exercise.text} />
        </div>

        <button
          onClick={toggleSolution}
          className="rounded-lg bg-th-muted px-4 py-2 text-sm font-medium text-th-text border border-th-border transition-colors hover:bg-th-card-hover"
        >
          {isRevealed
            ? t("exercises.hide_solution", lang)
            : t("exercises.show_solution", lang)}
        </button>

        {isRevealed && <SolutionPanel solution={exercise.solution} />}
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        {set.exercises.map((ex, i) => (
          <button
            key={ex.id}
            onClick={() => setCurrentIndex(i)}
            className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
              i === currentIndex
                ? "bg-th-accent text-th-text-on-accent"
                : revealed.has(ex.id)
                  ? "bg-th-success-bg text-th-success"
                  : "bg-th-muted text-th-text-muted hover:bg-th-card-hover"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
