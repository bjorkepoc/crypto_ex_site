"use client";

import { useRef, useCallback } from "react";
import { getLevel, LEVELS } from "@/types/learn";

interface XpBarProps {
  totalXp: number;
}

export default function XpBar({ totalXp }: XpBarProps) {
  const level = getLevel(totalXp);
  const levelIdx = LEVELS.findIndex((l) => l.name === level.name);
  const nextLevel = levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : null;
  const progress = nextLevel
    ? ((totalXp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100
    : 100;

  const prevLevelRef = useRef(level.name);

  // Detect level change via ref comparison during render (no setState needed)
  const levelChanged = prevLevelRef.current !== level.name;
  if (levelChanged) {
    prevLevelRef.current = level.name;
  }

  // Ref callback: apply a temporary glow when level changes
  const barCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && levelChanged) {
        node.style.boxShadow = "0 0 8px 2px var(--bg-accent)";
        setTimeout(() => { node.style.boxShadow = ""; }, 1500);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level.name]
  );

  const nearFull = progress >= 90 && progress < 100;

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-semibold text-th-text-accent${levelChanged ? " anim-fade-in-scale" : ""}`}>
        {level.name}
      </span>
      <div
        ref={barCallbackRef}
        className="flex-1 h-2 rounded-full bg-th-bar overflow-hidden transition-shadow duration-500"
        style={nearFull ? { boxShadow: "0 0 4px 1px var(--bg-accent)" } : undefined}
      >
        <div
          className="h-full rounded-full bg-th-accent transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-th-text-muted">{totalXp} XP</span>
    </div>
  );
}
