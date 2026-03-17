# CryptoEx — TTM4135 Exam Practice

Local-first Next.js app for practicing NTNU TTM4135 Applied Cryptography exam
content. Answer questions by topic, simulate full exams, review step-by-step
solutions with KaTeX math, and track weak areas.

## Features

- **Topic dashboard** — 15 topics mapped to course lectures (L-1 through L-15)
- **Learning path** (`/learn`) — gamified lecture-by-lecture study with 4 stages
  per lecture: Study → Practice → Quiz → Mastered. XP system, mastery stars
  (0–3), daily streaks, and level progression (Beginner → Master)
- **Study viewer** — curated study content per lecture (main point, themes,
  know-cold, hard parts, objectives) parsed from `LECTURE_STUDY_GUIDE.md`
- **"Where to study" panel** — after answering any MCQ, see which lecture
  section(s) cover that concept with relevant snippets and direct links
- **Practice mode** — MCQ + written questions one at a time, instant feedback
  with worked solutions and hints
- **Exercise sets** — 79 exercises across 8 worksheets (E-1 through E-8) with
  per-task topic/lecture tagging
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
├── app/                    # Next.js pages
│   ├── learn/              # Learning path (new)
│   │   ├── page.tsx              # Path overview with XP, streaks, lecture map
│   │   └── [lectureId]/
│   │       ├── page.tsx          # Lecture hub (stage selector)
│   │       ├── study/page.tsx    # Study content viewer
│   │       └── practice/page.tsx # Practice MCQs (?mode=quiz for quiz)
│   ├── practice/           # Free practice by topic
│   ├── exercises/          # Exercise worksheets
│   ├── exam/               # Exam simulation
│   └── progress/           # Stats and history
├── components/
│   ├── learn/              # Learn-specific components (new)
│   │   ├── LearningPath.tsx      # Vertical lecture map
│   │   ├── LectureNode.tsx       # Lecture card with stars + stage
│   │   ├── StudyViewer.tsx       # Accordion study sections
│   │   ├── PracticeSession.tsx   # MCQ practice with hints + XP
│   │   ├── StudySourcePanel.tsx  # "Where to study" question linker
│   │   ├── StageProgress.tsx     # 4-stage stepper
│   │   ├── StarRating.tsx        # 0-3 star display
│   │   └── XpBar.tsx             # XP counter with level
│   ├── McqCard.tsx, WrittenCard.tsx, SolutionPanel.tsx, Timer, etc.
├── data/
│   ├── topics.ts           # 15 topic definitions
│   ├── questions/          # JSON question banks
│   ├── exercises/          # E-1 through E-8 worksheets
│   ├── learn/              # Learn feature data (new)
│   │   ├── study-guide.json      # Parsed LECTURE_STUDY_GUIDE.md
│   │   ├── synthesis.json        # Cross-lecture synthesis content
│   │   └── index.ts              # Query helpers
│   └── index.ts            # Question aggregator + query helpers
├── lib/
│   ├── storage.ts          # localStorage for practice progress
│   ├── learnStorage.ts     # localStorage for learn state (new)
│   ├── scoring.ts          # MCQ penalty scoring
│   ├── examGenerator.ts    # Random balanced exam builder
│   ├── preferences.tsx     # Theme + language context
│   ├── i18n.ts             # Translation strings (EN/NO)
│   └── useHydrated.ts      # SSR hydration guard
├── types/
│   ├── index.ts            # Question, ExamSession, UserProgress types
│   └── learn.ts            # Learn types, XP/level system (new)
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
