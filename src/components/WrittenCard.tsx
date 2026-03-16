"use client";

import { WrittenQuestion } from "@/types";
import MathText from "./MathText";
import SourceBadge from "./SourceBadge";
import SolutionPanel from "./SolutionPanel";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";
import { useState } from "react";

interface WrittenCardProps {
  question: WrittenQuestion;
  onScore?: (questionId: string, score: number) => void;
  showSolution?: boolean;
  selfScore?: number;
}

export default function WrittenCard({
  question,
  onScore,
  showSolution: externalShow,
  selfScore: externalScore,
}: WrittenCardProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [showSolution, setShowSolution] = useState(externalShow ?? false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const isExternallyControlled = externalShow !== undefined;
  const show = isExternallyControlled ? externalShow : showSolution;

  function handleReveal() {
    setShowSolution(true);
  }

  function handlePartScore(partLabel: string, value: number) {
    setScores((prev) => ({ ...prev, [partLabel]: value }));
  }

  function handleSubmitScore() {
    const total = Object.values(scores).reduce((s, v) => s + v, 0);
    setSubmitted(true);
    onScore?.(question.id, total);
  }

  return (
    <div className="rounded-lg border border-th-border bg-th-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <SourceBadge source={question.source} />
        <span className="text-xs text-th-text-faint">
          {t("written.points", lang, question.totalPoints)} | {t("mcq.difficulty", lang, question.difficulty)}
        </span>
      </div>
      <div className="mb-4 text-th-text">
        <MathText text={question.text} />
      </div>
      <div className="mb-4 space-y-4">
        {question.parts.map((part) => (
          <div key={part.partLabel} className="rounded-lg border border-th-border-subtle bg-th-muted p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-th-text-secondary">
                {part.partLabel})
              </span>
              <span className="text-xs text-th-text-faint">{t("written.points", lang, part.points)}</span>
            </div>
            <div className="text-sm text-th-text-secondary">
              <MathText text={part.text} />
            </div>
            {show && (
              <div className="mt-3">
                <SolutionPanel solution={part.solution} />
                {!submitted && !isExternallyControlled && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs text-th-text-muted">
                      {t("written.self_assessment", lang)}:
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={part.points}
                      step={0.5}
                      value={scores[part.partLabel] ?? 0}
                      onChange={(e) =>
                        handlePartScore(part.partLabel, parseFloat(e.target.value))
                      }
                      className="w-32"
                    />
                    <span className="text-xs font-medium text-th-text-secondary">
                      {scores[part.partLabel] ?? 0}/{part.points}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {!show && !isExternallyControlled && (
        <button
          onClick={handleReveal}
          className="rounded-lg bg-th-muted px-4 py-2 text-sm font-medium text-th-text border border-th-border transition-colors hover:bg-th-card-hover"
        >
          {t("written.show_solution", lang)}
        </button>
      )}
      {show && !submitted && !isExternallyControlled && (
        <button
          onClick={handleSubmitScore}
          className="rounded-lg bg-th-accent px-4 py-2 text-sm font-medium text-th-text-on-accent transition-colors hover:bg-th-accent-hover"
        >
          {t("written.save_assessment", lang)}
        </button>
      )}
      {(submitted || externalScore !== undefined) && (
        <div className="mt-2 text-sm font-medium text-th-text-muted">
          {t(
            "written.self_score",
            lang,
            externalScore !== undefined
              ? externalScore
              : Object.values(scores).reduce((s, v) => s + v, 0),
            question.totalPoints
          )}
        </div>
      )}
    </div>
  );
}
