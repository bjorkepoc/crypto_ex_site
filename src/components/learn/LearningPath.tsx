"use client";

import { LearnState, ALL_LECTURE_IDS } from "@/types/learn";
import LectureNode from "./LectureNode";

interface LearningPathProps {
  state: LearnState;
}

export default function LearningPath({ state }: LearningPathProps) {
  const completedCount = ALL_LECTURE_IDS.filter(
    (id) => state.lectureProgress[id].stage !== "locked"
  ).length;
  const progressPct = (completedCount / ALL_LECTURE_IDS.length) * 100;

  // First lecture that is unlocked but not mastered
  const currentId = ALL_LECTURE_IDS.find((id) => {
    const s = state.lectureProgress[id].stage;
    return s !== "locked" && s !== "mastered";
  });

  return (
    <div className="relative space-y-3">
      {/* Connecting line (background) */}
      <div className="absolute left-[1.9rem] top-4 bottom-4 w-0.5 bg-th-border -z-10 hidden sm:block" />
      {/* Progress fill */}
      <div
        className="absolute left-[1.9rem] top-4 w-0.5 bg-th-accent -z-10 hidden sm:block transition-all duration-700"
        style={{ height: `${progressPct}%` }}
      />
      {ALL_LECTURE_IDS.map((id, i) => (
        <LectureNode
          key={id}
          lectureId={id}
          progress={state.lectureProgress[id]}
          index={i}
          isCurrent={id === currentId}
        />
      ))}
    </div>
  );
}
