# HANDOFF.md - CryptoEx Project Context

> Last updated: 2026-03-16 | Keep concise and session-ready.

---

## 1. Project Overview

**Project:** `Projects/crypto_ex_site/`

**Purpose:** Practice app for TTM4135 Applied Cryptography exam preparation.

**Stack:** Next.js 16.1, React 19, TypeScript 5, Tailwind CSS 4, npm.

**Key files:**

- `CLAUDE.md` - project-specific working rules
- `HANDOFF.md` - curated project status snapshot
- `src/app/page.tsx` - dashboard entry page
- `src/app/exam/page.tsx` - exam setup flow
- `src/lib/preferences.tsx` - language/theme preferences store
- `src/data/questions/exam-2025.json` - question dataset

---

## 2. Current Status

- App routes exist for dashboard, exam, practice, and progress.
- Preferences store loop bug was fixed in `src/lib/preferences.tsx` by caching
  external store snapshots for `useSyncExternalStore`.
- Verification was run successfully:
  - `npm run lint`
  - `npm run build`
- Project-specific continuity files were added:
  - `Projects/crypto_ex_site/CLAUDE.md`
  - `Projects/crypto_ex_site/HANDOFF.md`
- Lessons policy was tightened:
  - `CLAUDE.md` now requires immediate `tasks/lessons.md` entries after
    mistake-triggering events
  - work cannot be marked complete while such a lesson entry is missing

---

## 3. Key Decisions

- Keep verification strict before completion (`lint` + `build` minimum).
- Require Codex cross-check for non-trivial code changes.
- Keep handoff updates in this file after meaningful changes.

---

## 4. Next Steps

- Add a dedicated `typecheck` npm script if desired.
- Add targeted tests for preferences and exam session flows.
- Keep this handoff current after each meaningful bug fix.

---

## 5. Context Notes

- This project currently has no project-local `.claude/` skill/rule tree.
- Workspace-level tooling and permissions still apply from `C:\Users\bjork\devC`.
