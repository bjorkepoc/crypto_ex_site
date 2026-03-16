import { McqQuestion, WrittenQuestion, ExamSession } from "@/types";
import { getAllQuestions } from "@/data";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateExam(options?: {
  mcqCount?: number;
  writtenCount?: number;
  durationMinutes?: number;
}): ExamSession {
  const mcqCount = options?.mcqCount ?? 30;
  const writtenCount = options?.writtenCount ?? 5;
  const durationMinutes = options?.durationMinutes ?? 180;

  const questions = getAllQuestions();
  const mcqs = shuffle(
    questions.filter((q): q is McqQuestion => q.type === "mcq")
  ).slice(0, mcqCount);
  const writtens = shuffle(
    questions.filter((q): q is WrittenQuestion => q.type === "written")
  ).slice(0, writtenCount);

  const mcqAnswers: Record<string, null> = {};
  for (const q of mcqs) {
    mcqAnswers[q.id] = null;
  }

  return {
    id: `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startedAt: Date.now(),
    durationMinutes,
    mcqQuestions: mcqs.map((q) => q.id),
    writtenQuestions: writtens.map((q) => q.id),
    mcqAnswers,
    writtenScores: {},
  };
}
