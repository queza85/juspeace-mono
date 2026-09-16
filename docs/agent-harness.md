# Agent harness (Cursor architecture)

How Juspeace wires instructions so **Cursor** actually loads them. Follow this layout; do not invent parallel instruction folders.

## What Cursor reads

| Layer | Path | How Cursor uses it |
| --- | --- | --- |
| **Rules** | `.cursor/rules/**/*.mdc` | Injected by scope: `alwaysApply: true` or `globs:` match |
| **Skills** | `.cursor/skills/*/SKILL.md` | Discovered at startup; **Agent Decides** when to load (or `/skill-name`) |
| **Project memory** | Root `AGENTS.md` | Session orientation for agents (also nested package `AGENTS.md`) |
| **Team commons** | `.cursor/rules/common/*.mdc` | Shared always-on standards (security, i18n, push policy) |
| **Deep docs** | `docs/*.md` | On demand via pointers — not auto-injected |

Official skill discovery: [Cursor Skills docs](https://cursor.com/docs/skills).

```text
juspeace-mono/
├── AGENTS.md                          ← project memory (NOT .cursor/AGENTS.md)
├── juspeace-fe/AGENTS.md              ← nested; wins when editing FE
├── juspeace-be/AGENTS.md              ← nested; wins when editing BE
├── docs/
│   ├── agent-harness.md               ← this file
│   ├── architecture.md
│   └── glossary.md
└── .cursor/
    ├── rules/
    │   ├── common/                    ← team always-on rules
    │   └── juspeace/                  ← Juspeace project rules
    │       ├── monorepo.mdc           ← alwaysApply
    │       ├── storefront.mdc         ← globs: juspeace-fe/**
    │       └── api.mdc                ← globs: juspeace-be/**
    └── skills/
        ├── juspeace-frontend/SKILL.md ← paths: juspeace-fe/**
        ├── juspeace-backend/SKILL.md  ← paths: juspeace-be/**
        ├── juspeace-integration/
        └── juspeace-clean-architecture/
```

## Precedence (when guidance conflicts)

1. Explicit user chat (highest)
2. Nested `AGENTS.md` closest to the edited file
3. Matching `.cursor/rules` (`globs` / always)
4. Root `AGENTS.md`
5. Skills loaded for the task (progressive)

## Rules vs skills vs AGENTS.md

| Kind | Put here when… | Cursor behavior |
| --- | --- | --- |
| **Rule (`.mdc`)** | Must/never for a file tree or whole repo | Auto-injected when scope matches |
| **Skill (`SKILL.md`)** | Multi-step workflow / domain playbook | Agent decides relevance from `description` (+ optional `paths`) |
| **AGENTS.md** | Stable project facts, verify commands, identity | Orientation; keep ~short; link to docs/skills |
| **README.md** | Humans (quick start, Docker) | Not agent instruction primary |

## Do not

- Put Juspeace project memory in `.cursor/AGENTS.md` (team continual-learning rule)
- Duplicate long architecture docs into rules — link to `docs/`
- Put skills outside `.cursor/skills/` (or package-local `.cursor/skills/`) if you expect Cursor to discover them
- Use legacy root `.cursorrules` for new guidance

## Juspeace project skills

| Skill | When Cursor should load it |
| --- | --- |
| `juspeace-frontend` | Storefront pages, components, cart, FE Docker in `juspeace-fe/` |
| `juspeace-backend` | Nest modules, Prisma, DTOs, BE Docker in `juspeace-be/` |
| `juspeace-integration` | FE/BE contract, CORS, env, health |
| `juspeace-clean-architecture` | SOLID / SoC reviews across packages |

View discovered skills in Cursor: **Customize → Skills** (Agent Decides).

## Extending

1. **Repeated mistake on every FE/BE edit** → add a short Do/Don't to the matching `.cursor/rules/juspeace/*.mdc`
2. **Multi-step workflow** → add/update a skill under `.cursor/skills/`
3. **Domain term** → `docs/glossary.md`
4. **Build/test command change** → root `AGENTS.md` verification section

Treat harness files as code: update them in the same change as the convention.
