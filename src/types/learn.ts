export type LectureId =
  | "L-1" | "L-2" | "L-3" | "L-4" | "L-5"
  | "L-6" | "L-7" | "L-8" | "L-9" | "L-10"
  | "L-11" | "L-12" | "L-13" | "L-14" | "L-15";

export type LearningStage = "locked" | "study" | "practice" | "quiz" | "mastered";

export interface LectureProgress {
  lectureId: LectureId;
  stage: LearningStage;
  studySectionsRead: string[];
  practiceScore: number;
  practiceAttempts: number;
  quizScore: number;
  quizAttempts: number;
  masteryStars: 0 | 1 | 2 | 3;
  xpEarned: number;
  lastActivity?: number;
}

export interface LearnState {
  lectureProgress: Record<LectureId, LectureProgress>;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // "YYYY-MM-DD"
  achievements: string[];
}

export interface StudySection {
  id: string;
  title: string;
  content: string;
}

export interface LectureStudyContent {
  lectureId: LectureId;
  title: string;
  mainPoint: string;
  sections: StudySection[];
}

export interface SynthesisContent {
  overview: string;
  priorityTopics: string[];
}

export const ALL_LECTURE_IDS: LectureId[] = [
  "L-1", "L-2", "L-3", "L-4", "L-5",
  "L-6", "L-7", "L-8", "L-9", "L-10",
  "L-11", "L-12", "L-13", "L-14", "L-15",
];

export const STUDY_SECTIONS = [
  "main-point",
  "themes",
  "know-cold",
  "hard-parts",
  "objectives",
] as const;

export type StudySectionId = (typeof STUDY_SECTIONS)[number];

export const XP_VALUES = {
  studyComplete: 20,
  practiceCorrectFirst: 5,
  practiceCorrectRetry: 2,
  quizPass: 50,
  quizTwoStar: 75,
  quizThreeStar: 100,
  dailyStreak: 10,
} as const;

export const LEVELS = [
  { name: "Beginner", minXp: 0 },
  { name: "Student", minXp: 100 },
  { name: "Apprentice", minXp: 300 },
  { name: "Cryptographer", minXp: 600 },
  { name: "Expert", minXp: 1000 },
  { name: "Master", minXp: 1500 },
] as const;

export function getLevel(xp: number): (typeof LEVELS)[number] {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}
