# Continual Learning

Mine high-signal patterns from recent agent transcripts and update **workspace-root** `AGENTS.md`.

## Overview

This command uses the Lomtech continual-learning flow. Shared team rules stay in `.cursor/rules/` (submodule). Project-specific memory goes to `<workspace-root>/AGENTS.md` — **not** `.cursor/AGENTS.md`.

## Steps

1. Resolve workspace root (mono repo directory that contains `.cursor/` as a submodule).
2. Ensure `<workspace-root>/AGENTS.md` exists (seed from [docs/AGENTS.template.md](../docs/AGENTS.template.md) if missing).
3. Run the `continual-learning` skill, delegating to `.cursor/agents/agents-memory-updater.md`.
4. Use incremental transcript processing with index file:
   - `<workspace-root>/.cursor/hooks/state/continual-learning-index.json`
   - Only consider transcripts not in the index or transcripts whose mtime is newer than the indexed mtime.
5. Have the subagent refresh index mtimes, remove entries for deleted transcripts, and update workspace-root `AGENTS.md` only for high-signal recurring user corrections and durable workspace facts.
6. Exclude one-off/transient details and secrets.
7. If no meaningful updates exist, respond exactly: `No high-signal memory updates.`

## After running

- Commit workspace-root `AGENTS.md` in the **project/mono repo** if the team tracks project memory (optional).
- Do **not** commit `.cursor/hooks/state/*` or any learned content inside the `.cursor` submodule.

## Related

- Agent: [agents/agents-memory-updater.md](../agents/agents-memory-updater.md)
- Template: [docs/AGENTS.template.md](../docs/AGENTS.template.md)
- Rule: [rules/common/continual-learning-workflow.mdc](../rules/common/continual-learning-workflow.mdc)
