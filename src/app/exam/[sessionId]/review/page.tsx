"use client";

import { useParams, useRouter } from "next/navigation";
import { getExamSession, saveExamSession } from "@/lib/storage";
import { getQuestionById } from "@/data";
import { useHydrated } from "@/lib/useHydrated";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";
import {
  MCQ_CORRECT_POINTS,
  scoreMcq,
  scoreWritten,
  totalExamScore,
} from "@/lib/scoring";
import { McqQuestion, WrittenQuestion } from "@/types";
import McqCard from "@/components/McqCard";
import WrittenCard from "@/components/WrittenCard";
import { useState } from "react";
import Link from "next/link";

export default function ExamReview() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [version, setVersion] = useState(0);

  const session = hydrated ? getExamSession(sessionId) : null;

  if (!hydrated) return null;

  if (!session) {
    router.push("/exam");
    return null;
  }

  void version;

  const mcqQuestions = session.mcqQuestions
    .map((id) => getQuestionById(id))
    .filter(Boolean) as McqQuestion[];
  const writtenQuestions = session.writtenQuestions
    .map((id) => getQuestionById(id))
    .filter(Boolean) as WrittenQuestion[];

  const correctAnswers: Record<string, string> = {};
  for (const q of mcqQuestions) {
    correctAnswers[q.id] = q.correctAnswer;
  }

  const mcqResult = scoreMcq(session.mcqAnswers, correctAnswers);
  const writtenResult = scoreWritten(session.writtenScores);
  const mcqMax = mcqQuestions.length * MCQ_CORRECT_POINTS;
  const writtenMax = writtenQuestions.reduce(
    (sum, q) => sum + Number(q.totalPoints || 0),
    0
  );
  const totalMax = mcqMax + writtenMax;
  const total = totalExamScore(mcqResult.total, writtenResult, totalMax);

  function handleWrittenScore(questionId: string, score: number) {
    const current = getExamSession(sessionId);
    if (!current) return;
    const updated = {
      ...current,
      writtenScores: { ...current.writtenScores, [questionId]: score },
    };
    const wr = scoreWritten(updated.writtenScores);
    const scored = totalExamScore(mcqResult.total, wr, totalMax);
    updated.totalScore = scored.total;
    updated.totalMaxScore = scored.max;
    saveExamSession(updated);
    setVersion((n) => n + 1);
  }

  const duration = session.finishedAt
    ? Math.round((session.finishedAt - session.startedAt) / 60000)
    : null;

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-th-text-faint hover:text-th-text-muted">
          {t("practice.back", lang)}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-th-text">
          {t("review.title", lang)}
        </h1>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-th-card p-4 shadow-[var(--shadow-th-sm)]">
          <div className="text-sm text-th-text-muted">{t("review.total", lang)}</div>
          <div className="text-2xl font-bold text-th-text">
            {total.total.toFixed(1)}/{total.max}
          </div>
          <div className="text-sm text-th-text-faint">
            {total.percentage.toFixed(0)}%
          </div>
        </div>
        <div className="rounded-lg bg-th-card p-4 shadow-[var(--shadow-th-sm)]">
          <div className="text-sm text-th-text-muted">{t("review.mcq", lang)}</div>
          <div className="text-xl font-bold text-th-text">
            {mcqResult.total.toFixed(1)}/{mcqMax}
          </div>
          <div className="text-xs text-th-text-faint">
            {t("review.correct_incorrect", lang, mcqResult.correct, mcqResult.incorrect, mcqResult.unanswered)}
          </div>
        </div>
        <div className="rounded-lg bg-th-card p-4 shadow-[var(--shadow-th-sm)]">
          <div className="text-sm text-th-text-muted">{t("review.written", lang)}</div>
          <div className="text-xl font-bold text-th-text">
            {writtenResult.toFixed(1)}/{writtenMax}
          </div>
        </div>
        <div className="rounded-lg bg-th-card p-4 shadow-[var(--shadow-th-sm)]">
          <div className="text-sm text-th-text-muted">{t("review.time_spent", lang)}</div>
          <div className="text-xl font-bold text-th-text">
            {duration ? t("review.min", lang, duration) : "—"}
          </div>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-th-text-secondary">
        {t("review.mcq_review", lang)}
      </h2>
      <div className="mb-8 space-y-4">
        {mcqQuestions.map((q) => (
          <McqCard
            key={q.id}
            question={q}
            selectedAnswer={session.mcqAnswers[q.id]}
            showResult={true}
            disabled={true}
          />
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-th-text-secondary">
        {t("review.written_review", lang)}
      </h2>
      <div className="space-y-4">
        {writtenQuestions.map((q) => (
          <WrittenCard
            key={q.id}
            question={q}
            showSolution={true}
            onScore={handleWrittenScore}
            selfScore={session.writtenScores[q.id]}
          />
        ))}
      </div>
    </div>
  );
}
