"use client";

import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { Fragment } from "react";

// Splits text on $...$ (inline) and $$...$$ (block) and renders KaTeX
export default function MathText({ text }: { text: string }) {
  // First split on block math $$...$$, then inline $...$
  const parts: React.ReactNode[] = [];
  const remaining = text;
  let key = 0;

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
      parts.push(<BlockMath key={key++} math={seg.content} />);
    } else {
      // Process inline math within text segments
      const inlineRegex = /\$(.*?)\$/g;
      let inlineLastIndex = 0;
      let inlineMatch: RegExpExecArray | null;
      while ((inlineMatch = inlineRegex.exec(seg.content)) !== null) {
        if (inlineMatch.index > inlineLastIndex) {
          parts.push(
            <Fragment key={key++}>
              {seg.content.slice(inlineLastIndex, inlineMatch.index)}
            </Fragment>
          );
        }
        parts.push(<InlineMath key={key++} math={inlineMatch[1]} />);
        inlineLastIndex = inlineMatch.index + inlineMatch[0].length;
      }
      if (inlineLastIndex < seg.content.length) {
        parts.push(
          <Fragment key={key++}>{seg.content.slice(inlineLastIndex)}</Fragment>
        );
      }
    }
  }

  return <span>{parts}</span>;
}
