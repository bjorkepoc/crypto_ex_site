"use client";

import { LearningStage } from "@/types/learn";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";

const STAGES: { key: LearningStage; labelKey: "learn.study" | "learn.practice" | "learn.quiz" | "learn.mastered" }[] = [
  { key: "study", labelKey: "learn.study" },
  { key: "practice", labelKey: "learn.practice" },
  { key: "quiz", labelKey: "learn.quiz" },
  { key: "mastered", labelKey: "learn.mastered" },
];

const STAGE_ORDER: LearningStage[] = ["locked", "study", "practice", "quiz", "mastered"];

interface StageProgressProps {
  currentStage: LearningStage;
  compact?: boolean;
}

export default function StageProgress({ currentStage, compact }: StageProgressProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1">
      {STAGES.map((stage, i) => {
        const stageIdx = STAGE_ORDER.indexOf(stage.key);
        const isComplete = currentIdx > stageIdx;
        const isCurrent = currentIdx === stageIdx;

        return (
          <div key={stage.key} className="flex items-center gap-1">
            <div
              className={`rounded-full transition-colors ${
                compact ? "h-1.5 w-6" : "h-2 w-8"
              } ${
                isComplete
                  ? "bg-th-success"
                  : isCurrent
                    ? "bg-th-accent"
                    : "bg-th-bar"
              }`}
            />
            {!compact && (
              <span
                className={`text-xs ${
                  isComplete
                    ? "text-th-success"
                    : isCurrent
                      ? "text-th-text-accent"
                      : "text-th-text-faint"
                }`}
              >
                {t(stage.labelKey, lang)}
              </span>
            )}
            {i < STAGES.length - 1 && !compact && <span className="text-th-text-faint mx-0.5">·</span>}
          </div>
        );
      })}
    </div>
  );
}
