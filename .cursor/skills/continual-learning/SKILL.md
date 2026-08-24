---
name: continual-learning
description: Orchestrate continual learning by delegating transcript mining and workspace-root AGENTS.md updates to the Lomtech agents-memory-updater agent.
disable-model-invocation: true
---

# Continual Learning (Lomtech)

Keep **workspace-root** `AGENTS.md` current without polluting the shared `.cursor` rules submodule.

## Architecture

| Layer | Location | Purpose |
|-------|----------|---------|
| Shared team rules | `.cursor/rules/` (submodule) | Versioned standards for all projects |
| Project memory | `<workspace-root>/AGENTS.md` | Learned preferences and workspace facts |
| Hook state | `.cursor/hooks/state/continual-*` | Machine-local index (gitignored) |

## Trigger

Use when the user asks to mine prior chats, maintain `AGENTS.md`, or run the continual-learning loop.

## Workflow

1. Resolve workspace root (mono repo parent of `.cursor/`, not the submodule root).
2. Call the **Lomtech** `agents-memory-updater` agent from `.cursor/agents/agents-memory-updater.md`.
   - Do **not** use the Cursor plugin default updater that writes to `.cursor/AGENTS.md`.
3. Pass the index path: `<workspace-root>/.cursor/hooks/state/continual-learning-index.json`
4. Return the updater result.

## Guardrails

- Keep the parent skill orchestration-only.
- Do not mine transcripts or edit files in the parent flow.
- Do not bypass the subagent.
- Never commit changes inside the `.cursor` submodule for learned memory.
