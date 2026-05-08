import { TopicId, McqQuestion } from "@/types";
import { LectureId, LectureStudyContent, SynthesisContent } from "@/types/learn";
import { topics } from "@/data/topics";
import { getMcqsByTopic } from "@/data/index";
import studyGuideData from "./study-guide.json";
import synthesisData from "./synthesis.json";

const studyGuide = studyGuideData as LectureStudyContent[];
const synthesis = synthesisData as SynthesisContent;

/** Map from lecture ID to topic ID */
const lectureToTopic = new Map<string, TopicId>(
  topics.map((t) => [t.lecture, t.id])
);

/** Map from lecture ID to topic name */
const lectureToTopicName = new Map<string, string>(
  topics.map((t) => [t.lecture, t.name])
);

export function getStudyContent(lectureId: LectureId): LectureStudyContent | undefined {
  return studyGuide.find((l) => l.lectureId === lectureId);
}

export function getAllStudyContent(): LectureStudyContent[] {
  return studyGuide;
}

export function getSynthesis(): SynthesisContent {
  return synthesis;
}

export function getTopicForLecture(lectureId: LectureId): TopicId | undefined {
  return lectureToTopic.get(lectureId);
}

export function getTopicNameForLecture(lectureId: LectureId): string {
  return lectureToTopicName.get(lectureId) ?? lectureId;
}

export function getMcqsForLecture(lectureId: LectureId): McqQuestion[] {
  const topicId = lectureToTopic.get(lectureId);
  if (!topicId) return [];
  return getMcqsByTopic(topicId);
}

export function getMcqCountForLecture(lectureId: LectureId): number {
  return getMcqsForLecture(lectureId).length;
}
