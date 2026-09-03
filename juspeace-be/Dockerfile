# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl \
  && corepack enable && corepack prepare pnpm@10.22.0 --activate
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
# Hoisted layout so generated client at node_modules/.prisma/client is
# resolvable by @prisma/client (pnpm's default isolated linker is not).
RUN printf 'node-linker=hoisted\n' > .npmrc \
  && pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec prisma generate && pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=7777

RUN apk add --no-cache openssl \
  && corepack enable && corepack prepare pnpm@10.22.0 --activate \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY package.json pnpm-lock.yaml ./
# prisma CLI is a devDependency. Drop postinstall (`prisma generate`) so
# --prod install does not fail; native addons (bcrypt) still run.
RUN printf 'node-linker=hoisted\n' > .npmrc \
  && pnpm pkg delete scripts.postinstall \
  && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN chown -R nestjs:nodejs /app

USER nestjs
EXPOSE 7777

CMD ["node", "dist/main.js"]
