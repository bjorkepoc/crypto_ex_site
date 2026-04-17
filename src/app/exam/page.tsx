"use client";

import { useRouter } from "next/navigation";
import { generateExam } from "@/lib/examGenerator";
import { saveExamSession } from "@/lib/storage";
import { getFilteredQuestions } from "@/data";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";
import { useState } from "react";
import SourceFilterBar, {
  type SourceFilterSet,
  EMPTY_FILTER,
} from "@/components/SourceFilterBar";

export default function ExamSetup() {
  const router = useRouter();
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [sourceFilter, setSourceFilter] = useState<SourceFilterSet>(EMPTY_FILTER);
  const questions = getFilteredQuestions(sourceFilter);
  const mcqCount = questions.filter((q) => q.type === "mcq").length;
  const writtenCount = questions.filter((q) => q.type === "written").length;
  const canStart = mcqCount > 0 && writtenCount > 0;
  const [duration, setDuration] = useState(180);

  function handleStart() {
    if (!canStart) return;
    const session = generateExam({
      mcqCount: Math.min(30, mcqCount),
      writtenCount: Math.min(5, writtenCount),
      durationMinutes: duration,
      questions,
    });
    saveExamSession(session);
    router.push(`/exam/${session.id}`);
  }

  return (
    <div className="mx-auto max-w-lg py-12">
      <h1 className="mb-2 text-2xl font-bold text-th-text">{t("exam.title", lang)}</h1>
      <p className="mb-6 text-sm text-th-text-muted">{t("exam.description", lang)}</p>

      <div className="mb-4">
        <SourceFilterBar value={sourceFilter} onChange={setSourceFilter} />
      </div>

      <div className="mb-6 rounded-lg border border-th-border bg-th-card p-4">
        <div className="mb-3 text-sm text-th-text-muted">
          {t("exam.available", lang)}: {t("exam.mcq_written", lang, mcqCount, writtenCount)}
        </div>
        <label className="mb-2 block text-sm font-medium text-th-text-secondary">
          {t("exam.duration", lang)}
        </label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 180)}
          className="w-24 rounded border border-th-border bg-th-input px-3 py-1.5 text-sm text-th-text"
          min={10}
          max={300}
        />
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full rounded-lg bg-th-accent py-3 text-sm font-semibold text-th-text-on-accent transition-colors hover:bg-th-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("exam.start", lang)}
      </button>
    </div>
  );
}
