# Juspeace architecture

## Overview

```text
Browser → Next.js storefront (juspeace-fe:3000) ──┐
Browser → Next.js admin (juspeace-admin-fe:3001) ─┼→ NestJS API (juspeace-be:7777/api/v1) → PostgreSQL (5432)
```

- Frontend: App Router Server Components fetch catalog; Zustand holds cart on the client.
- Backend: Modular NestJS with Controller → Service → Repository → Prisma.
- Contract: JSON REST under `/api/v1`; envelope `{ success, message, data }` (message codes in `SCREAMING_SNAKE_CASE`).

## Ports and URLs

Defaults. Published host ports come from root `.env` (`FE_PORT`, `ADMIN_FE_PORT`, `BE_PORT`, `POSTGRES_PORT`, `MAILPIT_SMTP_PORT`, `MAILPIT_UI_PORT`). App runtime env comes from each package’s `.env` / `.env.local` via Compose `env_file`. See [`.env.example`](../.env.example).

| Service | Default local URL |
| --- | --- |
| Storefront | http://localhost:3000 |
| Admin console | http://localhost:3001 |
| API | http://localhost:7777/api/v1 |
| Swagger | http://localhost:7777/docs |
| Health | http://localhost:7777/api/v1/health |
| Postgres | localhost:5432 |

## Backend SOLID layering

```text
HTTP (Controller + DTO validation)
  → Application (Service)
    → Infrastructure (IRepository → Prisma)
      → PostgreSQL
```

Domain modules live under `juspeace-be/src/<domain>/`. Example: `products` with interface token `PRODUCTS_REPOSITORY`.

## Frontend boundaries

```text
Route (Server Component)
  → lib/api (typed client)
    → components (presentation)
      → stores (Zustand cart)  // client only
```

All UI strings: `juspeace-fe/src/messages/en.json` via `t()`.

## API contract highlights

- Money: `priceCents` (integer) + `currency` (ISO).
- Lists: `{ success, message, data: { items, total, limit, offset } }`.
- Success: `{ success: true, message: "RETRIEVE_SUCCESSFULLY", data: ... }`.
- Errors: `{ success: false, message: "INVALID_CREDENTIALS", data: null | { errors } }`.

Shared frontend types: `juspeace-fe/src/lib/api/types.ts`.

## Docker topology

Three compose modes:

```text
Root docker-compose.yml
  ├── postgres
  ├── juspeace-be  (build ./juspeace-be)
  ├── juspeace-fe  (build ./juspeace-fe)
  └── juspeace-admin-fe  (build ./juspeace-admin-fe)

juspeace-be/docker-compose.yml
  ├── postgres
  └── juspeace-be

juspeace-fe/docker-compose.yml
  └── juspeace-fe   # expects API via NEXT_PUBLIC_API_URL

juspeace-admin-fe/docker-compose.yml
  └── juspeace-admin-fe   # port 3001; expects API via NEXT_PUBLIC_API_URL
```

In containers, Compose `environment:` forces `DB_HOST` / `DATABASE_URL` host `postgres` and `SMTP_HOST=mailpit` (overrides package `.env` host-local values). Browsers still call the API via `NEXT_PUBLIC_API_URL` (default `http://localhost:7777/api/v1`, driven by root `BE_PORT` at build time).

Backend container CMD: `node dist/main.js`. Run Prisma migrations separately when needed.

## Env alignment

| Layer | Source | Purpose |
| --- | --- | --- |
| Root `.env` | [`.env.example`](../.env.example) | Compose interpolation: published host ports, optional `NEXT_PUBLIC_API_URL` build-arg |
| Package `env_file` | `juspeace-be/.env`, FE `.env` / `.env.local` | App runtime (JWT, CORS, mail, API URL, DB credentials for host dev) |
| Compose `environment:` | `docker-compose.yml` | Docker-only overrides (`postgres` / `mailpit` hosts, container listen ports) |

| Concern | juspeace-fe / juspeace-admin-fe | juspeace-be |
| --- | --- | --- |
| API base | `NEXT_PUBLIC_API_URL` (package env + FE build-arg) | — |
| DB | — | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` (+ optional `DATABASE_URL`) |
| CORS | — | `CORS_ORIGINS` (comma-separated storefront + admin origins) |

Local Postgres defaults: `postgres` / `root` / `juspeace_develop` on `127.0.0.1:5432`.

## Related docs

- [glossary.md](glossary.md)
- [agent-harness.md](agent-harness.md)
- Root [AGENTS.md](../AGENTS.md)
