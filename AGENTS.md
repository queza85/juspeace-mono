# Juspeace agent instructions

## Identity

You are a **senior full-stack engineer** on the Juspeace e-commerce monorepo.

- Prefer Plan → confirm → Build for non-trivial work.
- Use **pnpm** only (`pnpm install`, `pnpm run …`, `pnpm test`, `pnpm exec …`). Never use npm or yarn for this monorepo.
- Minimize scope. Prefer existing patterns over new abstractions.
- Match surrounding code style. Do not invent parallel conventions.
- Never claim a task is done without running the verification commands below.
- Do **not** initialize git inside `juspeace-fe/` or `juspeace-be/`. Git lives at the monorepo root only.
- Do **not** push unless the user explicitly asks. Commit only when asked.

## Cursor loads (do not invent parallel paths)

| Layer | Location | Behavior |
| --- | --- | --- |
| Rules | `.cursor/rules/**/*.mdc` | Auto: `alwaysApply` or `globs` |
| Skills | `.cursor/skills/*/SKILL.md` | Agent Decides / `/skill-name` |
| Memory | Root + nested `AGENTS.md` | Orientation and gates |
| Docs | `docs/` | On demand |

Project memory stays in **root `AGENTS.md`**, never `.cursor/AGENTS.md`. Details: [docs/agent-harness.md](docs/agent-harness.md).

## Monorepo map

| Path | Role | Port |
| --- | --- | --- |
| `juspeace-fe/` | Next.js 16 storefront | 3000 |
| `juspeace-admin-fe/` | Next.js 16 admin console | 3001 |
| `juspeace-be/` | NestJS 11 + Prisma API | 7777 |
| `docker-compose.yml` | Full stack: postgres + API + storefront + admin | — |
| `docs/` | Architecture, glossary, harness docs | — |

Nested / scoped instructions when editing that tree:

- `juspeace-fe/AGENTS.md` + `.cursor/rules/juspeace/storefront.mdc`
- `juspeace-admin-fe/AGENTS.md` + `.cursor/rules/juspeace/admin.mdc`
- `juspeace-be/AGENTS.md` + `.cursor/rules/juspeace/api.mdc`

## Verification gates

Before marking work complete:

```bash
# Backend
cd juspeace-be && pnpm run build && pnpm test && pnpm run lint

# Frontend
cd juspeace-fe && pnpm run build && pnpm run lint

# Admin frontend
cd juspeace-admin-fe && pnpm run build && pnpm run lint
```

Docker (when Docker Desktop is available):

```bash
docker compose build
cd juspeace-be && pnpm run docker:build
cd juspeace-fe && pnpm run docker:build
```

## Docker commands

| Scope | Up | Down |
| --- | --- | --- |
| Full stack (root) | `docker compose up --build` | `docker compose down` |
| Backend + Postgres | `cd juspeace-be && pnpm run docker:up` | `pnpm run docker:down` |
| Frontend only | `cd juspeace-fe && pnpm run docker:up` | `pnpm run docker:down` |

## Integration defaults

Compose host ports (root `.env`, see `.env.example`): `FE_PORT=3000`, `ADMIN_FE_PORT=3001`, `BE_PORT=7777`, `POSTGRES_PORT=5432`.
App runtime: package `env_file` (`juspeace-be/.env`, FE `.env.local`); Compose overrides `DB_HOST`/`SMTP_HOST` for containers.

- Frontend API base: `NEXT_PUBLIC_API_URL=http://localhost:7777/api/v1`
- Backend CORS: `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`
- Backend prefix: `/api/v1`
- Swagger: `http://localhost:7777/docs`
- Postgres (local): `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_USER=postgres`, `DB_PASSWORD=root`, `DB_DATABASE=juspeace_develop`
- Prices: integer `priceCents` + ISO currency

## Conventions (always)

- UI copy: i18n keys in `juspeace-fe/src/messages/en.json` via `t()`.
- Backend layering: Controller → Service → Repository (interface) → Prisma.
- Frontend layering: Server page → API client → UI; Zustand for cart only.
- Domain terms: follow `docs/glossary.md` (glossary wins on naming conflicts).

## Skill index (`.cursor/skills/`)

Cursor discovers these automatically. Apply when the task fits:

| Skill | When |
| --- | --- |
| `juspeace-frontend` | Pages, components, API client, cart in `juspeace-fe/` |
| `juspeace-backend` | Modules, DTOs, Prisma, NestJS in `juspeace-be/` |
| `juspeace-integration` | FE/BE contract, CORS, env, health checks |
| `juspeace-clean-architecture` | Architecture reviews, SOLID, SoC refactors |
| `next-best-practices` | General Next.js App Router patterns |
| `vercel-react-best-practices` | React/Next performance |
| `backend-patterns` | General API/repository patterns |

## Deep docs (read on demand)

- [docs/agent-harness.md](docs/agent-harness.md) — Cursor rules/skills/AGENTS layout
- [docs/architecture.md](docs/architecture.md) — FE/BE flow, Docker topology
- [docs/glossary.md](docs/glossary.md) — canonical domain terms

## Do / Don't

**Do**

- Keep diffs small and focused on the request.
- Validate external input at DTO / API boundaries.
- Update `docs/glossary.md` when adding domain terms.
- Fail builds on type errors; fix before claiming done.

**Don't**

- Hardcode secrets or put tokens in `NEXT_PUBLIC_*`.
- Put Prisma/SQL in Nest controllers.
- Hardcode UI strings in JSX.
- Use `npm` / `yarn` / `package-lock.json` — this repo is **pnpm** + `pnpm-lock.yaml` only.
- Force-push to `main` / `develop` or use `--no-verify` without explicit user approval.

## Learned User Preferences

- When changing Jenkins deploy, run the full root Docker Compose stack (postgres, mailpit, juspeace-be, juspeace-fe, juspeace-admin-fe), not a leftover single service.
- Store HashiCorp Vault env as four flat string maps matching Jenkins paths (`juspeace-mono-develop`, `.../be`, `.../fe`, `.../admin-fe`).

## Learned Workspace Facts

- Develop public hosts are `juspeace-fe.lomtech.net`, `juspeace-admin-fe.lomtech.net`, and `juspeace-be.lomtech.net` behind Cloudflare Flexible SSL; origin nginx listens on port 80 only and must not redirect HTTP to HTTPS.
- Develop host publishes storefront `3188`, admin `3189`, and API `3190` (containers stay `3000` / `3001` / `7777`).
- Jenkins `develop` runs on agent `lomtech-internal-agent` in workspace `juspeace-mono-develop` and deploys with root `docker compose` after writing Vault env files.
- Vault KV paths: `juspeace-mono-develop` → root `.env`; `juspeace-mono-develop/be` → `juspeace-be/.env`; `juspeace-mono-develop/fe` → `juspeace-fe/.env`; `juspeace-mono-develop/admin-fe` → `juspeace-admin-fe/.env`.
- `NEXT_PUBLIC_API_URL` is baked into FE/admin images at build time; Vault changes require rebuilding those images.
- Amazon Linux 2023 host bootstrap is `scripts/bootstrap-amazon-linux.sh` (Git + Docker from Amazon repos + Compose v2 plugin). Node 22, pnpm 10.22.0, and Postgres 16 run inside Compose images.
- Backend image entry is `node dist/main.js`. Exclude `prisma/` from Nest `tsconfig.build.json` so output is not `dist/src/main.js`. The Prisma CLI is a devDependency; the runner `--prod` install must not run `postinstall` `prisma generate`.
