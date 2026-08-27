---
name: juspeace-integration
description: Juspeace frontend-backend integration guide covering REST API contracts, environment variables, CORS, health checks, and local development workflow. Use when connecting Next.js to NestJS or changing shared API types.
paths:
  - juspeace-fe/**
  - juspeace-admin-fe/**
  - juspeace-be/**
  - docker-compose.yml
  - docs/**
---

# Juspeace Integration

## Local development topology

| Service | URL | Port |
| --- | --- | --- |
| Storefront | http://localhost:3000 | 3000 |
| Admin console | http://localhost:3001 | 3001 |
| Backend API | http://localhost:7777/api/v1 | 7777 |
| Swagger | http://localhost:7777/docs | 7777 |
| PostgreSQL | localhost:5432 | 5432 |

Start database: `docker compose up -d postgres` from monorepo root (or `cd juspeace-be && docker compose up -d postgres`).

## Docker modes

| Command | What runs |
| --- | --- |
| Root `docker compose up` | postgres + juspeace-be + juspeace-fe + juspeace-admin-fe |
| `cd juspeace-be && docker compose up` | postgres + API |
| `cd juspeace-fe && docker compose up` | storefront only |
| `cd juspeace-admin-fe && docker compose up` | admin console only |

See `docs/architecture.md` for topology details.

## Environment variables

### Frontend (`juspeace-fe/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:7777/api/v1
```

### Admin frontend (`juspeace-admin-fe/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:7777/api/v1
```

### Backend (`juspeace-be/.env`)

```env
PORT=7777
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_DATABASE=juspeace_develop
DATABASE_URL=postgresql://postgres:root@127.0.0.1:5432/juspeace_develop?schema=public
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

Prefer discrete `DB_*` vars. Nest builds / syncs `DATABASE_URL` for Prisma. In Docker, use `DB_HOST=postgres`.

## API contract rules

1. **Versioned base path**: All endpoints live under `/api/v1`.
2. **JSON only**: Frontend and backend exchange JSON; no HTML from backend.
3. **Money**: Use integer `priceCents` + ISO currency code (`USD`).
4. **Pagination**: List endpoints return `{ data, total, limit, offset }`.
5. **Errors**: Problem Details JSON with `status`, `title`, `detail`.

## Frontend API client

- Base client: `juspeace-fe/src/lib/api/client.ts` (same pattern in `juspeace-admin-fe`)
- Domain modules: `juspeace-fe/src/lib/api/products.ts`
- Shared types: `juspeace-fe/src/lib/api/types.ts`

When backend DTOs change, update frontend types and API modules in the same change.

## Health check integration

- Backend: `GET /api/v1/health` (Terminus + Prisma ping)
- Frontend: `ApiStatusBanner` on home page verifies connectivity

## CORS

Backend reads `CORS_ORIGINS` (comma-separated). Keep frontend origin in sync when adding new dev hosts (e.g. LAN IP, preview URLs).

## Recommended workflow for new endpoints

1. Define DTO + Swagger in backend module
2. Implement service/repository
3. Verify in Swagger UI
4. Add typed client function in frontend `lib/api/`
5. Consume from Server Component or client hook
6. Add i18n keys for any new UI labels

## Do not

- Put API keys or tokens in `NEXT_PUBLIC_*` variables
- Call backend from browser with secrets in headers (use server-side fetch for protected routes later)
- Bypass the shared API client with ad-hoc `fetch` URLs in components

## Related skills

- `juspeace-frontend`
- `juspeace-backend`
- `api-design`
