import { Question, TopicId } from "@/types";
import type { SourceFilterSet } from "@/components/SourceFilterBar";

/** Filter questions by a set of active source filters. Empty set = all questions. */
export function filterBySource(
  questions: Question[],
  filters: SourceFilterSet
): Question[] {
  if (filters.size === 0) return questions;

  return questions.filter((q) => {
    for (const f of filters) {
      if (f === "all") return true;
      if (f === "exercise" && q.source.type === "exercise") return true;
      if (f === "generated" && q.source.type === "generated") return true;
      if (f === "exam" && q.source.type === "exam") return true;
      if (f.startsWith("exam-")) {
        const year = f.slice(5);
        if (q.source.type === "exam" && q.source.label.includes(year)) return true;
      }
    }
    return false;
  });
}

export function filterByTopic(questions: Question[], topicId: TopicId): Question[] {
  return questions.filter((q) => q.topics.includes(topicId));
}

export function filterByType(
  questions: Question[],
  type: "mcq" | "written"
): Question[] {
  return questions.filter((q) => q.type === type);
}

export function filterByDifficulty(
  questions: Question[],
  difficulty: 1 | 2 | 3
): Question[] {
  return questions.filter((q) => q.difficulty === difficulty);
}
