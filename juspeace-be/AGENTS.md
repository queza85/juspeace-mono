# Juspeace backend agent rules

You are working in the NestJS API package. Follow SOLID layering and keep modules focused.

## Before writing NestJS code

1. Apply project skill `juspeace-backend` and, when relevant, `juspeace-clean-architecture` / `backend-patterns`.
2. Prefer existing module patterns under `src/products/` as the template for new domains.

## Stack truth

- NestJS 11, Prisma 6, PostgreSQL
- Global prefix: `/api/v1`
- Swagger: `/docs`
- Config: `src/config/` with env validation
- Health: `GET /api/v1/health`

## Layering (required)

```text
Controller → Service → Repository interface → Prisma implementation
```

- Controllers: HTTP, DTO binding, Swagger decorators only.
- Services: business rules; inject repository **interfaces** (DI tokens), not Prisma directly.
- Repositories: all Prisma / SQL access.
- DTOs: `class-validator` + `class-transformer`; whitelist unknown fields.

## Do

- Use resource-based URLs (`/products`, `/products/:slug`).
- Return RFC 7807-style errors via Nest exceptions + global filter.
- Store money as integer `priceCents` + ISO currency.
- Add Prisma migrations for schema changes; seed via `prisma/seed.ts`.
- Update `docs/glossary.md` when adding domain terms.

## Don't

- Call Prisma from controllers or put SQL in services.
- Skip DTO validation on external input.
- Hardcode ports, secrets, or database URLs in source.
- Initialize git in this folder.

## Docker

- Compose in this package runs **postgres + API**.
- Container entrypoint: `prisma migrate deploy` then `node dist/main.js`.
- Local DB: `DB_HOST=127.0.0.1`, user `postgres`, password `root`, database `juspeace_develop`.
- In containers, set `DB_HOST=postgres` (Compose service name).

## Verification

```bash
pnpm run build
pnpm test
pnpm run lint
```

Docker:

```bash
pnpm run docker:build
```

## Related

- Root: [../AGENTS.md](../AGENTS.md)
- Cursor rule (auto on BE files): `.cursor/rules/juspeace/api.mdc`
- Skills under `.cursor/skills/`: `juspeace-backend`, `juspeace-clean-architecture`, `juspeace-integration`
- Human docs: [README.md](README.md)
