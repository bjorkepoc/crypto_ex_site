"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePrefs } from "@/lib/preferences";
import { useHydrated } from "@/lib/useHydrated";
import { t } from "@/lib/i18n";
import { topicNames } from "@/lib/i18n";
import {
  addXp,
  recordPracticeResult,
  recordQuizResult,
} from "@/lib/learnStorage";
import { LectureId, ALL_LECTURE_IDS } from "@/types/learn";
import { getTopicForLecture, getMcqsForLecture } from "@/data/learn";
import PracticeSession from "@/components/learn/PracticeSession";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function PracticePage() {
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lectureId = params.lectureId as LectureId;
  const isQuizMode = searchParams.get("mode") === "quiz";
  const [completed, setCompleted] = useState(false);

  const topicId = getTopicForLecture(lectureId);
  const topicName = topicId ? (topicNames[topicId]?.[lang] ?? lectureId) : lectureId;

  // Shuffle and select questions once per mount
  const questions = useMemo(() => {
    const all = getMcqsForLecture(lectureId);
    const shuffled = shuffleArray(all);
    return isQuizMode ? shuffled.slice(0, 10) : shuffled;
  }, [lectureId, isQuizMode]);

  if (!hydrated) return null;

  if (!ALL_LECTURE_IDS.includes(lectureId)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-th-text-muted">{t("learn.lecture_not_found", lang)}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/learn/${lectureId}`}
          className="text-sm text-th-text-accent hover:underline mb-4 inline-block"
        >
          {t("learn.back_to_lecture", lang)}
        </Link>
        <p className="text-th-text-muted">{t("learn.no_questions", lang)}</p>
      </div>
    );
  }

  const handleComplete = (correct: number, total: number) => {
    if (isQuizMode) {
      recordQuizResult(lectureId, correct, total);
    } else {
      recordPracticeResult(lectureId, correct, total);
    }
    setCompleted(true);
  };

  const handleXpEarned = (amount: number) => {
    addXp(amount);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/learn/${lectureId}`}
        className="text-sm text-th-text-accent hover:underline mb-4 inline-block"
      >
        {t("learn.back_to_lecture", lang)}
      </Link>

      <div className="mb-6">
        <p className="text-xs text-th-text-muted mb-1">
          {lectureId} · {isQuizMode ? t("learn.quiz", lang) : t("learn.practice", lang)}
        </p>
        <h1 className="text-xl font-bold text-th-text">{topicName}</h1>
      </div>

      <PracticeSession
        questions={questions}
        onComplete={handleComplete}
        onXpEarned={handleXpEarned}
      />

      {completed && (
        <div className="mt-4 flex gap-3">
          <Link
            href={`/learn/${lectureId}`}
            className="flex-1 rounded-lg border border-th-border bg-th-card px-4 py-2.5 text-center text-sm font-medium text-th-text transition-colors hover:bg-th-card-hover"
          >
            {t("learn.back_to_lecture", lang)}
          </Link>
          <button
            onClick={() => router.refresh()}
            className="flex-1 rounded-lg bg-th-accent px-4 py-2.5 text-sm font-medium text-th-text-on-accent transition-colors hover:bg-th-accent-hover"
          >
            {t("learn.try_again", lang)}
          </button>
        </div>
      )}
    </div>
  );
}
