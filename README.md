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

| Service | URL / Port |
| --- | --- |
| Storefront | http://localhost:3000 |
| Admin console | http://localhost:3001 |
| Backend API | http://localhost:7777/api/v1 |
| Swagger | http://localhost:7777/docs |
| PostgreSQL | localhost:5432 |

## Quick start — full stack (Docker)

From the monorepo root:

```bash
docker compose up --build
```

This starts Postgres, the NestJS API, the Next.js storefront, and the admin console.

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
| `docker compose up` (root) | postgres + juspeace-be + juspeace-fe |
| `cd juspeace-be && docker compose up` | postgres + API |
| `cd juspeace-fe && docker compose up` | storefront only (API URL via env) |

## Environment variables

| Variable | Where | Default / example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | juspeace-fe | `http://localhost:7777/api/v1` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_DATABASE` | juspeace-be | `127.0.0.1` / `5432` / `postgres` / `root` / `juspeace_develop` |
| `DATABASE_URL` | juspeace-be | optional; built from `DB_*` when omitted |
| `CORS_ORIGINS` | juspeace-be | `http://localhost:3000` |
| `PORT` | juspeace-be | `7777` |

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
