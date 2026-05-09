import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { McqQuestion, WrittenQuestion } from "../src/types";

const require = createRequire(import.meta.url);
require.extensions[".css"] = () => {};

const { default: McqCard } = require("../src/components/McqCard");
const { default: WrittenCard } = require("../src/components/WrittenCard");
const { default: SolutionPanel } = require("../src/components/SolutionPanel");
const { default: SourceFilterBar } = require("../src/components/SourceFilterBar");

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

test("solution panels render markdown emphasis instead of raw markers", () => {
  const html = renderToStaticMarkup(
    <SolutionPanel solution="**Correct answer:** $2 + 2 = 4$" />
  );

  assert.equal(html.includes("**Correct answer:**"), false);
  assert.equal(html.includes("<strong>Correct answer:</strong>"), true);
});

test("solution panels keep bold labels intact when they contain inline math", () => {
  const html = renderToStaticMarkup(
    <SolutionPanel solution="**Block $P_t$:** first\n\n**Block $P_{t+1}$:** next" />
  );

  assert.equal(html.includes("**Block"), false);
  assert.equal(html.includes("P_t"), true);
  assert.equal(html.includes("P_{t+1}"), true);
});

test("solution panels do not stall on unmatched inline markers", () => {
  const script = `
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    require.extensions[".css"] = () => {};
    const React = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const SolutionPanelModule = await import("./src/components/SolutionPanel.tsx");
    const SolutionPanel = SolutionPanelModule.default?.default ?? SolutionPanelModule.default;
    renderToStaticMarkup(React.createElement(SolutionPanel, {
      solution: "Escaped dollar \\\\$ and unmatched $ should render literally. **Unclosed bold"
    }));
  `;

  assert.doesNotThrow(() => {
    execFileSync(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "-e", script],
      { cwd: process.cwd(), stdio: "pipe", timeout: 2000 },
    );
  });
});

test("solution panels keep escaped dollars inside inline math", () => {
  const html = renderToStaticMarkup(
    <SolutionPanel solution="Sample $\\mathbf{s} \\leftarrow_\\$ [\\beta]^n$." />
  );

  assert.equal(html.includes("katex"), true);
});

test("multi-answer MCQ cards tell students they can select multiple options", () => {
  const html = renderToStaticMarkup(
    <McqCard
      question={{
        ...mcqQuestion,
        id: "test-multi-mcq",
        correctAnswer: "ab",
      }}
      onAnswer={() => {}}
    />
  );

  assert.equal(html.includes("Select all that apply."), true);
});

test("source filters wrap instead of forcing a clipped horizontal rail", () => {
  const html = renderToStaticMarkup(
    <SourceFilterBar value={new Set()} onChange={() => {}} />
  );

  assert.equal(html.includes("flex-wrap"), true);
  assert.equal(html.includes("overflow-x-auto"), false);
});
