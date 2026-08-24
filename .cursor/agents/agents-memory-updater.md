---
name: agents-memory-updater
description: Mine high-signal transcript deltas, update workspace-root AGENTS.md (never .cursor/AGENTS.md), and keep the incremental transcript index in sync.
model: inherit
---

# AGENTS.md memory updater (Lomtech)

Own the full memory update flow for continual learning in mono-repo workspaces that use a shared `.cursor` rules submodule.

## Target file resolution

1. Resolve **workspace root** — the parent mono repo directory that owns `.cursor/` (the rules submodule), not the submodule root itself.
2. **Primary target:** `<workspace-root>/AGENTS.md`
3. **Never write** to `.cursor/AGENTS.md` or any path inside the `.cursor` submodule. Project-specific memory must not pollute the central rules repo.
4. If `<workspace-root>/AGENTS.md` does not exist, create it with only:
   - `## Learned User Preferences`
   - `## Learned Workspace Facts`
5. Use [docs/AGENTS.template.md](../docs/AGENTS.template.md) as the seed structure when creating a new file.

## Index file (incremental processing)

Path: `<workspace-root>/.cursor/hooks/state/continual-learning-index.json`

Machine-local state only — never commit this file.

## Trigger

Use from `continual-learning` when transcript deltas may produce durable memory updates.

## Workflow

1. Read existing `<workspace-root>/AGENTS.md` first (not `.cursor/AGENTS.md`).
2. If `.cursor/AGENTS.md` exists and contains learned sections, migrate those bullets into workspace-root `AGENTS.md` (deduplicated), then delete `.cursor/AGENTS.md` or strip learned sections from it.
3. Load the incremental index if present.
4. Inspect only transcript files under `~/.cursor/projects/<workspace-slug>/agent-transcripts/` that are new or have newer mtimes than the index.
5. Pull out only durable, reusable items:
   - recurring user preferences or corrections
   - stable workspace facts for **this project**, not generic team rules (team rules belong in `rules/common/*.mdc`)
6. Update workspace-root `AGENTS.md` carefully:
   - update matching bullets in place
   - add only net-new bullets
   - deduplicate semantically similar bullets
   - keep each learned section to at most 12 bullets
7. Refresh the incremental index for processed transcripts and remove entries for files that no longer exist.
8. If the merge produces no `AGENTS.md` changes, leave `AGENTS.md` unchanged but still refresh the index.
9. If no meaningful updates exist, respond exactly: `No high-signal memory updates.`

## Guardrails

- Use plain bullet points only.
- Keep only these sections in workspace-root `AGENTS.md`:
  - `## Learned User Preferences`
  - `## Learned Workspace Facts`
- Do not write evidence/confidence tags.
- Do not write process instructions, rationale, or metadata blocks.
- Exclude secrets, private data, one-off instructions, and transient details.
- Do not add project facts to `.cursor/rules/` or commit changes inside the `.cursor` submodule.

## Output

- Updated `<workspace-root>/AGENTS.md` and `.cursor/hooks/state/continual-learning-index.json` when needed
- Otherwise exactly `No high-signal memory updates.`
