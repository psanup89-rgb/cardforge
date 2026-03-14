# claude/ — Claude's Learnings for CardForge

This folder is maintained by Claude (Anthropic) and is part of a multi-agent workspace convention.

## Purpose

Each AI tool working on this project maintains its own named folder:
- `claude/` — Claude (this folder)
- `codex/` — OpenAI Codex (if used)
- `antigravity/` — Antigravity (if used)
- etc.

These folders are **committed to git** so they sync across all devices and are readable by any agent or developer. They serve as a shared, persistent context layer beyond what individual agent memory systems (which are local/private) can provide.

## What's in Here

| File | Contents |
|------|----------|
| `README.md` | This file — explains the folder's purpose |
| `project-context.md` | Key facts about CardForge: architecture, tech stack, conventions, known gotchas |

## How Other Agents Should Use This

Read `project-context.md` at the start of a session to quickly get up to speed on CardForge without re-exploring the whole codebase.

When Claude learns something new and significant (a gotcha, a design decision, an architecture constraint), it should update `project-context.md` so future agents benefit.

## Relationship to Other Memory Systems

- **This folder** — git-synced, multi-agent, durable, public within the repo
- **`~/.claude-account1/.../memory/`** — Claude-account-local, NOT git-synced, private to one machine
- **CLAUDE.md** — project-level instructions for Claude (if it exists)
