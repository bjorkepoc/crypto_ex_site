"use client";

import { useParams, useRouter } from "next/navigation";
import { getExamSession, saveExamSession } from "@/lib/storage";
import { getQuestionById } from "@/data";
import { useHydrated } from "@/lib/useHydrated";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";
import { McqQuestion, WrittenQuestion } from "@/types";
import McqCard from "@/components/McqCard";
import WrittenCard from "@/components/WrittenCard";
import Timer from "@/components/Timer";
import { useState, useCallback } from "react";

export default function ActiveExam() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [currentSection, setCurrentSection] = useState<"mcq" | "written">("mcq");
  const [mcqIndex, setMcqIndex] = useState(0);
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [version, setVersion] = useState(0);

  const session = hydrated ? getExamSession(sessionId) : null;

  const handleSubmit = useCallback(() => {
    const current = getExamSession(sessionId);
    if (!current) return;
    saveExamSession({ ...current, finishedAt: Date.now() });
    router.push(`/exam/${sessionId}/review`);
  }, [sessionId, router]);

  if (!hydrated) return null;

  if (!session) {
    router.push("/exam");
    return null;
  }

  const mcqQuestions = session.mcqQuestions
    .map((id) => getQuestionById(id))
    .filter(Boolean) as McqQuestion[];
  const writtenQuestions = session.writtenQuestions
    .map((id) => getQuestionById(id))
    .filter(Boolean) as WrittenQuestion[];

  function handleMcqSelect(questionId: string, key: string) {
    const current = getExamSession(sessionId);
    if (!current) return;
    saveExamSession({
      ...current,
      mcqAnswers: { ...current.mcqAnswers, [questionId]: key },
    });
    setVersion((n) => n + 1);
  }

  void version;

  const answeredCount = Object.values(session.mcqAnswers).filter(Boolean).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-lg bg-th-card p-3 shadow-[var(--shadow-th-sm)]">
        <div className="flex items-center gap-4">
          <Timer
            startTime={session.startedAt}
            durationMinutes={session.durationMinutes}
            onTimeUp={handleSubmit}
          />
          <span className="text-sm text-th-text-muted">
            {t("exam.mcq_answered", lang, answeredCount, session.mcqQuestions.length)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSection("mcq")}
            className={`rounded px-3 py-1 text-sm ${
              currentSection === "mcq"
                ? "bg-th-selected text-th-text-accent"
                : "text-th-text-muted hover:bg-th-muted"
            }`}
          >
            {t("exam.mcq_section", lang)} ({mcqQuestions.length})
          </button>
          <button
            onClick={() => setCurrentSection("written")}
            className={`rounded px-3 py-1 text-sm ${
              currentSection === "written"
                ? "bg-th-selected text-th-text-accent"
                : "text-th-text-muted hover:bg-th-muted"
            }`}
          >
            {t("exam.written_section", lang)} ({writtenQuestions.length})
          </button>
          <button
            onClick={handleSubmit}
            className="ml-4 rounded-lg bg-th-error px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            {t("exam.submit", lang)}
          </button>
        </div>
      </div>

      {currentSection === "mcq" && mcqQuestions.length > 0 && (
        <div>
          <McqCard
            key={mcqQuestions[mcqIndex].id}
            question={mcqQuestions[mcqIndex]}
            selectedAnswer={session.mcqAnswers[mcqQuestions[mcqIndex].id]}
            onSelect={(key) => handleMcqSelect(mcqQuestions[mcqIndex].id, key)}
            disabled={false}
          />
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setMcqIndex((i) => Math.max(0, i - 1))}
              disabled={mcqIndex === 0}
              className="rounded border border-th-border px-3 py-1 text-sm text-th-text-muted disabled:opacity-30"
            >
              {t("practice.prev", lang)}
            </button>
            <span className="text-sm text-th-text-muted">
              {mcqIndex + 1} / {mcqQuestions.length}
            </span>
            <button
              onClick={() =>
                setMcqIndex((i) => Math.min(mcqQuestions.length - 1, i + 1))
              }
              disabled={mcqIndex === mcqQuestions.length - 1}
              className="rounded border border-th-border px-3 py-1 text-sm text-th-text-muted disabled:opacity-30"
            >
              {t("practice.next", lang)}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {mcqQuestions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setMcqIndex(i)}
                className={`h-7 w-7 rounded text-xs ${
                  i === mcqIndex
                    ? "bg-th-accent text-th-text-on-accent"
                    : session.mcqAnswers[q.id]
                      ? "bg-th-selected text-th-text-accent"
                      : "bg-th-muted text-th-text-faint"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentSection === "written" && writtenQuestions.length > 0 && (
        <div>
          <p className="mb-4 rounded-lg bg-th-warning-bg p-3 text-sm text-th-warning">
            {t("exam.written_note", lang)}
          </p>
          <WrittenCard
            key={writtenQuestions[writtenIndex].id}
            question={writtenQuestions[writtenIndex]}
            showSolution={false}
          />
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setWrittenIndex((i) => Math.max(0, i - 1))}
              disabled={writtenIndex === 0}
              className="rounded border border-th-border px-3 py-1 text-sm text-th-text-muted disabled:opacity-30"
            >
              {t("practice.prev", lang)}
            </button>
            <span className="text-sm text-th-text-muted">
              {writtenIndex + 1} / {writtenQuestions.length}
            </span>
            <button
              onClick={() =>
                setWrittenIndex((i) =>
                  Math.min(writtenQuestions.length - 1, i + 1)
                )
              }
              disabled={writtenIndex === writtenQuestions.length - 1}
              className="rounded border border-th-border px-3 py-1 text-sm text-th-text-muted disabled:opacity-30"
            >
              {t("practice.next", lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
