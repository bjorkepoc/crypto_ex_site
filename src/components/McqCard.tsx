"use client";

import { McqQuestion, McqOption } from "@/types";
import MathText from "./MathText";
import SourceBadge from "./SourceBadge";
import SolutionPanel from "./SolutionPanel";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";
import { useState, useMemo } from "react";

/** Simple seeded PRNG for deterministic shuffle per question */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b) + 0x1234567) | 0;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function shuffleOptions(options: McqOption[], questionId: string): McqOption[] {
  const rng = seededRandom(questionId);
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface McqCardProps {
  question: McqQuestion;
  onAnswer?: (questionId: string, correct: boolean) => void;
  showResult?: boolean;
  selectedAnswer?: string | null;
  disabled?: boolean;
  onSelect?: (key: string) => void;
}

export default function McqCard({
  question,
  onAnswer,
  showResult: externalShowResult,
  selectedAnswer: externalSelected,
  disabled,
  onSelect,
}: McqCardProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const [internalShowResult, setInternalShowResult] = useState(false);

  const selected = externalSelected !== undefined ? externalSelected : internalSelected;
  const showResult = externalShowResult !== undefined ? externalShowResult : internalShowResult;

  const displayOptions = useMemo(
    () => shuffleOptions(question.options, question.id),
    [question.options, question.id],
  );
  const displayLabels = ["a", "b", "c", "d"];

  function handleSelect(key: string) {
    if (showResult && !disabled) return;
    if (disabled) return;
    if (onSelect) {
      onSelect(key);
      return;
    }
    setInternalSelected(key);
  }

  function handleSubmit() {
    if (!selected) return;
    setInternalShowResult(true);
    onAnswer?.(question.id, selected === question.correctAnswer);
  }

  return (
    <div className="rounded-lg border border-th-border bg-th-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <SourceBadge source={question.source} />
        <span className="text-xs text-th-text-faint">
          {t("mcq.difficulty", lang, question.difficulty)}
        </span>
      </div>
      <div className="mb-4 text-th-text">
        <MathText text={question.text} />
      </div>
      <div className="mb-4 space-y-2">
        {displayOptions.map((opt, idx) => {
          let optionClass =
            "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors";
          if (showResult) {
            if (opt.key === question.correctAnswer) {
              optionClass += " border-th-success-border bg-th-success-bg text-th-success";
            } else if (opt.key === selected && opt.key !== question.correctAnswer) {
              optionClass += " border-th-error-border bg-th-error-bg text-th-error";
            } else {
              optionClass += " border-th-border text-th-text-muted";
            }
          } else if (opt.key === selected) {
            optionClass += " border-th-border-accent bg-th-selected text-th-text-accent";
          } else {
            optionClass += " border-th-border text-th-text-secondary hover:border-th-border-accent hover:bg-th-card-hover";
          }

          return (
            <button
              key={opt.key}
              className={optionClass}
              onClick={() => handleSelect(opt.key)}
              disabled={showResult || disabled}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold uppercase">
                {displayLabels[idx]}
              </span>
              <MathText text={opt.text} />
            </button>
          );
        })}
      </div>
      {!showResult && !disabled && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="rounded-lg bg-th-accent px-4 py-2 text-sm font-medium text-th-text-on-accent transition-colors hover:bg-th-accent-hover disabled:opacity-40"
        >
          {t("mcq.check", lang)}
        </button>
      )}
      {showResult && (
        <SolutionPanel
          solution={question.solution}
          correct={selected === question.correctAnswer}
        />
      )}
    </div>
  );
}
