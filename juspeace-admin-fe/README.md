# Juspeace Admin Frontend

Next.js App Router admin console for Juspeace operations.

## Stack

- Next.js 16 (App Router, TypeScript, `output: 'standalone'`)
- Tailwind CSS v4 + shadcn/ui
- TanStack Query + Form + Table
- Typed API client → NestJS backend
- **ADMIN role required** for sign-in

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

Open http://localhost:3001.

| Script | Description |
| --- | --- |
| `pnpm run dev` | Development server (port 3001) |
| `pnpm run build` | Production build |
| `pnpm run start` | Serve production build |
| `pnpm run lint` | ESLint |

## Environment

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | NestJS API base URL | `http://localhost:7777/api/v1` |

Backend must allow admin origin in `CORS_ORIGINS` (e.g. `http://localhost:3001`).

## Docker (admin frontend only)

```bash
NEXT_PUBLIC_API_URL=http://localhost:7777/api/v1 pnpm run docker:up
```

For full stack (Postgres + API + storefront + admin), use the monorepo root:

```bash
cd .. && docker compose up --build
```

## Folder structure

```text
src/
├── app/                 # Routes and layouts
├── components/
│   ├── auth/            # Login, OAuth callback
│   ├── layout/          # Admin shell, sidebar, header
│   └── ui/              # shadcn primitives
├── lib/
│   ├── api/             # Typed API client
│   └── auth/            # Auth context (ADMIN-only)
└── messages/            # en.json + ko.json
```

Agent instructions: [AGENTS.md](AGENTS.md).

## Related

- Storefront: [../juspeace-fe/README.md](../juspeace-fe/README.md)
- Backend: [../juspeace-be/README.md](../juspeace-be/README.md)
- Monorepo: [../README.md](../README.md)
