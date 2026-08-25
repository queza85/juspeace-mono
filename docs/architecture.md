# Juspeace architecture

## Overview

```text
Browser → Next.js (juspeace-fe:3000) → NestJS API (juspeace-be:7777/api/v1) → PostgreSQL (5432)
```

- Frontend: App Router Server Components fetch catalog; Zustand holds cart on the client.
- Backend: Modular NestJS with Controller → Service → Repository → Prisma.
- Contract: JSON REST under `/api/v1`; envelope `{ success, message, data }` (message codes in `SCREAMING_SNAKE_CASE`).

## Ports and URLs

| Service | Local URL |
| --- | --- |
| Storefront | http://localhost:3000 |
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
  └── juspeace-fe  (build ./juspeace-fe)

juspeace-be/docker-compose.yml
  ├── postgres
  └── juspeace-be

juspeace-fe/docker-compose.yml
  └── juspeace-fe   # expects API via NEXT_PUBLIC_API_URL
```

In containers, the API uses `DATABASE_URL` host `postgres`. Browsers still call the API at `http://localhost:7777/api/v1` unless you change the build arg.

Backend container CMD: `node dist/main.js`. Run Prisma migrations separately when needed.

## Env alignment

| Concern | juspeace-fe | juspeace-be |
| --- | --- | --- |
| API base | `NEXT_PUBLIC_API_URL` | — |
| DB | — | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` (+ optional `DATABASE_URL`) |
| CORS | — | `CORS_ORIGINS` (include frontend origin) |

Local Postgres defaults: `postgres` / `root` / `juspeace_develop` on `127.0.0.1:5432`.

## Related docs

- [glossary.md](glossary.md)
- [agent-harness.md](agent-harness.md)
- Root [AGENTS.md](../AGENTS.md)
