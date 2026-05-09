import assert from "node:assert/strict";
import test from "node:test";

import {
  canEditExamSession,
  canReviewExamSession,
} from "../src/lib/examReviewGuard";
import { withExamScore } from "../src/lib/examScoring";
import type { ExamSession, McqQuestion, WrittenQuestion } from "../src/types";

function makeSession(overrides: Partial<ExamSession> = {}): ExamSession {
  return {
    id: "exam-1",
    startedAt: 1,
    durationMinutes: 180,
    mcqQuestions: [],
    writtenQuestions: [],
    mcqAnswers: {},
    writtenScores: {},
    ...overrides,
  };
}

test("exam review is blocked until the session has been submitted", () => {
  assert.equal(canReviewExamSession(null), false);
  assert.equal(canReviewExamSession(makeSession()), false);
  assert.equal(canReviewExamSession(makeSession({ finishedAt: 2 })), true);
});

test("submitted exam sessions are not editable from the active exam route", () => {
  assert.equal(canEditExamSession(null), false);
  assert.equal(canEditExamSession(makeSession()), true);
  assert.equal(canEditExamSession(makeSession({ finishedAt: 2 })), false);
});

test("submitted exam sessions receive score metadata before written self-assessment", () => {
  const mcq: McqQuestion = {
    id: "mcq-1",
    type: "mcq",
    source: { type: "exam", label: "Exam" },
    topics: ["number-theory-basics"],
    difficulty: 1,
    text: "Pick A.",
    options: [
      { key: "a", text: "A" },
      { key: "b", text: "B" },
    ],
    correctAnswer: "a",
    solution: "A is correct.",
  };
  const written: WrittenQuestion = {
    id: "written-1",
    type: "written",
    source: { type: "exam", label: "Exam" },
    topics: ["number-theory-basics"],
    difficulty: 1,
    text: "Explain.",
    totalPoints: 5,
    parts: [{ partLabel: "a", text: "Explain.", points: 5, solution: "Because." }],
  };
  const session = makeSession({
    finishedAt: 2,
    mcqQuestions: [mcq.id],
    writtenQuestions: [written.id],
    mcqAnswers: { [mcq.id]: "a" },
  });

  const scored = withExamScore(session, [mcq], [written]);

  assert.equal(scored.totalScore, 1);
  assert.equal(scored.totalMaxScore, 6);
});
