import type { ExamSession } from "@/types";

export function canReviewExamSession(
  session: Pick<ExamSession, "finishedAt"> | null | undefined,
): boolean {
  return typeof session?.finishedAt === "number";
}

export function canEditExamSession(
  session: Pick<ExamSession, "finishedAt"> | null | undefined,
): boolean {
  return Boolean(session) && !canReviewExamSession(session);
}
