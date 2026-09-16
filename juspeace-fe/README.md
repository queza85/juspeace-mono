# Juspeace Frontend

Next.js App Router storefront for the Juspeace e-commerce shop.

## Stack

- Next.js 16 (App Router, TypeScript, `output: 'standalone'`)
- Tailwind CSS v4 + shadcn/ui
- Zustand (client cart state)
- Typed API client → NestJS backend

## Prerequisites

- Node.js 22+
- pnpm 10+ (`corepack enable`)
- Backend API running at `http://localhost:7777` (or set `NEXT_PUBLIC_API_URL`)

## Local development

```bash
cp .env.example .env.local
pnpm install
pnpm run dev
```

Open http://localhost:3000.

| Script | Description |
| --- | --- |
| `pnpm run dev` | Development server |
| `pnpm run build` | Production build |
| `pnpm run start` | Serve production build |
| `pnpm run lint` | ESLint |

## Environment

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | NestJS API base URL | `http://localhost:7777/api/v1` |

## Docker (frontend only)

This compose file runs **only** the frontend service. Point it at a reachable API:

```bash
# API on host machine
NEXT_PUBLIC_API_URL=http://localhost:7777/api/v1 pnpm run docker:up

# Or use pnpm scripts
pnpm run docker:build
pnpm run docker:up
pnpm run docker:down
```

For full stack (Postgres + API + frontend), use the monorepo root:

```bash
cd .. && docker compose up --build
```

## Folder structure

```text
src/
├── app/                 # Routes and layouts
├── components/
│   ├── layout/          # Header, footer
│   ├── products/        # Catalog UI
│   └── ui/              # shadcn primitives
├── lib/
│   ├── api/             # Typed API client + types
│   └── i18n.ts          # Translation helper
├── messages/en.json     # UI copy (required for all user-facing text)
└── stores/              # Zustand stores (cart)
```

## Conventions

- Fetch catalog data in **Server Components** via `@/lib/api/*`.
- Use `'use client'` only for interactive UI (cart, local state).
- All user-facing strings go through `t()` and `src/messages/en.json`.
- Never hardcode API URLs in components — use the API client.

Agent instructions: [AGENTS.md](AGENTS.md).

## Related

- Monorepo overview: [../README.md](../README.md)
- Backend: [../juspeace-be/README.md](../juspeace-be/README.md)
- Architecture: [../docs/architecture.md](../docs/architecture.md)
