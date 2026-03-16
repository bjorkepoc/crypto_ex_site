import { Question, TopicId } from "@/types";

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
