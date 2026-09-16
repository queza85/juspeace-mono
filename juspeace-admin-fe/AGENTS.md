<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Juspeace admin frontend agent rules

## Before writing Next.js code

1. Prefer retrieval over training data: read version-matched docs under `node_modules/next/dist/docs/`.
2. Apply project skill `juspeace-frontend` (shared patterns) and `next-best-practices` when relevant.

## Stack truth

- Next.js 16 App Router, TypeScript strict, `output: 'standalone'`
- Tailwind CSS v4 + shadcn/ui (`src/components/ui`)
- **TanStack Query** for client server-state (auth session, mutations, lists)
- **TanStack Form** + **Zod** for forms
- **TanStack Table** (`src/lib/table`) for admin tables
- API via `src/lib/api/*` — never hardcode base URLs in components
- **ADMIN role required** for all authenticated sessions

## Do

- Use TanStack Query for authenticated / interactive client data and mutations.
- Use TanStack Form + Zod schemas under `src/lib/**/**-schema.ts` for forms.
- Use `'use client'` only for interactivity (forms, auth UI, tables).
- Put all user-facing strings in `src/messages/en.json` **and** `src/messages/ko.json`.
- Locales: English (`en`) and Korean (`ko`); cookie `juspeace_locale`.
- Keep pages thin; put reusable UI in `src/components/**`.

## Don't

- Store JWTs or secrets in browser storage (except non-secret session hint in sessionStorage).
- Allow storefront `USER` role sessions in the admin app.
- Invent API routes that bypass the NestJS backend.
- Initialize git in this folder.

## Verification

```bash
pnpm run build
pnpm run lint
```

Docker (admin frontend service only):

```bash
pnpm run docker:build
```

## Related

- Root: [../AGENTS.md](../AGENTS.md)
- Cursor rule (auto on admin FE files): `.cursor/rules/juspeace/admin.mdc`
- Storefront reference: [../juspeace-fe/AGENTS.md](../juspeace-fe/AGENTS.md)
- Human docs: [README.md](README.md)
