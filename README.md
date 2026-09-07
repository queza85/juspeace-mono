# Juspeace Monorepo

E-commerce platform for the Juspeace shop — Next.js storefront and NestJS API in one workspace.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, Tailwind CSS v4, shadcn/ui, Zustand |
| Backend | NestJS 11, PostgreSQL, Prisma 6 |
| Integration | REST API (`/api/v1`), OpenAPI at `/docs` |

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker Desktop (for Postgres and containerized runs)

## Project layout

```text
juspeace-mono/
├── juspeace-fe/       # Next.js storefront (port 3000)
├── juspeace-admin-fe/ # Next.js admin console (port 3001)
├── juspeace-be/       # NestJS API (port 7777)
├── docker-compose.yml # Full stack: postgres + API + storefront + admin
├── docs/              # Architecture, glossary, agent harness
└── AGENTS.md          # AI agent identity and harness index
```

Git is managed at the **monorepo root only**. Do not initialize git inside `juspeace-fe/`, `juspeace-admin-fe/`, or `juspeace-be/`.

## Ports

Defaults below. Override published host ports in a root `.env` (copy from [`.env.example`](.env.example)). Container listen ports stay the same.

| Service | Default URL / Port | Compose env |
| --- | --- | --- |
| Storefront | http://localhost:3000 | `FE_PORT` |
| Admin console | http://localhost:3001 | `ADMIN_FE_PORT` |
| Backend API | http://localhost:7777/api/v1 | `BE_PORT` |
| Swagger | http://localhost:7777/docs | `BE_PORT` |
| PostgreSQL | localhost:5432 | `POSTGRES_PORT` (backend compose) |
| Mailpit SMTP / UI | localhost:1025 / 8025 | `MAILPIT_SMTP_PORT` / `MAILPIT_UI_PORT` |

## Quick start — full stack (Docker)

From the monorepo root (copy package env files so Compose `env_file` can load app config):

```bash
cp .env.example .env
cp juspeace-be/.env.example juspeace-be/.env
cp juspeace-fe/.env.example juspeace-fe/.env.local
cp juspeace-admin-fe/.env.example juspeace-admin-fe/.env.local
docker compose up --build -d
```

This starts Postgres, Mailpit, the NestJS API, the Next.js storefront, and the admin console. **Database migrations run automatically** when the backend container starts (no separate migrate step).

## Quick start — local development

### 1. Database only

```bash
docker compose up -d postgres
```

Or from the backend package:

```bash
cd juspeace-be && docker compose up -d postgres
```

### 2. Backend

See [juspeace-be/README.md](juspeace-be/README.md).

```bash
cd juspeace-be
cp .env.example .env
pnpm install
pnpm run db:setup
pnpm run start:dev
```

### 3. Frontend

See [juspeace-fe/README.md](juspeace-fe/README.md).

```bash
cd juspeace-fe
cp .env.example .env.local
pnpm install
pnpm run dev
```

## Docker run modes

| Command | What runs |
| --- | --- |
| `docker compose up` (root) | postgres + mailpit + juspeace-be + juspeace-fe + juspeace-admin-fe |
| `cd juspeace-be && docker compose up` | postgres + API |
| `cd juspeace-fe && docker compose up` | storefront only (API URL via env) |
| `cd juspeace-admin-fe && docker compose up` | admin console only (API URL via env) |

## Environment variables

Two layers:

| Layer | File(s) | Role |
| --- | --- | --- |
| Compose interpolation | root [`.env`](.env.example) | Published host ports (`FE_PORT`, `ADMIN_FE_PORT`, `BE_PORT`, …) and optional FE build-arg overrides |
| App runtime | package env via Compose `env_file` | `juspeace-be/.env`, `juspeace-fe/.env` / `.env.local`, `juspeace-admin-fe/.env` / `.env.local` |

Copy each package’s `.env.example` before `docker compose up` (files are gitignored; `env_file` is `required: false`). Compose `environment:` always overrides package values for Docker networking (`DB_HOST=postgres`, `SMTP_HOST=mailpit`, listen `PORT` / `HOSTNAME`).

Leave root `NEXT_PUBLIC_API_URL` unset locally so FE build-args follow `BE_PORT`. Set it explicitly in production. App secrets (JWT, CORS, mail) live in package env files — not the slim root `.env`.

| Variable | Where | Default / example |
| --- | --- | --- |
| `FE_PORT` / `ADMIN_FE_PORT` / `BE_PORT` | root `.env` | `3000` / `3001` / `7777` |
| `POSTGRES_PORT` | root / juspeace-be `.env` | `5432` |
| `MAILPIT_SMTP_PORT` / `MAILPIT_UI_PORT` | root `.env` | `1025` / `8025` |
| `NEXT_PUBLIC_API_URL` | juspeace-fe / juspeace-admin-fe `.env.local` | `http://localhost:7777/api/v1` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_DATABASE` | juspeace-be `.env` (host); Compose overrides host to `postgres` | `127.0.0.1` / `5432` / `postgres` / `root` / `juspeace_develop` |
| `DATABASE_URL` | juspeace-be `.env`; Compose overrides host to `postgres` | optional; built from `DB_*` when omitted |
| `CORS_ORIGINS` | juspeace-be `.env` | `http://localhost:3000,http://localhost:3001` |
| `JWT_*` / `AUTH_COOKIE_*` / `MAIL_*` / SMTP | juspeace-be `.env` | see `juspeace-be/.env.example` |
| `PORT` | juspeace-be `.env` (Compose forces `7777` in containers) | `7777` |

## Architecture principles

- **SOLID**: Repository interfaces in the backend decouple business logic from Prisma.
- **Separation of concerns**: Controllers handle HTTP; services hold business rules; repositories handle persistence.
- **Frontend boundaries**: Server Components fetch catalog data; client components handle cart via Zustand.
- **i18n**: All UI strings live in `juspeace-fe/src/messages/en.json`.

More detail: [docs/architecture.md](docs/architecture.md) and [docs/glossary.md](docs/glossary.md).

## AI agent harness

Cursor reads project instructions from `.cursor/` plus root/`nested` `AGENTS.md`:

| Layer | Path |
| --- | --- |
| Rules (auto) | `.cursor/rules/juspeace/*.mdc` + `.cursor/rules/common/*.mdc` |
| Skills (Agent Decides) | `.cursor/skills/juspeace-*/SKILL.md` |
| Project memory | `AGENTS.md`, `juspeace-fe/AGENTS.md`, `juspeace-be/AGENTS.md` |

How the layers work: [docs/agent-harness.md](docs/agent-harness.md).

Project skills:

- `juspeace-frontend` — Next.js storefront conventions
- `juspeace-backend` — NestJS + Prisma module patterns
- `juspeace-integration` — FE/BE API contract and env setup
- `juspeace-clean-architecture` — SOLID and separation of concerns
