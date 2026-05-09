"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { Fragment } from "react";

function isEscaped(text: string, index: number): boolean {
  let slashCount = 0;
  for (let i = index - 1; i >= 0 && text[i] === "\\"; i--) {
    slashCount++;
  }
  return slashCount % 2 === 1;
}

function findUnescaped(text: string, token: string, from: number): number {
  let index = text.indexOf(token, from);
  while (index >= 0) {
    if (!isEscaped(text, index)) return index;
    index = text.indexOf(token, index + token.length);
  }
  return -1;
}

function renderInlineText(
  text: string,
  nextKey: () => number,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    if (text.startsWith("**", index) && !isEscaped(text, index)) {
      const end = findUnescaped(text, "**", index + 2);
      if (end >= 0) {
        nodes.push(
          <strong key={nextKey()}>
            {renderInlineText(text.slice(index + 2, end), nextKey)}
          </strong>,
        );
        index = end + 2;
        continue;
      }
      nodes.push(<Fragment key={nextKey()}>{text.slice(index, index + 2)}</Fragment>);
      index += 2;
      continue;
    }

    if (text[index] === "$" && !isEscaped(text, index)) {
      const end = findUnescaped(text, "$", index + 1);
      if (end >= 0) {
        nodes.push(
          <InlineMath key={nextKey()} math={text.slice(index + 1, end)} />,
        );
        index = end + 1;
        continue;
      }
      nodes.push(<Fragment key={nextKey()}>{text[index]}</Fragment>);
      index++;
      continue;
    }

    const nextBold = findUnescaped(text, "**", index);
    const nextMath = findUnescaped(text, "$", index);
    const candidates = [nextBold, nextMath].filter((pos) => pos >= 0);
    const next = candidates.length > 0 ? Math.min(...candidates) : text.length;
    if (next > index) {
      nodes.push(<Fragment key={nextKey()}>{text.slice(index, next)}</Fragment>);
      index = next;
    } else {
      nodes.push(<Fragment key={nextKey()}>{text[index]}</Fragment>);
      index++;
    }
  }

  return nodes;
}

// Splits text on $...$ (inline) and $$...$$ (block) and renders KaTeX
export default function MathText({ text }: { text: string }) {
  // First split on block math $$...$$, then inline $...$
  const parts: React.ReactNode[] = [];
  const remaining = text;
  let key = 0;
  const nextKey = () => key++;

  // Process block math first
  const blockRegex = /\$\$([\s\S]*?)\$\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const segments: { type: "text" | "block"; content: string }[] = [];
  while ((match = blockRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: remaining.slice(lastIndex, match.index) });
    }
    segments.push({ type: "block", content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < remaining.length) {
    segments.push({ type: "text", content: remaining.slice(lastIndex) });
  }

  for (const seg of segments) {
    if (seg.type === "block") {
      parts.push(<BlockMath key={nextKey()} math={seg.content} />);
    } else {
      // Process inline math within text segments
      parts.push(...renderInlineText(seg.content, nextKey));
    }
  }

  return <span>{parts}</span>;
}
