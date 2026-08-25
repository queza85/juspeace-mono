---
name: juspeace-frontend
description: Juspeace Next.js storefront conventions using App Router, shadcn/ui, Zustand, and i18n. Use when building or reviewing pages, components, API clients, cart state, or Docker builds in juspeace-fe/.
paths:
  - juspeace-fe/**
---

# Juspeace Frontend

## Before coding

Prefer **retrieval over training data**. Read version-matched Next.js docs at:

`juspeace-fe/node_modules/next/dist/docs/`

Do this before using App Router APIs, caching, or metadata. Official evals show agents perform better when pointed at bundled docs than when relying on pretraining.

Also read `juspeace-fe/AGENTS.md` (preserve the Next.js managed block).

## Stack

- Next.js 16 App Router, TypeScript strict, `output: 'standalone'`
- Tailwind CSS v4 + shadcn/ui
- Zustand for client-only cart state
- Server Components for catalog fetching and SEO

## Architecture rules

1. **Server-first data**: Fetch products in Server Components via `@/lib/api/*`.
2. **Client boundaries**: `'use client'` only for cart / local UI state.
3. **API access**: Use `@/lib/api/client.ts` and domain modules. Never hardcode API URLs in components.
4. **i18n required**: Strings in `src/messages/en.json` via `t('key.path')`.
5. **UI composition**: Thin pages; reusable UI in `src/components/**`.

## Folder layout

```text
juspeace-fe/src/
├── app/                 # Routes and layouts
├── components/
│   ├── layout/
│   ├── products/
│   └── ui/
├── lib/api/             # Typed API client + types
├── messages/en.json
└── stores/              # Zustand (cart)
```

## Patterns

### Server page fetching

```tsx
import { listProducts } from '@/lib/api/products';

export default async function Page() {
  const { data } = await listProducts();
  return <ProductGrid products={data} />;
}
```

### Zustand cart

- `src/stores/cart-store.ts`
- Narrow selectors: `useCartStore((s) => s.addItem)`
- Persist via Zustand `persist` middleware

## Docker

- `juspeace-fe/Dockerfile` — multi-stage standalone Next.js image
- `juspeace-fe/docker-compose.yml` — **frontend service only**
- Build arg / env: `NEXT_PUBLIC_API_URL`
- Scripts: `pnpm run docker:build|up|down`

## Verification

```bash
pnpm run build
pnpm run lint
```

## Do not

- Put business logic in components when it belongs in API modules
- Hardcode UI strings in JSX
- Store JWTs or secrets in Zustand/localStorage
- Initialize git inside `juspeace-fe/`

## Related skills

- `juspeace-integration` — API contracts and env
- `next-best-practices` — App Router conventions
- `vercel-react-best-practices` — React/Next performance
- `next-cache-components` — Cache Components / PPR workflows
