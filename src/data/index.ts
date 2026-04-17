import { Question, TopicId, McqQuestion, WrittenQuestion } from "@/types";
import type { SourceFilterSet } from "@/components/SourceFilterBar";
import { filterBySource } from "@/lib/questionFilters";
import exam2025 from "./questions/exam-2025.json";
import exam2025Resit from "./questions/exam-2025-resit.json";
import exam2024 from "./questions/exam-2024.json";
import exam2023 from "./questions/exam-2023.json";
import exam2022 from "./questions/exam-2022.json";
import exam2021 from "./questions/exam-2021.json";
import exam2021Resit from "./questions/exam-2021-resit.json";
import exam2020 from "./questions/exam-2020.json";
import exam2018 from "./questions/exam-2018.json";
import exam2018Resit from "./questions/exam-2018-resit.json";
import exam2017 from "./questions/exam-2017.json";
import exam2017Resit from "./questions/exam-2017-resit.json";
import exam2016 from "./questions/exam-2016.json";
import exam2016Resit from "./questions/exam-2016-resit.json";
import exam2015 from "./questions/exam-2015.json";
import exam2015Resit from "./questions/exam-2015-resit.json";
import lecture09 from "./questions/lecture-09.json";
import lecture10 from "./questions/lecture-10.json";
import nlmBatch from "./questions/notebooklm-batch.json";

// Cast imported JSON to typed arrays
const allQuestions: Question[] = [
  ...exam2025 as unknown as Question[],
  ...exam2025Resit as unknown as Question[],
  ...exam2024 as unknown as Question[],
  ...exam2023 as unknown as Question[],
  ...exam2022 as unknown as Question[],
  ...exam2021 as unknown as Question[],
  ...exam2021Resit as unknown as Question[],
  ...exam2020 as unknown as Question[],
  ...exam2018 as unknown as Question[],
  ...exam2018Resit as unknown as Question[],
  ...exam2017 as unknown as Question[],
  ...exam2017Resit as unknown as Question[],
  ...exam2016 as unknown as Question[],
  ...exam2016Resit as unknown as Question[],
  ...exam2015 as unknown as Question[],
  ...exam2015Resit as unknown as Question[],
  ...lecture09 as unknown as Question[],
  ...lecture10 as unknown as Question[],
  ...nlmBatch as unknown as Question[],
];

export function getAllQuestions(): Question[] {
  return allQuestions;
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}

export function getQuestionsByTopic(topicId: TopicId): Question[] {
  return allQuestions.filter((q) => q.topics.includes(topicId));
}

export function getMcqsByTopic(topicId: TopicId): McqQuestion[] {
  return allQuestions.filter(
    (q): q is McqQuestion => q.type === "mcq" && q.topics.includes(topicId)
  );
}

export function getWrittenByTopic(topicId: TopicId): WrittenQuestion[] {
  return allQuestions.filter(
    (q): q is WrittenQuestion =>
      q.type === "written" && q.topics.includes(topicId)
  );
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const idSet = new Set(ids);
  return allQuestions.filter((q) => idSet.has(q.id));
}

export function getTopicQuestionCounts(
  sourceFilter?: SourceFilterSet
): Record<TopicId, { mcq: number; written: number }> {
  const qs = sourceFilter ? filterBySource(allQuestions, sourceFilter) : allQuestions;
  const counts = {} as Record<TopicId, { mcq: number; written: number }>;
  for (const q of qs) {
    for (const t of q.topics) {
      if (!counts[t]) counts[t] = { mcq: 0, written: 0 };
      counts[t][q.type === "mcq" ? "mcq" : "written"]++;
    }
  }
  return counts;
}

export function getFilteredQuestions(sourceFilter: SourceFilterSet): Question[] {
  return filterBySource(allQuestions, sourceFilter);
}
