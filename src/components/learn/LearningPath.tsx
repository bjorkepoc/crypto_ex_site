"use client";

import { LearnState, ALL_LECTURE_IDS } from "@/types/learn";
import LectureNode from "./LectureNode";

interface LearningPathProps {
  state: LearnState;
}

export default function LearningPath({ state }: LearningPathProps) {
  return (
    <div className="relative space-y-3">
      {/* Connecting line */}
      <div className="absolute left-[1.9rem] top-4 bottom-4 w-0.5 bg-th-border -z-10 hidden sm:block" />
      {ALL_LECTURE_IDS.map((id, i) => (
        <LectureNode
          key={id}
          lectureId={id}
          progress={state.lectureProgress[id]}
          index={i}
        />
      ))}
    </div>
  );
}
