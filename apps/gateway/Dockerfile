# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/gateway ./apps/gateway

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd apps/gateway && pnpm prisma generate

# Build gateway
RUN cd apps/gateway && pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for healthcheck and pnpm
RUN apk add --no-cache curl openssl && \
    corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/gateway/package.json ./apps/gateway/

# Copy prisma schema BEFORE install (for postinstall hook)
COPY --from=builder /app/apps/gateway/prisma ./apps/gateway/prisma

# Install production dependencies (includes prisma now)
RUN pnpm install --prod --frozen-lockfile

# Copy built files
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist

# Create startup script that runs migrations then starts the app
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'cd /app/apps/gateway' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Construct DATABASE_URL from parts if not set' >> /app/start.sh && \
    echo 'if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then' >> /app/start.sh && \
    echo '  export DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-relaystack}"' >> /app/start.sh && \
    echo '  echo "✓ Constructed DATABASE_URL from parts"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "Running database migrations..."' >> /app/start.sh && \
    echo 'pnpm prisma migrate deploy || echo "Migration failed or already applied"' >> /app/start.sh && \
    echo 'echo "Starting gateway..."' >> /app/start.sh && \
    echo 'exec node dist/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

WORKDIR /app/apps/gateway

# Environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["sh", "/app/start.sh"]
