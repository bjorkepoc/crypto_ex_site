import {
  UserProgress,
  TopicStats,
  TopicId,
  ExamSession,
  PracticeAttempt,
} from "@/types";
import { topics } from "@/data/topics";

const STORAGE_KEY = "cryptoex_progress";

function defaultTopicStats(topicId: TopicId): TopicStats {
  return {
    topicId,
    mcqAttempted: 0,
    mcqCorrect: 0,
    writtenAttempted: 0,
    writtenTotalPoints: 0,
    writtenScoredPoints: 0,
  };
}

function defaultProgress(): UserProgress {
  const topicStats: Record<string, TopicStats> = {};
  for (const t of topics) {
    topicStats[t.id] = defaultTopicStats(t.id);
  }
  return {
    topicStats: topicStats as Record<TopicId, TopicStats>,
    examSessions: [],
    practiceHistory: [],
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as UserProgress;
    // Ensure all topics exist (handles new topics added later)
    for (const t of topics) {
      if (!parsed.topicStats[t.id]) {
        parsed.topicStats[t.id] = defaultTopicStats(t.id);
      }
    }
    return parsed;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordMcqAttempt(
  topicId: TopicId,
  correct: boolean
): void {
  const progress = loadProgress();
  const stats = progress.topicStats[topicId];
  stats.mcqAttempted++;
  if (correct) stats.mcqCorrect++;
  stats.lastPracticed = Date.now();

  progress.practiceHistory.push({
    questionId: "",
    topicId,
    timestamp: Date.now(),
    correct,
  });

  saveProgress(progress);
}

export function recordPracticeAttempt(attempt: PracticeAttempt): void {
  const progress = loadProgress();
  const stats = progress.topicStats[attempt.topicId];

  if (attempt.correct !== undefined) {
    stats.mcqAttempted++;
    if (attempt.correct) stats.mcqCorrect++;
  }
  if (attempt.selfScore !== undefined) {
    stats.writtenAttempted++;
    stats.writtenScoredPoints += attempt.selfScore;
    stats.writtenTotalPoints += 6; // max per question
  }

  stats.lastPracticed = Date.now();
  progress.practiceHistory.push(attempt);
  saveProgress(progress);
}

export function saveExamSession(session: ExamSession): void {
  const progress = loadProgress();
  const existingIdx = progress.examSessions.findIndex(
    (s) => s.id === session.id
  );
  if (existingIdx >= 0) {
    progress.examSessions[existingIdx] = session;
  } else {
    progress.examSessions.push(session);
  }
  saveProgress(progress);
}

export function getExamSession(sessionId: string): ExamSession | null {
  const progress = loadProgress();
  return progress.examSessions.find((s) => s.id === sessionId) ?? null;
}
