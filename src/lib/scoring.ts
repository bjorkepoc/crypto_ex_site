export const MCQ_CORRECT_POINTS = 1;
export const MCQ_PENALTY = -1 / 3;
export const MCQ_UNANSWERED_POINTS = 0;

export function scoreMcq(
  answers: Record<string, string | null>,
  correctAnswers: Record<string, string>
): { correct: number; incorrect: number; unanswered: number; total: number } {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const qId of Object.keys(correctAnswers)) {
    const answer = answers[qId];
    if (!answer) {
      unanswered++;
    } else if (answer === correctAnswers[qId]) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const total =
    correct * MCQ_CORRECT_POINTS +
    incorrect * MCQ_PENALTY +
    unanswered * MCQ_UNANSWERED_POINTS;

  return { correct, incorrect, unanswered, total: Math.max(0, total) };
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
