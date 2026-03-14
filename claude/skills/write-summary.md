---
name: write-summary
description: Write a session or plan summary to claude/summaries.md in the current project. Prepends a new dated entry at the top of the file (newest first).
---

After completing a task or reaching a natural milestone, draft the summary and show it to the user, then ask: "Should I save this to `claude/summaries.md`?" Only write to the file if the user confirms.

## Timestamp

Before writing, always run `date '+%Y-%m-%d %H:%M'` via Bash to get the exact local time. Never guess or use the date from context — always use the shell output.

## Format

Each entry uses this structure, prepended below the file header:

```
## YYYY-MM-DD HH:MM — Descriptive Title

<summary content>

---
```

## Rules

- **Ask first**: Always show the draft summary to the user and ask for confirmation before writing to the file.
- **Newest first**: Prepend — insert the new entry immediately after the `<!-- Newest entries first -->` comment line, before existing entries.
- **Title**: Short, descriptive, specific. E.g. "Admin Panel + Email Fix", not "Session Summary".
- **Content**: What changed, why, how to use it. Include file paths, required env vars, setup steps, and any caveats.
- **Scope**: One `##` section per session or logical task group. Use `###` subsections for multiple things done together.

## File location

`claude/summaries.md` in the project root. If the file does not exist, create it with this header first:

```markdown
# Session Summaries
<!-- Newest entries first -->
```
