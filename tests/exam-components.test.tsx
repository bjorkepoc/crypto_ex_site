import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { McqQuestion, WrittenQuestion } from "../src/types";

const require = createRequire(import.meta.url);
require.extensions[".css"] = () => {};

const { default: McqCard } = require("../src/components/McqCard");
const { default: WrittenCard } = require("../src/components/WrittenCard");

const mcqQuestion: McqQuestion = {
  id: "test-mcq",
  type: "mcq",
  source: { type: "exam", label: "Exam 2025" },
  topics: ["number-theory-basics"],
  difficulty: 1,
  text: "What is 2 + 2?",
  options: [
    { key: "a", text: "3" },
    { key: "b", text: "4" },
    { key: "c", text: "5" },
    { key: "d", text: "6" },
  ],
  correctAnswer: "b",
  solution: "2 + 2 = 4.",
};

const writtenQuestion: WrittenQuestion = {
  id: "test-written",
  type: "written",
  source: { type: "exam", label: "Exam 2025" },
  topics: ["number-theory-basics"],
  difficulty: 1,
  text: "Show the calculation.",
  totalPoints: 2,
  parts: [
    {
      partLabel: "a",
      text: "Compute 2 + 2.",
      points: 2,
      solution: "The result is 4.",
    },
  ],
};

test("MCQ cards used for active exams do not expose answer checking", () => {
  const html = renderToStaticMarkup(
    <McqCard
      question={mcqQuestion}
      selectedAnswer="a"
      onSelect={() => {}}
    />
  );

  assert.equal(html.includes("Check answer"), false);
  assert.equal(html.includes("2 + 2 = 4."), false);
});

test("written review cards can show solutions and still expose self assessment", () => {
  const html = renderToStaticMarkup(
    <WrittenCard
      question={writtenQuestion}
      showSolution={true}
      onScore={() => {}}
    />
  );

  assert.equal(html.includes("The result is 4."), true);
  assert.equal(html.includes("Self-assessment"), true);
  assert.equal(html.includes("Save self-assessment"), true);
});
