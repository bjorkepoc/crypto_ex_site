"use client";

import { topics } from "@/data/topics";
import { loadProgress, wipeAllProgress, wipeTopicProgress } from "@/lib/storage";
import { useHydrated } from "@/lib/useHydrated";
import { usePrefs } from "@/lib/preferences";
import { t, topicNames } from "@/lib/i18n";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";
import { TopicId } from "@/types";
import { useState } from "react";

export default function ProgressPage() {
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [wipeTick, setWipeTick] = useState(0);

  if (!hydrated) return null;

  // wipeTick triggers re-render after wipe to reload fresh progress
  void wipeTick;
  const progress = loadProgress();

  function handleWipeTopic(topicId: TopicId) {
    if (!window.confirm(t("progress.wipe_topic_confirm", lang))) return;
    wipeTopicProgress(topicId);
    setWipeTick((n) => n + 1);
  }

  function handleWipe() {
    if (!window.confirm(t("progress.wipe_confirm", lang))) return;
    wipeAllProgress();
    setWipeTick((n) => n + 1);
  }

  const topicStats = topics
    .map((tp) => ({
      topic: tp,
      stats: progress.topicStats[tp.id],
    }))
    .filter((tp) => tp.stats.mcqAttempted > 0)
    .sort((a, b) => {
      const accA = a.stats.mcqCorrect / a.stats.mcqAttempted;
      const accB = b.stats.mcqCorrect / b.stats.mcqAttempted;
      return accA - accB;
    });

  const unattempted = topics.filter(
    (tp) => progress.topicStats[tp.id].mcqAttempted === 0
  );

  const totalAttempted = Object.values(progress.topicStats).reduce(
    (s, ts) => s + ts.mcqAttempted,
    0
  );
  const totalCorrect = Object.values(progress.topicStats).reduce(
    (s, ts) => s + ts.mcqCorrect,
    0
  );
  const overallAccuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-th-text">{t("progress.title", lang)}</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-th-card p-4 shadow-[var(--shadow-th-sm)]">
          <div className="text-sm text-th-text-muted">{t("progress.overall_accuracy", lang)}</div>
          <div className="text-2xl font-bold text-th-text">{overallAccuracy}%</div>
          <div className="text-xs text-th-text-faint">
            {t("progress.correct_of", lang, totalCorrect, totalAttempted)}
          </div>
        </div>
        <div className="rounded-lg bg-th-card p-4 shadow-[var(--shadow-th-sm)]">
          <div className="text-sm text-th-text-muted">{t("progress.exam_sessions", lang)}</div>
          <div className="text-2xl font-bold text-th-text">
            {progress.examSessions.length}
          </div>
        </div>
        <div className="rounded-lg bg-th-card p-4 shadow-[var(--shadow-th-sm)]">
          <div className="text-sm text-th-text-muted">{t("progress.topics_covered", lang)}</div>
          <div className="text-2xl font-bold text-th-text">
            {topicStats.length}/{topics.length}
          </div>
        </div>
      </div>

      {topicStats.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-th-text-secondary">
            {t("progress.per_topic", lang)}
          </h2>
          <div className="space-y-3">
            {topicStats.map(({ topic, stats }) => {
              const accuracy = Math.round(
                (stats.mcqCorrect / stats.mcqAttempted) * 100
              );
              const name = topicNames[topic.id]?.[lang] ?? topic.name;
              return (
                <div key={topic.id} className="rounded-lg bg-th-card p-3 shadow-[var(--shadow-th-sm)]">
                  <div className="mb-1 flex items-center justify-between">
                    <Link
                      href={`/practice/${topic.id}`}
                      className="text-sm font-medium text-th-text-secondary hover:text-th-text-accent"
                    >
                      {name}
                    </Link>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-th-text-faint">
                        {stats.mcqCorrect}/{stats.mcqAttempted}
                      </span>
                      <button
                        onClick={() => handleWipeTopic(topic.id)}
                        className="rounded px-1.5 py-0.5 text-[10px] text-th-text-faint transition-colors hover:bg-th-error-bg hover:text-th-error"
                      >
                        {t("progress.wipe_topic", lang)}
                      </button>
                    </span>
                  </div>
                  <ProgressBar
                    value={accuracy}
                    color={
                      accuracy >= 70
                        ? "green"
                        : accuracy >= 40
                          ? "yellow"
                          : "red"
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {unattempted.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-th-text-secondary">
            {t("progress.not_practiced", lang)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {unattempted.map((tp) => {
              const name = topicNames[tp.id]?.[lang] ?? tp.name;
              return (
                <Link
                  key={tp.id}
                  href={`/practice/${tp.id}`}
                  className="rounded-full border border-th-border px-3 py-1 text-sm text-th-text-muted transition-colors hover:border-th-border-accent hover:text-th-text-accent"
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {progress.examSessions.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-th-text-secondary">
            {t("progress.exam_history", lang)}
          </h2>
          <div className="space-y-2">
            {[...progress.examSessions].reverse().map((s) => (
              <Link
                key={s.id}
                href={`/exam/${s.id}/review`}
                className="flex items-center justify-between rounded-lg bg-th-card p-3 shadow-[var(--shadow-th-sm)] transition-colors hover:bg-th-card-hover"
              >
                <span className="text-sm text-th-text-secondary">
                  {new Date(s.startedAt).toLocaleDateString(
                    lang === "no" ? "nb-NO" : "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
                <span className="text-sm font-medium text-th-text">
                  {s.totalScore !== undefined
                    ? `${s.totalScore.toFixed(1)}/${(s.totalMaxScore ?? 60).toFixed(0)}`
                    : t("progress.not_completed", lang)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 border-t border-th-border pt-6">
        <button
          onClick={handleWipe}
          className="rounded-lg border border-th-error-border bg-th-error-bg px-4 py-2 text-sm font-medium text-th-error transition-colors hover:opacity-80"
        >
          {t("progress.wipe", lang)}
        </button>
      </div>
    </div>
  );
}
