---
name: juspeace-clean-architecture
description: SOLID principles, separation of concerns, and clean code standards for the Juspeace monorepo. Use when designing modules, refactoring, or reviewing architecture in juspeace-fe/ or juspeace-be/.
paths:
  - juspeace-fe/**
  - juspeace-be/**
---

# Juspeace Clean Architecture

## SOLID in this codebase

| Principle | Backend | Frontend |
| --- | --- | --- |
| **S** Single Responsibility | Controller = HTTP; Service = rules; Repository = DB | Page = composition; component = UI; store = client state |
| **O** Open/Closed | Extend via new repository implementations, not by editing services | Extend via new components, not by bloating pages |
| **L** Liskov Substitution | Any `IProductsRepository` impl must honor the interface contract | N/A (use consistent component props contracts) |
| **I** Interface Segregation | Small repository interfaces per aggregate | Narrow Zustand selectors and focused API modules |
| **D** Dependency Inversion | Services depend on repository interfaces, not Prisma | Pages depend on API abstractions, not raw fetch URLs |

## Separation of concerns

### Backend layers

```text
HTTP (Controller)
  ↓ DTO validation
Application (Service)
  ↓ domain rules
Infrastructure (Repository → Prisma)
  ↓ SQL
Database (PostgreSQL)
```

Never skip layers (e.g. Prisma calls inside controllers).

### Frontend layers

```text
Route (Server Component)
  ↓ data fetching
API module (lib/api)
  ↓ typed JSON
Presentation (components)
  ↓ events
Client state (Zustand) — cart/UI only
```

Server Components own catalog data. Client components own interactivity.

## Clean code rules

1. **English** for code, comments, and identifiers.
2. **No dead code** — delete unused exports and commented blocks.
3. **Explicit types** at module boundaries (DTOs, API types).
4. **Small functions** — extract when a function does two distinct jobs.
5. **Meaningful names** aligned with `docs/glossary.md`.
6. **Fail fast** — validate input at boundaries; return typed errors.
7. **No secrets in source** — use environment variables.

## Review checklist

- [ ] Does each class/file have one reason to change?
- [ ] Are external inputs validated (DTO / API params)?
- [ ] Are UI strings in i18n files?
- [ ] Are new domain terms added to `docs/glossary.md`?
- [ ] Can this be tested without HTTP or React DOM (service/repository unit tests)?

## Related skills

- `juspeace-backend`
- `juspeace-frontend`
- `juspeace-integration`
- `coding-standards`
