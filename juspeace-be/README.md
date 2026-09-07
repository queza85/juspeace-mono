# Juspeace Backend

NestJS API for the Juspeace e-commerce shop.

## Stack

- NestJS 11 (strict TypeScript)
- PostgreSQL 16 + Prisma 6
- Swagger / OpenAPI at `/docs`
- Global API prefix: `/api/v1`

## Prerequisites

- Node.js 22+
- pnpm 10+ (`corepack enable`)
- PostgreSQL (local or via Docker)

## Local development

```bash
cp .env.example .env
pnpm install
```

Start Postgres (from this folder or monorepo root):

```bash
docker compose up -d postgres
# or from repo root: docker compose up -d postgres
```

Migrate, seed, and run:

```bash
pnpm run db:setup
pnpm run start:dev
```

| URL | Description |
| --- | --- |
| http://localhost:7777/api/v1 | API root metadata |
| http://localhost:7777/api/v1/health | Health check |
| http://localhost:7777/api/v1/products | Product list |
| http://localhost:7777/docs | Swagger UI |

| Script | Description |
| --- | --- |
| `pnpm run start:dev` | Watch mode |
| `pnpm run build` | Compile to `dist/` |
| `pnpm test` | Unit tests |
| `pnpm run lint` | ESLint |
| `pnpm run prisma:generate` | Generate Prisma client |
| `pnpm run prisma:migrate` | Create/apply migrations (dev) |
| `pnpm run prisma:seed` | Seed sample products |
| `pnpm run db:setup` | Migrate + seed |

## Environment

| Variable | Description | Default / example |
| --- | --- | --- |
| `PORT` | HTTP port | `7777` |
| `DB_HOST` | Postgres host | `127.0.0.1` |
| `DB_PORT` | Postgres port | `5432` |
| `DB_USER` | Postgres user | `postgres` |
| `DB_PASSWORD` | Postgres password | `root` (local only) |
| `DB_DATABASE` | Database name | `juspeace_develop` |
| `DATABASE_URL` | Optional Prisma URL override | built from `DB_*` when omitted |
| `CORS_ORIGINS` | Comma-separated browser origins | `http://localhost:3000` |
| `NODE_ENV` | `development` / `production` / `test` | `development` |

For Docker Compose networking, set `DB_HOST=postgres` (service name) instead of `127.0.0.1`.

## Docker (postgres + backend)

```bash
pnpm run docker:build
pnpm run docker:up
pnpm run docker:down
```

On container start the API runs migrations with `prisma migrate deploy`, seeds the default admin via `dist-seed/seed.js`, then `node dist/main.js`. Seed locally with `pnpm run prisma:seed` or `pnpm run db:setup`.

For full stack (including frontend), use the monorepo root:

```bash
cd .. && docker compose up --build
```

## Module layering

```text
Controller  → HTTP, DTO binding, status codes
Service     → Business rules
Repository  → Persistence (interface + Prisma implementation)
```

Example domain: `src/products/` (controller, service, repository interface, Prisma repository, DTOs).

Agent instructions: [AGENTS.md](AGENTS.md).

## Related

- Monorepo overview: [../README.md](../README.md)
- Frontend: [../juspeace-fe/README.md](../juspeace-fe/README.md)
- Architecture: [../docs/architecture.md](../docs/architecture.md)
- Glossary: [../docs/glossary.md](../docs/glossary.md)
