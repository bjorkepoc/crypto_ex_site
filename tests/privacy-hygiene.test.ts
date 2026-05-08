import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

const binaryExtensions = new Set([
  ".ico",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
]);

function stagedTextFiles(): string[] {
  return execFileSync("git", ["ls-files", "--cached"], { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => !binaryExtensions.has(path.extname(file).toLowerCase()));
}

function indexContent(file: string): string {
  return execFileSync("git", ["show", `:${file}`], { encoding: "utf8" });
}

function literalPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped.replace(/\\ /g, "\\s+"), "iu");
}

test("staged files do not include local identities or personal source paths", () => {
  const username = process.env.USERNAME ?? process.env.USER ?? "";
  const extraTerms = (process.env.CRYPTOEX_FORBIDDEN_TERMS ?? "")
    .split("|")
    .map((term) => term.trim())
    .filter(Boolean);
  const forbidden = [
    { label: "Windows user home path", pattern: /[A-Za-z]:\\Users\\/i },
    {
      label: "local OS username",
      pattern: username ? new RegExp(`\\b${username}\\b`, "i") : null,
    },
    { label: "course-like code", pattern: /\b[A-Z]{3}\d{4}\b/u },
    ...extraTerms.map((term) => ({
      label: "configured forbidden term",
      pattern: literalPattern(term),
    })),
  ];

  const findings: string[] = [];

  for (const file of stagedTextFiles()) {
    const content = indexContent(file);

    for (const rule of forbidden) {
      if (rule.pattern?.test(content)) {
        findings.push(`${file}: ${rule.label}`);
      }
    }
  }

  assert.deepEqual(findings, []);
});
