# crypto_ex_site

## Project Overview

- Next.js app for TTM4135 cryptography exam practice.
- Includes dashboard, practice, exam simulation, and progress pages.
- Stack: Next.js 16.1, React 19, TypeScript 5, Tailwind CSS 4.

## Project Rules

- Keep code and identifiers in English.
- Keep user-facing text consistent with existing app language options.
- Prefer small, targeted fixes over broad rewrites.
- Preserve existing app structure unless a change clearly improves maintainability.

### Exercise Tagging Contract

- Exercise tasks are categorized individually.
- In `src/data/exercises/E-*.json`, each item inside `exercises[]` must carry its
  own `topics` and `lectures`.
- Do not rely on only set-level tags for task categorization.
- `lectures` must match the lecture mapping implied by task `topics` in
  `src/data/topics.ts`.
- When editing or adding exercise content, keep task tags precise (do not
  over-tag all tasks with all set topics).

## Workflow

### 1. Plan First

- For non-trivial work, write a short plan before editing.
- Include implementation and verification steps in the same plan.

### 2. Self-Improvement Loop

- Record meaningful corrections and preventable mistakes in
  `C:\Users\bjork\devC\tasks\lessons.md`.
- This is mandatory: add the lesson entry immediately after the mistake is
  identified, before moving on.
- Do not mark work complete while a lesson-triggering mistake is still
  unrecorded.
- Capture the preventive rule, not just the incident.

### 3. Verification Before Done

- Never call work complete without proving the result works.
- Run the real project commands before calling work complete.
- `npm run lint` and `npm run build` are expected to pass.
- For exercise data changes, verify all tasks still have valid per-task
  `topics`/`lectures` mappings.
- If a `typecheck` script is missing, say so explicitly instead of implying it ran.
- For non-trivial code changes, run an independent Codex cross-check before
  marking done (`cmd /c codex ...` on Windows when needed).
- If Codex findings conflict with your conclusion, resolve or explain the
  discrepancy before completion.
- If Codex is unavailable, state that explicitly and do not present the work as
  fully verified.

### 4. Context Continuity

- `HANDOFF.md` is the explicit handoff file for this project.
- Update `HANDOFF.md` after meaningful progress, fixes, or workflow changes.

## Maintenance

- Keep this file focused on stable project rules.
- Put active status and session results in `HANDOFF.md`.
