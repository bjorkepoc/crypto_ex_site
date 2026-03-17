"use client";

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

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-th-text-accent">{level.name}</span>
      <div className="flex-1 h-2 rounded-full bg-th-bar overflow-hidden">
        <div
          className="h-full rounded-full bg-th-accent transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-th-text-muted">{totalXp} XP</span>
    </div>
  );
}
