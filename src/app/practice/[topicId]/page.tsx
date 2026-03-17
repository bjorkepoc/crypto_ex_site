"use client";

import { useParams } from "next/navigation";
import { topicMap } from "@/data/topics";
import { getQuestionsByTopic } from "@/data";
import { recordPracticeAttempt } from "@/lib/storage";
import { usePrefs } from "@/lib/preferences";
import { t, topicNames } from "@/lib/i18n";
import McqCard from "@/components/McqCard";
import WrittenCard from "@/components/WrittenCard";
import StudySourcePanel from "@/components/learn/StudySourcePanel";
import { TopicId, McqQuestion, WrittenQuestion } from "@/types";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function PracticePage() {
  const params = useParams();
  const topicId = params.topicId as TopicId;
  const topic = topicMap.get(topicId);
  const { prefs } = usePrefs();
  const lang = prefs.lang;

  const questions = useMemo(() => getQuestionsByTopic(topicId), [topicId]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  if (!topic) {
    return (
      <div className="py-12 text-center text-th-text-muted">
        {t("practice.topic_not_found", lang)}{" "}
        <Link href="/" className="text-th-text-accent hover:underline">
          {t("practice.back_link", lang)}
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-12 text-center text-th-text-muted">
        {t("practice.no_questions", lang)}{" "}
        <Link href="/" className="text-th-text-accent hover:underline">
          {t("practice.back_link", lang)}
        </Link>
      </div>
    );
  }

  const question = questions[currentIndex];
  const topicName = topicNames[topicId]?.[lang] ?? topic.name;

  function handleMcqAnswer(questionId: string, correct: boolean) {
    setAnsweredIds((prev) => new Set(prev).add(questionId));
    recordPracticeAttempt({
      questionId,
      topicId,
      timestamp: Date.now(),
      correct,
    });
  }

  function handleWrittenScore(questionId: string, score: number) {
    setAnsweredIds((prev) => new Set(prev).add(questionId));
    recordPracticeAttempt({
      questionId,
      topicId,
      timestamp: Date.now(),
      selfScore: score,
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-sm text-th-text-faint hover:text-th-text-muted">
          {t("practice.back", lang)}
        </Link>
        <span className="text-xs text-th-text-faint">/</span>
        <span className="text-sm font-medium text-th-text-secondary">{topicName}</span>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-th-text-muted">
          {t("practice.question_of", lang, currentIndex + 1, questions.length)}
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
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={currentIndex === questions.length - 1}
            className="rounded border border-th-border px-3 py-1 text-sm text-th-text-muted transition-colors hover:bg-th-muted disabled:opacity-30"
          >
            {t("practice.next", lang)}
          </button>
        </div>
      </div>
      {question.type === "mcq" ? (
        <div>
          <McqCard
            key={question.id}
            question={question as McqQuestion}
            onAnswer={handleMcqAnswer}
          />
          {answeredIds.has(question.id) && (
            <StudySourcePanel question={question as McqQuestion} />
          )}
        </div>
      ) : (
        <WrittenCard
          key={question.id}
          question={question as WrittenQuestion}
          onScore={handleWrittenScore}
        />
      )}
      <div className="mt-4 flex flex-wrap gap-1">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
              i === currentIndex
                ? "bg-th-accent text-th-text-on-accent"
                : answeredIds.has(q.id)
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
