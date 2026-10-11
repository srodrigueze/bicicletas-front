# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# --- deps: install with the exact pnpm version pinned in package.json ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder: needs BACKEND_API_URL unset here — it's a server-only var read
# at request time (see src/lib/api/backend.ts), never inlined into the build,
# so it's supplied at `docker run` / Cloud Run, not at build time. ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- runner: output: "standalone" (next.config.ts) traces only the files
# next start actually needs, so this stage never installs node_modules. ---
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run sets $PORT at runtime; 8080 is the default it uses — same
# convention as the backend's Dockerfile.
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["node", "server.js"]
