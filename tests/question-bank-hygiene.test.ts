import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

type Question = {
  id: string;
  type: "mcq" | "written";
  text: string;
  solution?: string;
  options?: { text: string }[];
};

const questions = JSON.parse(
  readFileSync("src/data/questions/generated-batch.json", "utf8")
) as Question[];

test("generated question bank contains only cryptography study questions", () => {
  const offTopic = questions.filter((q) => {
    const haystack = [
      q.text,
      q.solution ?? "",
      ...(q.options ?? []).map((option) => option.text),
    ]
      .join(" ")
      .toLowerCase();

    return /\b(sql|relational data model|written examination weighting|overall assessment)\b/.test(
      haystack
    );
  });

  assert.deepEqual(
    offTopic.map((q) => q.id),
    []
  );
});

test("generated question IDs use neutral prefixes", () => {
  const legacyPrefix = ["n", "lm-"].join("");

  assert.deepEqual(
    questions.filter((q) => q.id.startsWith(legacyPrefix)).map((q) => q.id),
    []
  );
});
