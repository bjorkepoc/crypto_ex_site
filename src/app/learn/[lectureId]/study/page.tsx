"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useState } from "react";
import { usePrefs } from "@/lib/preferences";
import { useHydrated } from "@/lib/useHydrated";
import { t } from "@/lib/i18n";
import { topicNames } from "@/lib/i18n";
import { loadLearnState, markSectionRead, completeStudy } from "@/lib/learnStorage";
import { LectureId, ALL_LECTURE_IDS, STUDY_SECTIONS } from "@/types/learn";
import { getStudyContent, getTopicForLecture } from "@/data/learn";
import StudyViewer from "@/components/learn/StudyViewer";

function useLocalSectionsRead(lectureId: LectureId, hydrated: boolean) {
  // Initialize from storage; returns empty array on server
  const initial = hydrated
    ? (loadLearnState().lectureProgress[lectureId]?.studySectionsRead ?? [])
    : [];
  const [sectionsRead, setSectionsRead] = useState<string[]>(initial);

  const markRead = useCallback(
    (sectionId: string) => {
      markSectionRead(lectureId, sectionId);
      setSectionsRead((prev) =>
        prev.includes(sectionId) ? prev : [...prev, sectionId]
      );
    },
    [lectureId]
  );

  return { sectionsRead, markRead };
}

export default function StudyPage() {
  const hydrated = useHydrated();
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const params = useParams();
  const router = useRouter();
  const lectureId = params.lectureId as LectureId;

  const { sectionsRead, markRead } = useLocalSectionsRead(lectureId, hydrated);

  const handleComplete = useCallback(() => {
    completeStudy(lectureId);
    router.push(`/learn/${lectureId}`);
  }, [lectureId, router]);

  if (!hydrated) return null;

  if (!ALL_LECTURE_IDS.includes(lectureId)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-th-text-muted">{t("learn.lecture_not_found", lang)}</p>
      </div>
    );
  }

  const content = getStudyContent(lectureId);
  if (!content) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-th-text-muted">{t("learn.no_content", lang)}</p>
      </div>
    );
  }

  const topicId = getTopicForLecture(lectureId);
  const topicName = topicId ? (topicNames[topicId]?.[lang] ?? lectureId) : lectureId;

  const trackableSections = STUDY_SECTIONS.filter((s) => s !== "main-point");
  const allRead = trackableSections.every((s) => sectionsRead.includes(s));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/learn/${lectureId}`}
        className="text-sm text-th-text-accent hover:underline mb-4 inline-block"
      >
        {t("learn.back_to_lecture", lang)}
      </Link>

      <div className="mb-6">
        <p className="text-xs text-th-text-muted mb-1">{lectureId} · {t("learn.study", lang)}</p>
        <h1 className="text-xl font-bold text-th-text">{topicName}</h1>
      </div>

      <StudyViewer
        content={content}
        sectionsRead={sectionsRead}
        onSectionRead={markRead}
        onComplete={handleComplete}
        allRead={allRead}
      />
    </div>
  );
}
