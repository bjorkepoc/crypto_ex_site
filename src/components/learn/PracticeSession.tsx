"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { McqQuestion } from "@/types";
import { XP_VALUES } from "@/types/learn";
import McqCard from "@/components/McqCard";
import StudySourcePanel from "@/components/learn/StudySourcePanel";
import XpToast from "@/components/learn/XpToast";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";

interface PracticeSessionProps {
  questions: McqQuestion[];
  onComplete: (correct: number, total: number) => void;
  onXpEarned: (amount: number) => void;
}

function normalizeHintLine(line: string): string {
  return line
    .replace(/^\s*[-*]\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function extractHintMarkdown(solution: string): string {
  const text = solution.replace(/\r\n/g, "\n").trim();
  if (!text) return "";

  const markdownHintMatch = text.match(/(?:^|\n)\s*\*\*Hint:\*\*\s*([\s\S]*)$/i);
  if (markdownHintMatch?.[1]) {
    return markdownHintMatch[1].trim();
  }

  const plainHintMatch = text.match(/(?:^|\n)\s*Hint:\s*([\s\S]*)$/i);
  if (plainHintMatch?.[1]) {
    return plainHintMatch[1].trim();
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const nonAnswerLine =
    lines.find((line) => !/^\**\s*correct answer\s*:?\**/i.test(line)) ?? lines[0] ?? "";

  return normalizeHintLine(nonAnswerLine);
}

export default function PracticeSession({
  questions,
  onComplete,
  onXpEarned,
}: PracticeSessionProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [sessionXp, setSessionXp] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);
  const [xpToast, setXpToast] = useState<{ amount: number; id: string } | null>(null);
  const toastCounter = useRef(0);

  const question = questions[currentIdx];
  const correctCount = Object.values(answers).filter(Boolean).length;

  const handleAnswer = useCallback(
    (questionId: string, correct: boolean) => {
      setAnswers((prev) => ({ ...prev, [questionId]: correct }));
      const usedHint = hintUsed.has(questionId);
      const xp = correct
        ? usedHint
          ? XP_VALUES.practiceCorrectRetry
          : XP_VALUES.practiceCorrectFirst
        : 0;
      if (xp > 0) {
        setSessionXp((prev) => prev + xp);
        onXpEarned(xp);
        toastCounter.current += 1;
        setXpToast({ amount: xp, id: `xp-${toastCounter.current}` });
      }
      setShowHint(false);
    },
    [hintUsed, onXpEarned]
  );

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setShowHint(false);
    } else {
      setFinished(true);
      onComplete(correctCount, questions.length);
    }
  }, [currentIdx, questions.length, correctCount, onComplete]);

  const handleShowHint = useCallback(() => {
    setShowHint(true);
    setHintUsed((prev) => new Set(prev).add(question.id));
  }, [question]);

  const hintMarkdown = useMemo(() => {
    if (!question) return "";
    return extractHintMarkdown(question.solution);
  }, [question]);

  if (!question) return null;

  if (finished) {
    const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const passed = pct >= 70;
    return (
      <div className={`rounded-lg border border-th-border bg-th-card p-6 text-center${passed ? " celebration-burst" : ""}`}>
        <h3 className="text-lg font-bold text-th-text mb-2 anim-fade-in">
          {t("learn.practice_complete", lang)}
        </h3>
        <p className="text-3xl font-bold text-th-text-accent mb-1 anim-fade-in-scale">{pct}%</p>
        <p className="text-sm text-th-text-muted mb-2 anim-fade-in" style={{ animationDelay: "100ms" }}>
          {t("learn.correct_of", lang, correctCount, questions.length)}
        </p>
        <p className="text-sm text-th-text-accent anim-float-up">+{sessionXp} XP</p>
        {pct < 70 && (
          <p className="text-xs text-th-text-muted mt-3 anim-fade-in" style={{ animationDelay: "200ms" }}>
            {t("learn.need_70", lang)}
          </p>
        )}
      </div>
    );
  }

  const isAnswered = question.id in answers;

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-th-text-muted">
          {t("learn.question_of", lang, currentIdx + 1, questions.length)}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-th-success">{correctCount} {t("learn.correct_short", lang)}</span>
          <span className="relative text-xs text-th-text-accent">
            +{sessionXp} XP
            {xpToast && <XpToast key={xpToast.id} amount={xpToast.amount} id={xpToast.id} />}
          </span>
        </div>
      </div>

      {/* Hint button */}
      {!isAnswered && !showHint && (
        <button
          onClick={handleShowHint}
          className="text-xs text-th-text-accent hover:underline"
        >
          {t("learn.need_hint", lang)}
        </button>
      )}
      {showHint && !isAnswered && hintMarkdown && (
        <div className="rounded-lg border border-th-border-accent bg-th-selected px-4 py-2 text-sm leading-relaxed text-th-text-secondary anim-fade-in">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
              ol: ({ children }) => (
                <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold text-th-text">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-th-text-accent underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  {children}
                </a>
              ),
            }}
          >
            {hintMarkdown}
          </ReactMarkdown>
        </div>
      )}

      {/* MCQ Card — key forces remount on question change to reset internal state */}
      <McqCard
        key={question.id}
        question={question}
        onAnswer={handleAnswer}
      />

      {/* Study source - shown after answering */}
      {isAnswered && <StudySourcePanel question={question} />}

      {/* Next button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full rounded-lg bg-th-accent px-4 py-2.5 text-sm font-medium text-th-text-on-accent transition-colors hover:bg-th-accent-hover"
        >
          {currentIdx < questions.length - 1
            ? t("practice.next", lang)
            : t("learn.finish", lang)}
        </button>
      )}
    </div>
  );
}
