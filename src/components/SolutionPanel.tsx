"use client";

import AlphaListText from "./AlphaListText";
import { usePrefs } from "@/lib/preferences";
import { t } from "@/lib/i18n";

interface SolutionPanelProps {
  solution: string;
  correct?: boolean;
}

export default function SolutionPanel({ solution, correct }: SolutionPanelProps) {
  const { prefs } = usePrefs();
  const lang = prefs.lang;

  return (
    <div className="mt-4 rounded-lg border border-th-border bg-th-muted p-4">
      {correct !== undefined && (
        <div
          className={`mb-2 text-sm font-semibold ${correct ? "text-th-success" : "text-th-error"}`}
        >
          {correct ? t("mcq.correct", lang) : t("mcq.incorrect", lang)}
        </div>
      )}
      <div className="text-sm leading-relaxed text-th-text-secondary">
        {solution.split("\n\n").map((paragraph, i) => (
          <div key={i} className={i > 0 ? "mt-3" : ""}>
            <AlphaListText text={paragraph} />
          </div>
        ))}
      </div>
    </div>
  );
}
