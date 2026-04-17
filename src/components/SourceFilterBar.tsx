"use client";

import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";

export type SourceFilterId =
  | "all"
  | "exam"
  | "exercise"
  | "generated"
  | `exam-${ExamYear}`;

const EXAM_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2018, 2017, 2016, 2015] as const;
type ExamYear = (typeof EXAM_YEARS)[number];
type ExamYearFilterId = `exam-${ExamYear}`;

export type SourceFilterSet = ReadonlySet<SourceFilterId>;

/** Empty set = "all" (no filtering). */
export const EMPTY_FILTER: SourceFilterSet = new Set<SourceFilterId>();

const YEAR_IDS: ExamYearFilterId[] = EXAM_YEARS.map(
  (year) => `exam-${year}` as ExamYearFilterId
);

interface Props {
  value: SourceFilterSet;
  onChange: (next: SourceFilterSet) => void;
}

const filters: { id: SourceFilterId; labelKey: string }[] = [
  { id: "all", labelKey: "filter.all" },
  { id: "exam", labelKey: "filter.exams" },
  ...YEAR_IDS.map((id) => ({ id, labelKey: id.slice(5) })),
  { id: "generated", labelKey: "filter.notebook" },
];

export default function SourceFilterBar({ value, onChange }: Props) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;

  function handleClick(id: SourceFilterId) {
    if (id === "all") {
      // Reset to no filter
      onChange(EMPTY_FILTER);
      return;
    }

    if (id === "exam") {
      // Toggle: if all years are already selected, deselect them; otherwise select all years
      const allYearsActive = YEAR_IDS.every((y) => value.has(y));
      const next = new Set(value);
      // Remove "exam" broad flag and individual years
      next.delete("exam");
      for (const y of YEAR_IDS) next.delete(y);
      if (!allYearsActive) {
        for (const y of YEAR_IDS) next.add(y);
      }
      // Remove generated if we're adding exam filters
      if (next.size === 0) onChange(EMPTY_FILTER);
      else onChange(next);
      return;
    }

    // Toggle individual pill
    const next = new Set(value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    if (next.size === 0) onChange(EMPTY_FILTER);
    else onChange(next);
  }

  function isActive(id: SourceFilterId): boolean {
    if (id === "all") return value.size === 0;
    if (id === "exam") return YEAR_IDS.every((y) => value.has(y));
    return value.has(id);
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {filters.map((f) => {
        const active = isActive(f.id);
        const label = f.labelKey.startsWith("filter.")
          ? t(f.labelKey as Parameters<typeof t>[0], lang)
          : f.labelKey;
        return (
          <button
            key={f.id}
            onClick={() => handleClick(f.id)}
            className={`press shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-th-accent text-th-text-on-accent"
                : "bg-th-muted text-th-text-muted hover:bg-th-card-hover"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
