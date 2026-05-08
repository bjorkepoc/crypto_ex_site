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

function fromCodes(codes: number[]): string {
  return String.fromCharCode(...codes);
}

function literalPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped.replace(/\\ /g, "\\s+"), "iu");
}

test("staged files do not include local identities or personal source paths", () => {
  const username = process.env.USERNAME ?? process.env.USER ?? "";
  const courseCode = ["TTM", "4135"].join("");
  const institution = ["NT", "NU"].join("");
  const generationTool = ["Notebook", "LM"].join("");
  const sensitiveNames = [
    fromCodes([75, 114, 105, 115, 116, 105, 97, 110]),
    fromCodes([71, 106, 248, 115, 116, 101, 101, 110]),
    fromCodes([
      84, 104, 101, 111, 100, 111, 114, 111, 115,
    ]),
    fromCodes([
      67, 104, 111, 110, 100, 114, 111, 103, 105, 97, 110, 110, 105, 115,
    ]),
  ];
  const mojibakeResearcherSurname = fromCodes([
    71, 106, 195, 184, 115, 116, 101, 101, 110,
  ]);
  const namedResearcherFull = fromCodes([
    75, 114, 105, 115, 116, 105, 97, 110, 32, 71, 106, 248, 115, 116, 101, 101, 110,
  ]);
  const namedLecturerFull = fromCodes([
    84, 104, 101, 111, 100, 111, 114, 111, 115, 32, 67, 104, 111, 110, 100, 114, 111,
    103, 105, 97, 110, 110, 105, 115,
  ]);
  const forbidden = [
    { label: "Windows user home path", pattern: /[A-Za-z]:\\Users\\/i },
    {
      label: "local OS username",
      pattern: username ? new RegExp(`\\b${username}\\b`, "i") : null,
    },
    {
      label: "named researcher in generated study content",
      pattern: literalPattern(namedResearcherFull),
    },
    {
      label: "named lecturer in generated study content",
      pattern: literalPattern(namedLecturerFull),
    },
    ...sensitiveNames.map((term) => ({
      label: "person-name fragment",
      pattern: literalPattern(term),
    })),
    { label: "person-name mojibake fragment", pattern: literalPattern(mojibakeResearcherSurname) },
    { label: "course code", pattern: new RegExp(`\\b${courseCode}\\b`, "i") },
    { label: "institution name", pattern: new RegExp(`\\b${institution}\\b`, "i") },
    { label: "generation tool label", pattern: new RegExp(`\\b${generationTool}\\b`, "i") },
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
