import { Question, TopicId, McqQuestion, WrittenQuestion } from "@/types";
import exam2025 from "./questions/exam-2025.json";
import exam2024 from "./questions/exam-2024.json";
import exam2023 from "./questions/exam-2023.json";
import exam2022 from "./questions/exam-2022.json";
import lecture09 from "./questions/lecture-09.json";
import lecture10 from "./questions/lecture-10.json";
import nlmBatch from "./questions/notebooklm-batch.json";

// Cast imported JSON to typed arrays
const allQuestions: Question[] = [
  ...exam2025 as unknown as Question[],
  ...exam2024 as unknown as Question[],
  ...exam2023 as unknown as Question[],
  ...exam2022 as unknown as Question[],
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

export function getTopicQuestionCounts(): Record<
  TopicId,
  { mcq: number; written: number }
> {
  const counts = {} as Record<TopicId, { mcq: number; written: number }>;
  for (const q of allQuestions) {
    for (const t of q.topics) {
      if (!counts[t]) counts[t] = { mcq: 0, written: 0 };
      counts[t][q.type === "mcq" ? "mcq" : "written"]++;
    }
  }
  return counts;
}
