"use client";

import MathText from "./MathText";

interface AlphaItem {
  label: string;
  body: string;
}

interface ParsedAlphaList {
  intro: string;
  items: AlphaItem[];
}

function isSequentialAlpha(labels: string[]): boolean {
  if (labels.length < 2) return false;
  if (labels[0] !== "a") return false;
  for (let i = 1; i < labels.length; i++) {
    if (labels[i].charCodeAt(0) !== labels[i - 1].charCodeAt(0) + 1) {
      return false;
    }
  }
  return true;
}

function parseAlphaList(raw: string): ParsedAlphaList | null {
  const text = raw.replace(/\r\n/g, "\n");
  const markerRegex = /\(([a-z])\)\s+/gi;
  const matches = [...text.matchAll(markerRegex)];

  if (matches.length < 2) return null;

  const labels = matches.map((m) => m[1].toLowerCase());
  if (!isSequentialAlpha(labels)) return null;

  const firstIndex = matches[0].index ?? -1;
  if (firstIndex < 0) return null;

  const intro = text.slice(0, firstIndex).trim();
  const items: AlphaItem[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const start = (current.index ?? 0) + current[0].length;
    const end = i + 1 < matches.length
      ? (matches[i + 1].index ?? text.length)
      : text.length;
    const body = text.slice(start, end).trim();
    if (!body) continue;
    items.push({ label: current[1].toLowerCase(), body });
  }

  if (items.length < 2) return null;
  return { intro, items };
}

export default function AlphaListText({ text }: { text: string }) {
  const parsed = parseAlphaList(text);

  if (!parsed) {
    return (
      <div className="whitespace-pre-line">
        <MathText text={text} />
      </div>
    );
  }

  return (
    <div>
      {parsed.intro && (
        <div className="mb-3 whitespace-pre-line">
          <MathText text={parsed.intro} />
        </div>
      )}
      <ol className="list-[lower-alpha] space-y-2 pl-6 marker:font-medium marker:text-th-text-faint">
        {parsed.items.map((item) => (
          <li key={item.label}>
            <div className="whitespace-pre-line">
              <MathText text={item.body} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
