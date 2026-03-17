"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { usePrefs } from "@/lib/preferences";
import { useHydrated } from "@/lib/useHydrated";
import { t } from "@/lib/i18n";
import { topicNames } from "@/lib/i18n";
import { loadLearnState } from "@/lib/learnStorage";
import { LectureId, ALL_LECTURE_IDS } from "@/types/learn";
import { getTopicForLecture, getMcqCountForLecture } from "@/data/learn";
import StageProgress from "@/components/learn/StageProgress";
import StarRating from "@/components/learn/StarRating";

export default function LectureHubPage() {
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const params = useParams();
  const lectureId = params.lectureId as LectureId;

  if (!hydrated) return null;

  if (!ALL_LECTURE_IDS.includes(lectureId)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-th-text-muted">{t("learn.lecture_not_found", lang)}</p>
        <Link href="/learn" className="text-sm text-th-text-accent hover:underline mt-2 inline-block">
          {t("learn.back", lang)}
        </Link>
      </div>
    );
  }

  const state = loadLearnState();
  const lp = state.lectureProgress[lectureId];
  const topicId = getTopicForLecture(lectureId);
  const topicName = topicId ? (topicNames[topicId]?.[lang] ?? lectureId) : lectureId;
  const mcqCount = getMcqCountForLecture(lectureId);

  if (lp.stage === "locked") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/learn" className="text-sm text-th-text-accent hover:underline mb-4 inline-block">
          {t("learn.back", lang)}
        </Link>
        <h1 className="text-xl font-bold text-th-text mb-2">{topicName}</h1>
        <p className="text-th-text-muted">{t("learn.locked_msg", lang)}</p>
      </div>
    );
  }

  const stages = [
    {
      key: "study" as const,
      label: t("learn.study", lang),
      desc: t("learn.study_desc", lang),
      href: `/learn/${lectureId}/study`,
      available: true,
      done: ["practice", "quiz", "mastered"].includes(lp.stage),
    },
    {
      key: "practice" as const,
      label: t("learn.practice", lang),
      desc: t("learn.practice_desc", lang, mcqCount),
      href: `/learn/${lectureId}/practice`,
      available: lp.stage !== "study",
      done: ["quiz", "mastered"].includes(lp.stage),
      extra: lp.practiceAttempts > 0 ? `${t("learn.best", lang)}: ${lp.practiceScore}%` : undefined,
    },
    {
      key: "quiz" as const,
      label: t("learn.quiz", lang),
      desc: t("learn.quiz_desc", lang),
      href: `/learn/${lectureId}/practice?mode=quiz`,
      available: lp.stage === "quiz" || lp.stage === "mastered",
      done: lp.stage === "mastered",
      extra: lp.quizAttempts > 0 ? `${t("learn.best", lang)}: ${lp.quizScore}%` : undefined,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/learn" className="text-sm text-th-text-accent hover:underline mb-4 inline-block">
        {t("learn.back", lang)}
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-th-text-muted mb-1">{lectureId}</p>
          <h1 className="text-xl font-bold text-th-text">{topicName}</h1>
        </div>
        <StarRating stars={lp.masteryStars} />
      </div>

      <div className="mb-6">
        <StageProgress currentStage={lp.stage} />
      </div>

      {lp.xpEarned > 0 && (
        <p className="text-xs text-th-text-accent mb-4">{lp.xpEarned} XP {t("learn.earned", lang)}</p>
      )}

      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.key}>
            {stage.available ? (
              <Link
                href={stage.href}
                className={`block rounded-lg border p-4 transition-colors ${
                  stage.done
                    ? "border-th-success-border bg-th-success-bg"
                    : "border-th-border bg-th-card hover:border-th-border-accent hover:bg-th-card-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm font-semibold ${stage.done ? "text-th-success" : "text-th-text"}`}>
                      {stage.done ? "\u2713 " : ""}{stage.label}
                    </h3>
                    <p className="text-xs text-th-text-muted mt-0.5">{stage.desc}</p>
                  </div>
                  {stage.extra && (
                    <span className="text-xs text-th-text-muted">{stage.extra}</span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="rounded-lg border border-th-border bg-th-card p-4 opacity-40">
                <h3 className="text-sm font-semibold text-th-text-faint">{stage.label}</h3>
                <p className="text-xs text-th-text-faint mt-0.5">{stage.desc}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
