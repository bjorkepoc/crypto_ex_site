export const MCQ_CORRECT_POINTS = 1;
export const MCQ_PENALTY = -1 / 3;
export const MCQ_UNANSWERED_POINTS = 0;

export function normalizeMcqAnswer(answer: string | null | undefined): string {
  if (!answer) return "";
  return Array.from(new Set(answer.split(""))).sort().join("");
}

export function isMcqAnswerCorrect(
  answer: string | null | undefined,
  correctAnswer: string
): boolean {
  return normalizeMcqAnswer(answer) === normalizeMcqAnswer(correctAnswer);
}

export function mcqPenaltyForOptionCount(optionCount: number | undefined): number {
  const count = Math.max(2, optionCount ?? 4);
  return -1 / (count - 1);
}

export function scoreMcq(
  answers: Record<string, string | null>,
  correctAnswers: Record<string, string>,
  optionCounts: Record<string, number> = {}
): { correct: number; incorrect: number; unanswered: number; total: number } {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let rawTotal = 0;

  for (const qId of Object.keys(correctAnswers)) {
    const answer = answers[qId];
    if (!answer) {
      unanswered++;
      rawTotal += MCQ_UNANSWERED_POINTS;
    } else if (isMcqAnswerCorrect(answer, correctAnswers[qId])) {
      correct++;
      rawTotal += MCQ_CORRECT_POINTS;
    } else {
      incorrect++;
      rawTotal += mcqPenaltyForOptionCount(optionCounts[qId]);
    }
  }

  return { correct, incorrect, unanswered, total: Math.max(0, rawTotal) };
}

export function scoreWritten(scores: Record<string, number>): number {
  return Object.values(scores).reduce((sum, s) => sum + s, 0);
}

export function totalExamScore(
  mcqScore: number,
  writtenScore: number,
  maxScore = 60
): { total: number; max: number; percentage: number } {
  const total = mcqScore + writtenScore;
  const max = maxScore > 0 ? maxScore : 1;
  return { total, max, percentage: (total / max) * 100 };
}
