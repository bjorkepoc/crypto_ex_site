# CryptoEx — TTM4135 Exam Practice

Local-first Next.js app for practicing NTNU TTM4135 Applied Cryptography exam
content. Answer questions by topic, simulate full exams, review step-by-step
solutions with KaTeX math, and track weak areas.

## Features

- **Topic dashboard** — 15 topics mapped to course lectures (L-1 through L-15)
- **Practice mode** — MCQ + written questions one at a time, instant feedback
  with worked solutions
- **Exam simulation** — timed 3-hour exam (30 MCQ with −0.33 penalty + 5
  written with self-assessment), full review after submission
- **Progress tracking** — per-topic accuracy bars, weakest-first sorting, exam
  history
- **EN/NO language toggle** — full English and Norwegian UI
- **3 themes** — Light, Mild (warm muted palette), Dark

All data stored in localStorage. No backend, no accounts.

## Tech Stack

| Layer     | Choice                                          |
| --------- | ----------------------------------------------- |
| Framework | Next.js 16 (App Router) + TypeScript            |
| Styling   | Tailwind CSS 4 with CSS-variable theme system   |
| Math      | KaTeX via `react-katex` + `remark-math`         |
| Storage   | localStorage (single-user, no backend)          |

## Getting Started

```bash
npm install
npm run dev -- -p 4000
```

> Port 3000 may be blocked by Hyper-V on Windows. Use `-p 4000` or any port
> outside the excluded range.

Open [http://localhost:4000](http://localhost:4000).

## Project Structure

```
src/
├── app/                    # Next.js pages (dashboard, practice, exam, progress)
├── components/             # McqCard, WrittenCard, SolutionPanel, Timer, etc.
├── data/
│   ├── topics.ts           # 15 topic definitions
│   ├── questions/          # JSON question banks
│   │   ├── exam-2025.json        # 30 MCQ + 5 written (manual)
│   │   ├── lecture-09.json       # 10 MCQ + 2 written (manual)
│   │   ├── lecture-10.json       # 10 MCQ + 1 written (manual)
│   │   └── notebooklm-batch.json # 286 MCQ (auto-generated)
│   ├── notebooklm-raw/    # Raw quiz JSON from NotebookLM API
│   └── index.ts            # Aggregator + query helpers
├── lib/
│   ├── storage.ts          # localStorage wrapper for progress
│   ├── scoring.ts          # MCQ penalty scoring
│   ├── examGenerator.ts    # Random balanced exam builder
│   ├── preferences.tsx     # Theme + language context (useSyncExternalStore)
│   ├── i18n.ts             # Translation strings (EN/NO)
│   └── useHydrated.ts      # SSR hydration guard
├── types/index.ts          # Question, ExamSession, UserProgress types
scripts/
└── convert-nlm-quizzes.py  # NotebookLM → CryptoEx question converter
```

## Adding Questions

Create a JSON file in `src/data/questions/` following the schema in
`src/types/index.ts`, then import it in `src/data/index.ts`.

## Verification

```bash
npx tsc --noEmit   # Types
npm run lint        # ESLint
npm run build       # Production build
```

## Content

**344 questions** (336 MCQ + 8 written) across 15 topics:

| Source               | MCQ | Written | Total |
| -------------------- | --- | ------- | ----- |
| Exam 2025 (manual)   | 30  | 5       | 35    |
| Lecture 9 (manual)   | 10  | 2       | 12    |
| Lecture 10 (manual)  | 10  | 1       | 11    |
| NotebookLM (auto)    | 286 | 0       | 286   |

NotebookLM questions were generated from 21 course sources (lectures L-1–L-15,
exercises E-1–E-3, solution set S-1) using the `notebooklm-py` library, then
converted via `scripts/convert-nlm-quizzes.py` with keyword-based topic
classification and deduplication.

All questions use LaTeX notation rendered via KaTeX.
