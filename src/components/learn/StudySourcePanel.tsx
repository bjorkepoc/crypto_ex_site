"use client";

import { useState } from "react";
import Link from "next/link";
import { McqQuestion, TopicId } from "@/types";
import { LectureId } from "@/types/learn";
import { topicMap } from "@/data/topics";
import { getStudyContent } from "@/data/learn";
import { topicNames } from "@/lib/i18n";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";
import MathText from "@/components/MathText";

interface StudySourcePanelProps {
  question: McqQuestion;
}

/** Find the most relevant study section(s) for a question based on its solution text */
function findRelevantSections(
  question: McqQuestion,
  lectureId: LectureId
): { sectionId: string; sectionTitle: string; relevance: string }[] {
  const content = getStudyContent(lectureId);
  if (!content) return [];

  const solutionLower = question.solution.toLowerCase();
  const textLower = question.text.toLowerCase();
  const combined = solutionLower + " " + textLower;

  const results: { sectionId: string; sectionTitle: string; relevance: string; score: number }[] = [];

  for (const section of content.sections) {
    const sectionLower = section.content.toLowerCase();
    // Score by keyword overlap between question+solution and section content
    const sectionWords = new Set(sectionLower.split(/\W+/).filter((w) => w.length > 4));
    const combinedWords = combined.split(/\W+/).filter((w) => w.length > 4);
    let overlap = 0;
    for (const word of combinedWords) {
      if (sectionWords.has(word)) overlap++;
    }

    if (overlap > 2) {
      // Extract a relevant snippet from the section
      const sentences = section.content.split(/\.\s+/);
      let bestSentence = "";
      let bestScore = 0;
      for (const sentence of sentences) {
        const sentLower = sentence.toLowerCase();
        let sentScore = 0;
        for (const word of combinedWords) {
          if (sentLower.includes(word)) sentScore++;
        }
        if (sentScore > bestScore) {
          bestScore = sentScore;
          bestSentence = sentence;
        }
      }

      results.push({
        sectionId: section.id,
        sectionTitle: section.title,
        relevance: bestSentence.length > 150
          ? bestSentence.slice(0, 150).trim() + "..."
          : bestSentence + ".",
        score: overlap,
      });
    }
  }

  // Sort by relevance score, take top 2
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 2);
}

export default function StudySourcePanel({ question }: StudySourcePanelProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;
  const [expanded, setExpanded] = useState(false);

  // Map question topics to lectures
  const lectureLinks: {
    lectureId: LectureId;
    topicId: TopicId;
    topicName: string;
    sections: { sectionId: string; sectionTitle: string; relevance: string }[];
  }[] = [];

  for (const topicId of question.topics) {
    const topic = topicMap.get(topicId);
    if (!topic) continue;
    const lectureId = topic.lecture as LectureId;
    const name = topicNames[topicId]?.[lang] ?? topic.name;
    const sections = findRelevantSections(question, lectureId);
    lectureLinks.push({
      lectureId,
      topicId,
      topicName: name,
      sections,
    });
  }

  if (lectureLinks.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-th-border bg-th-card overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-th-card-hover"
      >
        <span className="text-xs font-medium text-th-text-accent">
          {t("learn.where_to_study", lang)}
        </span>
        <span className="text-th-text-muted text-xs">
          {expanded ? "\u25B2" : "\u25BC"}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-th-border px-4 py-3 space-y-3">
          {lectureLinks.map((link) => (
            <div key={link.lectureId} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-th-accent text-[10px] font-bold text-th-text-on-accent">
                  {link.lectureId.replace("L-", "")}
                </span>
                <Link
                  href={`/learn/${link.lectureId}/study`}
                  className="text-sm font-medium text-th-text-accent hover:underline"
                >
                  {link.topicName}
                </Link>
                <span className="text-xs text-th-text-faint">{link.lectureId}</span>
              </div>
              {link.sections.length > 0 && (
                <div className="ml-7 space-y-1">
                  {link.sections.map((sec) => (
                    <div key={sec.sectionId} className="text-xs">
                      <span className="font-medium text-th-text-secondary">
                        {sec.sectionTitle}:
                      </span>{" "}
                      <span className="text-th-text-muted">
                        <MathText text={sec.relevance} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-1">
            <Link
              href={`/learn/${lectureLinks[0].lectureId}/study`}
              className="text-xs text-th-text-accent hover:underline"
            >
              {t("learn.go_study", lang)} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
