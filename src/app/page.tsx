"use client";

import { topics } from "@/data/topics";
import { getTopicQuestionCounts } from "@/data";
import { loadProgress } from "@/lib/storage";
import { useHydrated } from "@/lib/useHydrated";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";
import TopicCard from "@/components/TopicCard";

export default function Dashboard() {
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const counts = getTopicQuestionCounts();

  if (!hydrated) return null;

  const progress = loadProgress();

  const totalMcq = Object.values(counts).reduce((s, c) => s + c.mcq, 0);
  const totalWritten = Object.values(counts).reduce((s, c) => s + c.written, 0);
  const totalAttempted = Object.values(progress.topicStats).reduce(
    (s, ts) => s + ts.mcqAttempted,
    0
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-th-text">{t("dash.title", lang)}</h1>
        <p className="mt-1 text-sm text-th-text-muted">
          {totalMcq} {t("dash.mcq_count", lang)}, {totalWritten}{" "}
          {t("dash.written_count", lang)} | {totalAttempted}{" "}
          {t("dash.attempts_total", lang)}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            stats={progress.topicStats[topic.id]}
            questionCount={counts[topic.id] ?? { mcq: 0, written: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
