# Amazon Q Memory Bank Rules

## Memory Bank Location
All memory bank files are in `.amazonq/rules/memory-bank/`.

## Core Files
- `projectbrief.md` — What we're building and why
- `productContext.md` — User problems, journeys, and UX goals
- `systemPatterns.md` — Architecture, design patterns, folder structure
- `techContext.md` — Tech stack, integrations, constraints
- `activeContext.md` — Current focus, next steps, open decisions
- `progress.md` — What's done, what's pending, decisions log

## Instructions
At the start of every conversation, read ALL memory bank files to restore full project context. After any significant work session, update `activeContext.md` and `progress.md` to reflect the current state.

When implementing features:
1. Check `systemPatterns.md` for the correct service/folder to work in
2. Check `techContext.md` for the right technology choices
3. Check `activeContext.md` for current priorities and open decisions
4. After completing work, update `progress.md` checkboxes and `activeContext.md`
