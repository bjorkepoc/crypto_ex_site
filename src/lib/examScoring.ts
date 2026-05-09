import type { ExamSession, McqQuestion, WrittenQuestion } from "@/types";
import {
  MCQ_CORRECT_POINTS,
  scoreMcq,
  scoreWritten,
  totalExamScore,
} from "@/lib/scoring";

export function scoreExamSession(
  session: ExamSession,
  mcqQuestions: McqQuestion[],
  writtenQuestions: WrittenQuestion[],
) {
  const correctAnswers: Record<string, string> = {};
  const optionCounts: Record<string, number> = {};
  for (const q of mcqQuestions) {
    correctAnswers[q.id] = q.correctAnswer;
    optionCounts[q.id] = q.options.length;
  }

  const mcqResult = scoreMcq(session.mcqAnswers, correctAnswers, optionCounts);
  const writtenResult = scoreWritten(session.writtenScores);
  const mcqMax = mcqQuestions.length * MCQ_CORRECT_POINTS;
  const writtenMax = writtenQuestions.reduce(
    (sum, q) => sum + Number(q.totalPoints || 0),
    0,
  );
  const total = totalExamScore(mcqResult.total, writtenResult, mcqMax + writtenMax);

  return {
    mcqResult,
    writtenResult,
    mcqMax,
    writtenMax,
    total,
  };
}

export function withExamScore(
  session: ExamSession,
  mcqQuestions: McqQuestion[],
  writtenQuestions: WrittenQuestion[],
): ExamSession {
  const { total } = scoreExamSession(session, mcqQuestions, writtenQuestions);
  return {
    ...session,
    totalScore: total.total,
    totalMaxScore: total.max,
  };
}
