---
name: juspeace-backend
description: Juspeace NestJS backend conventions with Prisma, PostgreSQL, repository pattern, and SOLID module design. Use when building or reviewing API modules, DTOs, migrations, services, or Docker builds in juspeace-be/.
paths:
  - juspeace-be/**
---

# Juspeace Backend

## Before coding

Read `juspeace-be/AGENTS.md`. Use `src/products/` as the template for new domains. Apply SOLID: services depend on repository interfaces, not Prisma.

## Stack

- NestJS 11 (strict TypeScript)
- PostgreSQL + Prisma 6
- class-validator / class-transformer for DTOs
- Swagger at `/docs`
- Global API prefix: `/api/v1`

## Layering (SOLID)

```text
Controller  → HTTP, status codes, DTO binding
Service     → Business rules, orchestration
Repository  → Persistence via interface + Prisma implementation
DTO         → Input/output contracts with validation
```

### Dependency inversion

```typescript
export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');

@Module({
  providers: [
    ProductsService,
    { provide: PRODUCTS_REPOSITORY, useClass: PrismaProductsRepository },
  ],
})
export class ProductsModule {}
```

Services inject `IProductsRepository`, not `PrismaService` directly.

## NestJS architecture principles (condensed)

From NestJS agent-skill patterns (vendored for this repo):

### Module boundaries

- One domain module owns its controllers, services, and repository bindings.
- Export only what other modules need; keep Prisma behind the repository.
- Prefer a modular monolith: clear modules first, microservices later only with evidence.

### OOP / SOLID tips

- Prefer constructor injection over property injection.
- Keep services free of HTTP types (`Request` / `Response`).
- Prefer composition over inheritance for repositories and domain helpers.
- Avoid god services — split by use case when a service grows beyond one aggregate.

### Features / performance / security

- Validate all inputs with DTOs (`whitelist`, `forbidNonWhitelisted`).
- Use Nest exceptions; let the global filter shape problem-details JSON.
- Index foreign keys and filter columns in Prisma schema.
- Avoid N+1: batch repository reads; use `Promise.all` where independent.
- Never log secrets, tokens, or full PII payloads.
- Rate-limit and auth come later — design endpoints so they can be guarded without rewriting services.

## Module checklist

When adding a new domain (e.g. orders):

1. Prisma models + migration under `prisma/migrations/`
2. `*.repository.interface.ts` + `*.repository.ts`
3. DTOs with validation + Swagger
4. Service with business logic only
5. Controller under `/api/v1/<resource>`
6. Register module in `AppModule`
7. Update `docs/glossary.md`

## Configuration

- Env schema: `src/config/env.validation.ts`
- Runtime config: `src/config/configuration.ts`
- Copy `juspeace-be/.env.example` → `.env` for local dev

## Error responses

Use Nest exceptions. Global filter returns:

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "Product with slug \"x\" was not found",
  "instance": "/api/v1/products/x"
}
```

## Database commands

```bash
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run db:setup
```

## Docker

- `juspeace-be/Dockerfile` — multi-stage Nest build
- `juspeace-be/docker-compose.yml` — **postgres + API**
- Container CMD: `node dist/main.js` (migrations are run separately)
- In containers, `DATABASE_URL` host is `postgres`
- Scripts: `pnpm run docker:build|up|down`

## Verification

```bash
pnpm run build
pnpm test
pnpm run lint
```

## Do not

- Put SQL or Prisma calls in controllers
- Skip DTO validation on external input
- Hardcode ports or secrets
- Initialize git inside `juspeace-be/`

## Related skills

- `juspeace-integration` — frontend contract alignment
- `juspeace-clean-architecture` — SOLID / SoC reviews
- `backend-patterns` — general API design guidance
