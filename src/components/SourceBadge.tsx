import { QuestionSource } from "@/types";

const colorMap: Record<string, string> = {
  exam: "bg-th-badge-blue-bg text-th-badge-blue",
  exercise: "bg-th-badge-green-bg text-th-badge-green",
  generated: "bg-th-badge-yellow-bg text-th-badge-yellow",
};

export default function SourceBadge({ source }: { source: QuestionSource }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[source.type] ?? "bg-th-muted text-th-text-muted"}`}
    >
      {source.label}
    </span>
  );
}
