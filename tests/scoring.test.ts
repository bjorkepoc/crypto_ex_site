import assert from "node:assert/strict";
import test from "node:test";

import { scoreMcq } from "../src/lib/scoring";

test("MCQ scoring uses the answer option count for the wrong-answer penalty", () => {
  const result = scoreMcq(
    { q1: "b", q2: "a" },
    { q1: "a", q2: "a" },
    { q1: 3, q2: 3 }
  );

  assert.equal(result.correct, 1);
  assert.equal(result.incorrect, 1);
  assert.equal(result.total, 0.5);
});

test("MCQ scoring normalizes multi-answer selections before comparison", () => {
  const result = scoreMcq(
    { q1: "ba" },
    { q1: "ab" },
    { q1: 4 }
  );

  assert.equal(result.correct, 1);
  assert.equal(result.total, 1);
});
