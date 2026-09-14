<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Juspeace frontend agent rules

## Before writing Next.js code

1. Prefer retrieval over training data: read version-matched docs under `node_modules/next/dist/docs/`.
2. Apply project skill `juspeace-frontend` and, when relevant, `next-best-practices` / `vercel-react-best-practices`.

## Stack truth

- Next.js 16 App Router, TypeScript strict, `output: 'standalone'`
- Tailwind CSS v4 + shadcn/ui (`src/components/ui`)
- **TanStack Query** (`@tanstack/react-query`) for client server-state (auth session, mutations, future interactive lists)
- **TanStack Form** (`@tanstack/react-form`) + **Zod** for forms (login and future forms)
- **TanStack Table** (`@tanstack/react-table` via `src/lib/table`) when building sortable/filterable tables
- Zustand for **cart only** (`src/stores/cart-store.ts`)
- API via `src/lib/api/*` — never hardcode base URLs in components

## Do

- Fetch public catalog data in Server Components (keep SSR for SEO).
- Use TanStack Query for authenticated / interactive client data and mutations.
- Use TanStack Form + Zod schemas under `src/lib/**/**-schema.ts` for forms.
- Use `'use client'` only for interactivity (cart, forms, auth UI).
- Put all user-facing strings in `src/messages/en.json` **and** `src/messages/ko.json`, render with `t()` / `useT()` / `getTranslator()`.
- Locales: English (`en`) and Korean (`ko`); cookie `juspeace_locale`; switcher in the header.
- Keep pages thin; put reusable UI in `src/components/**`.
- Pass async `params` / `searchParams` correctly (Promise-based in Next 15+).

## Don't

- Fetch product catalog in client components unless interactivity requires it.
- Store JWTs or secrets in Zustand / localStorage.
- Invent API routes that bypass the NestJS backend.
- Initialize git in this folder.

## Verification

```bash
pnpm run build
pnpm run lint
```

Docker (frontend service only):

```bash
pnpm run docker:build
```

## Related

- Root: [../AGENTS.md](../AGENTS.md)
- Cursor rule (auto on FE files): `.cursor/rules/juspeace/storefront.mdc`
- Skills under `.cursor/skills/`: `juspeace-frontend`, `juspeace-integration`
- Human docs: [README.md](README.md)
