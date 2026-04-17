# ObrasRD Agent Guide

This repository (`obrasrd`) is a standalone Codex project.

## Project Boundaries
- Treat this repo as one distinct Codex project.
- Keep Codex project metadata/config inside the root `.codex/` directory.
- Do not mix unrelated repositories inside this workspace context.
- If multiple repos are open in the editor, remove unrelated ones from the sidebar/workspace.
- Avoid opening this repo under an ambiguous parent folder that contains unrelated projects.

## Instruction Scope
- Keep `AGENTS.md` for stable rules that should remain true across sessions.
- Keep temporary task state, decisions, validation logs, and handoff notes in session docs under `.codex/sessions/`.
- Do not put daily status, one-off bug notes, or temporary branch goals in this file.

## Stack
- Vite + React + TypeScript + Tailwind + shadcn/ui
- Supabase for backend/auth

## Commands
- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Test: `npm run test`
- Build: `npm run build`

## Durable Rules
- Keep diffs scoped to the requested feature or bug.
- Do not rename routes or shared types unless required.
- Reuse existing UI patterns before creating new components.
- Preserve Dominican Spanish style in user-facing text.
- Treat mock data changes as schema-sensitive; avoid silent shape drift.
- Any schema change must include migration and rollback notes.
- Any analytics change must document events added, changed, or removed.
- Preferred validation before completion: `npm run lint` and `npm run build` (plus targeted tests when relevant).

## Product/UI Guardrails
- Mobile-first by default.
- Prioritize WhatsApp-first conversion flows.
- Preserve existing visual hierarchy and spacing scale unless the task asks for redesign.

## Session Document Baseline
Use `.codex/sessions/<date>-<topic>.md` with:
- Goal
- In scope / out of scope
- Decisions
- Files changed
- Validation results
- Known issues
- Next steps

## Expected Root Structure
```text
obrasrd/
  .codex/
  AGENTS.md
```
