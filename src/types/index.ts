export type TopicId =
  | "number-theory-basics"
  | "classical-encryption"
  | "hill-stream-otp"
  | "block-ciphers"
  | "encryption-modes"
  | "hashes-macs"
  | "number-theory-pk"
  | "public-key-rsa"
  | "discrete-log-crypto"
  | "digital-signatures"
  | "key-establishment"
  | "quantum-safe"
  | "tls"
  | "tls13-ipsec"
  | "email-messaging-security";

export interface Topic {
  id: TopicId;
  name: string;
  lecture: string;
  description: string;
}

export type QuestionType = "mcq" | "written";

export interface QuestionSource {
  type: "exam" | "exercise" | "generated";
  label: string;
}

export interface McqOption {
  key: string; // "a", "b", "c", "d"
  text: string; // supports KaTeX via $...$
}

export interface McqQuestion {
  id: string;
  type: "mcq";
  topics: TopicId[];
  source: QuestionSource;
  difficulty: 1 | 2 | 3;
  text: string;
  options: McqOption[];
  correctAnswer: string; // "a", "b", "c", "d"
  solution: string; // markdown with KaTeX
}

export interface WrittenPart {
  partLabel: string; // "a", "b", "c"
  points: number;
  text: string;
  solution: string;
}

export interface WrittenQuestion {
  id: string;
  type: "written";
  topics: TopicId[];
  source: QuestionSource;
  difficulty: 1 | 2 | 3;
  text: string;
  parts: WrittenPart[];
  totalPoints: number;
}

export type Question = McqQuestion | WrittenQuestion;

// Exam session types
export interface ExamSession {
  id: string;
  startedAt: number;
  finishedAt?: number;
  durationMinutes: number;
  mcqQuestions: string[]; // question ids
  writtenQuestions: string[]; // question ids
  mcqAnswers: Record<string, string | null>; // questionId -> selected key or null
  writtenScores: Record<string, number>; // questionId -> self-assessed score
  totalScore?: number;
}

// Progress tracking
export interface TopicStats {
  topicId: TopicId;
  mcqAttempted: number;
  mcqCorrect: number;
  writtenAttempted: number;
  writtenTotalPoints: number;
  writtenScoredPoints: number;
  lastPracticed?: number;
}

export interface UserProgress {
  topicStats: Record<TopicId, TopicStats>;
  examSessions: ExamSession[];
  practiceHistory: PracticeAttempt[];
}

export interface PracticeAttempt {
  questionId: string;
  topicId: TopicId;
  timestamp: number;
  correct?: boolean; // MCQ only
  selfScore?: number; // written only
}
