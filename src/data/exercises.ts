import { ExerciseItem, ExerciseSet, TopicId } from "@/types";
import { topicMap } from "./topics";
import e1 from "./exercises/E-1.json";
import e2 from "./exercises/E-2.json";
import e3 from "./exercises/E-3.json";
import e4 from "./exercises/E-4.json";
import e5 from "./exercises/E-5.json";
import e6 from "./exercises/E-6.json";
import e7 from "./exercises/E-7.json";
import e8 from "./exercises/E-8.json";

function lectureSortKey(lecture: string): number {
  const m = /^L-(\d+)$/i.exec(lecture.trim());
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function dedupeTopics(topics: TopicId[]): TopicId[] {
  return [...new Set(topics)] as TopicId[];
}

function dedupeAndSortLectures(lectures: string[]): string[] {
  return [...new Set(lectures)].sort((a, b) => lectureSortKey(a) - lectureSortKey(b));
}

function inferLecturesFromTopics(topics: TopicId[]): string[] {
  const inferred = topics
    .map((topicId) => topicMap.get(topicId)?.lecture)
    .filter((lecture): lecture is string => Boolean(lecture));
  return dedupeAndSortLectures(inferred);
}

function normalizeExerciseItem(
  item: ExerciseItem,
  fallbackTopics: TopicId[],
  fallbackLectures: string[],
): ExerciseItem {
  const topics =
    item.topics && item.topics.length > 0
      ? dedupeTopics(item.topics)
      : fallbackTopics;
  const inferredLectures = inferLecturesFromTopics(topics);
  const lectures =
    item.lectures && item.lectures.length > 0
      ? dedupeAndSortLectures(item.lectures)
      : inferredLectures.length > 0
        ? inferredLectures
        : fallbackLectures;
  return { ...item, topics, lectures };
}

const importedSets: ExerciseSet[] = [
  ...e1 as unknown as ExerciseSet[],
  ...e2 as unknown as ExerciseSet[],
  ...e3 as unknown as ExerciseSet[],
  ...e4 as unknown as ExerciseSet[],
  ...e5 as unknown as ExerciseSet[],
  ...e6 as unknown as ExerciseSet[],
  ...e7 as unknown as ExerciseSet[],
  ...e8 as unknown as ExerciseSet[],
];

const allSets: ExerciseSet[] = importedSets.map((set) => {
  const setTopics = dedupeTopics(set.topics);
  const setLectures =
    set.lectures && set.lectures.length > 0
      ? dedupeAndSortLectures(set.lectures)
      : inferLecturesFromTopics(setTopics);

  const exercises = set.exercises.map((item) =>
    normalizeExerciseItem(item, setTopics, setLectures),
  );

  const mergedTopics = dedupeTopics(
    exercises.flatMap((item) => item.topics ?? []),
  );
  const mergedLectures = dedupeAndSortLectures(
    exercises.flatMap((item) => item.lectures ?? []),
  );

  return {
    ...set,
    topics: mergedTopics.length > 0 ? mergedTopics : setTopics,
    lectures: mergedLectures.length > 0 ? mergedLectures : setLectures,
    exercises,
  };
});

export function getAllExerciseSets(): ExerciseSet[] {
  return allSets;
}

export function getExerciseSetById(id: string): ExerciseSet | undefined {
  return allSets.find((s) => s.id === id);
}
