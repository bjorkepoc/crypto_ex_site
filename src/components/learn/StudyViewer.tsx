"use client";

import { useState, useCallback } from "react";
import { LectureStudyContent, STUDY_SECTIONS } from "@/types/learn";
import MathText from "@/components/MathText";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";

interface StudyViewerProps {
  content: LectureStudyContent;
  sectionsRead: string[];
  onSectionRead: (sectionId: string) => void;
  onComplete: () => void;
  allRead: boolean;
}

export default function StudyViewer({
  content,
  sectionsRead,
  onSectionRead,
  onComplete,
  allRead,
}: StudyViewerProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback(
    (sectionId: string) => {
      const wasExpanded = expandedSections.has(sectionId);
      setExpandedSections((prev) => {
        const next = new Set(prev);
        if (next.has(sectionId)) {
          next.delete(sectionId);
        } else {
          next.add(sectionId);
        }
        return next;
      });
      // Mark as read when expanding (not collapsing)
      if (!wasExpanded && !sectionsRead.includes(sectionId)) {
        onSectionRead(sectionId);
      }
    },
    [sectionsRead, onSectionRead, expandedSections]
  );

  const readCount = sectionsRead.length;
  // main-point is always shown, so total trackable sections = 4 (themes, know-cold, hard-parts, objectives)
  const totalSections = STUDY_SECTIONS.length - 1; // exclude main-point from accordion count
  const expandableSections = content.sections; // these are: themes, know-cold, hard-parts, objectives

  return (
    <div className="space-y-4">
      {/* Main point - always visible */}
      <div className="rounded-lg border border-th-border-accent bg-th-selected p-4">
        <h3 className="text-xs font-semibold uppercase text-th-text-accent mb-2">
          {t("learn.main_point", lang)}
        </h3>
        <div className="text-sm text-th-text leading-relaxed">
          <MathText text={content.mainPoint} />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-th-text-muted">
        <span>
          {t("learn.sections_read", lang, readCount, totalSections)}
        </span>
        {allRead && (
          <span className="text-th-success font-medium">{t("learn.all_read", lang)}</span>
        )}
      </div>

      {/* Expandable sections */}
      <div className="space-y-2">
        {expandableSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const isRead = sectionsRead.includes(section.id);

          return (
            <div
              key={section.id}
              className="rounded-lg border border-th-border bg-th-card overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-th-card-hover"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                      isRead
                        ? "bg-th-success-bg text-th-success"
                        : "bg-th-muted text-th-text-faint"
                    }`}
                  >
                    {isRead ? "\u2713" : "\u25CB"}
                  </span>
                  <span className="text-sm font-medium text-th-text">
                    {section.title}
                  </span>
                </div>
                <span className="text-th-text-muted text-sm">
                  {isExpanded ? "\u25B2" : "\u25BC"}
                </span>
              </button>
              {isExpanded && (
                <div className="border-t border-th-border px-4 py-3">
                  <div className="text-sm text-th-text-secondary leading-relaxed prose-sm">
                    {section.content.split("\n").map((line, i) => (
                      <div key={i} className={line.startsWith("- ") ? "ml-4 mb-1" : "mb-2"}>
                        {line.startsWith("- ") ? (
                          <div className="flex gap-2">
                            <span className="text-th-text-faint shrink-0">•</span>
                            <MathText text={line.slice(2)} />
                          </div>
                        ) : line.trim() === "" ? null : (
                          <MathText text={line} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete button */}
      {allRead && (
        <button
          onClick={onComplete}
          className="w-full rounded-lg bg-th-accent px-4 py-3 text-sm font-semibold text-th-text-on-accent transition-colors hover:bg-th-accent-hover"
        >
          {t("learn.continue_practice", lang)}
        </button>
      )}
    </div>
  );
}
