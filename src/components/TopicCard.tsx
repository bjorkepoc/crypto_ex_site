"use client";

import Link from "next/link";
import { Topic, TopicStats } from "@/types";
import { usePrefs } from "@/lib/preferences";
import { t, topicNames, topicDescriptions } from "@/lib/i18n";

interface TopicCardProps {
  topic: Topic;
  stats: TopicStats;
  questionCount: { mcq: number; written: number };
}

export default function TopicCard({ topic, stats, questionCount }: TopicCardProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const total = questionCount.mcq + questionCount.written;
  const accuracy =
    stats.mcqAttempted > 0
      ? Math.round((stats.mcqCorrect / stats.mcqAttempted) * 100)
      : null;

  const name = topicNames[topic.id]?.[lang] ?? topic.name;
  const desc = topicDescriptions[topic.id]?.[lang] ?? topic.description;

  return (
    <Link
      href={`/practice/${topic.id}`}
      className="block rounded-lg border border-th-border bg-th-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-th-text-faint">{topic.lecture}</span>
        {total === 0 && (
          <span className="rounded bg-th-muted px-1.5 py-0.5 text-[10px] text-th-text-muted">
            {t("topic.no_questions", lang)}
          </span>
        )}
      </div>
      <h3 className="mb-1 font-semibold text-th-text">{name}</h3>
      <p className="mb-3 text-sm text-th-text-muted">{desc}</p>
      <div className="flex items-center gap-3 text-xs text-th-text-muted">
        <span>{questionCount.mcq} {t("topic.mcq", lang)}</span>
        <span>{questionCount.written} {t("topic.written", lang)}</span>
        {accuracy !== null && (
          <>
            <span className="text-th-text-faint">|</span>
            <span
              className={
                accuracy >= 70
                  ? "text-th-success"
                  : accuracy >= 40
                    ? "text-th-warning"
                    : "text-th-error"
              }
            >
              {accuracy}% {t("topic.correct", lang)}
            </span>
          </>
        )}
      </div>
      {stats.mcqAttempted > 0 && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-th-bar">
          <div
            className={`h-full rounded-full ${
              accuracy! >= 70
                ? "bg-th-success"
                : accuracy! >= 40
                  ? "bg-th-warning"
                  : "bg-th-error"
            }`}
            style={{ width: `${accuracy}%` }}
          />
        </div>
      )}
    </Link>
  );
}
