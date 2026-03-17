"use client";

import Link from "next/link";
import { LectureProgress, LectureId } from "@/types/learn";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";
import { topicNames } from "@/lib/i18n";
import { getTopicForLecture, getMcqCountForLecture } from "@/data/learn";
import StarRating from "./StarRating";
import StageProgress from "./StageProgress";

interface LectureNodeProps {
  lectureId: LectureId;
  progress: LectureProgress;
  index: number;
}

export default function LectureNode({ lectureId, progress, index }: LectureNodeProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const topicId = getTopicForLecture(lectureId);
  const topicName = topicId ? (topicNames[topicId]?.[lang] ?? lectureId) : lectureId;
  const mcqCount = getMcqCountForLecture(lectureId);
  const isLocked = progress.stage === "locked";

  const content = (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isLocked
          ? "border-th-border bg-th-card opacity-50"
          : "border-th-border bg-th-card hover:border-th-border-accent hover:bg-th-card-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              isLocked
                ? "bg-th-muted text-th-text-faint"
                : progress.stage === "mastered"
                  ? "bg-th-success-bg text-th-success"
                  : "bg-th-accent text-th-text-on-accent"
            }`}
          >
            {isLocked ? "\uD83D\uDD12" : index + 1}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-th-text truncate">{topicName}</h3>
            <p className="text-xs text-th-text-muted mt-0.5">
              {lectureId} · {mcqCount} {t("learn.questions", lang)}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <StarRating stars={progress.masteryStars} size="sm" />
          {progress.xpEarned > 0 && (
            <span className="text-xs text-th-text-muted">{progress.xpEarned} XP</span>
          )}
        </div>
      </div>
      {!isLocked && (
        <div className="mt-3">
          <StageProgress currentStage={progress.stage} compact />
        </div>
      )}
    </div>
  );

  if (isLocked) return <div>{content}</div>;

  return (
    <Link href={`/learn/${lectureId}`} className="block">
      {content}
    </Link>
  );
}
