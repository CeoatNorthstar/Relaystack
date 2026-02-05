# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/gateway ./apps/gateway

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd packages/shared && pnpm prisma generate

# Build gateway
RUN cd apps/gateway && pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm and curl for healthcheck
RUN corepack enable && corepack prepare pnpm@latest --activate && apk add --no-cache curl

# Copy built files
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=builder /app/apps/gateway/package.json ./apps/gateway/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/gateway/node_modules ./apps/gateway/node_modules

# Set working directory to gateway
WORKDIR /app/apps/gateway

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
