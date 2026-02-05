# RelayStack Gateway - Setup Guide

Complete setup instructions for running the RelayStack Gateway locally.

---

## Prerequisites

- **Node.js** v18+ 
- **pnpm** v9+
- **Docker** & **Docker Compose**

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start Docker containers (Postgres + Redis)
docker-compose up -d

# 3. Run database migrations
pnpm --filter gateway db:migrate

# 4. Seed test data (optional)
pnpm --filter gateway db:seed

# 5. Start the Gateway server
pnpm --filter gateway dev
```

Server runs at: **http://localhost:8080**

---

## Docker Commands

### Start Services
```bash
# Start Postgres + Redis in background
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Stop Services
```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps volumes/data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

### Reset Database
```bash
# Remove Postgres volume and recreate
docker-compose down -v
docker-compose up -d
pnpm --filter gateway db:migrate
```

---

## Database Commands

### Prisma Commands
```bash
# Generate Prisma client
pnpm --filter gateway db:generate

# Run migrations
pnpm --filter gateway db:migrate

# Create a new migration
pnpm --filter gateway db:migrate:dev

# Reset database (drop all data)
pnpm --filter gateway db:reset

# Open Prisma Studio (GUI)
pnpm --filter gateway db:studio

# Seed database
pnpm --filter gateway db:seed
```

### Direct Database Access
```bash
# Connect to Postgres via Docker
docker exec -it relaystack-postgres psql -U postgres -d relaystack

# Common SQL commands
\dt                    # List tables
\d+ table_name         # Describe table
SELECT * FROM "User";  # Query (note: Prisma uses PascalCase)
\q                     # Exit
```

---

## Redis Commands

### Direct Redis Access
```bash
# Connect to Redis via Docker
docker exec -it relaystack-redis redis-cli

# Common Redis commands
KEYS *                 # List all keys
GET key_name           # Get value
TTL key_name           # Check TTL
FLUSHALL               # Clear all data (careful!)
exit                   # Exit
```

### Check Rate Limit Keys
```bash
# Rate limit keys follow pattern: ratelimit:{api_key}:{window}
docker exec -it relaystack-redis redis-cli KEYS "ratelimit:*"
```

---

## Environment Variables

Create `.env` file in `apps/gateway/`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/relaystack

# Redis  
REDIS_URL=redis://localhost:6379

# Server
PORT=8080
NODE_ENV=development

# Auth (Phase 1 test key)
TEST_API_KEY=TEST_KEY_123
```

---

## Testing the API

### Health Check
```bash
curl http://localhost:8080/health
# Response: {"status":"ok","db":"ok","redis":"ok"}
```

### Without API Key (should fail)
```bash
curl http://localhost:8080/v1/chat/completions
# Response: {"error":"Unauthorized","message":"API key required"}
```

---

## Managing Provider API Keys

Users must add their own AI provider API keys before making chat requests.

### Add a Provider Key
```bash
curl -X POST http://localhost:8080/v1/credentials \
  -H "Authorization: Bearer TEST_KEY_123" \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "apiKey": "sk-your-openai-key"}'

# Response: {"message":"Credential stored successfully","credential":{"id":"...","provider":"openai","isDefault":true}}
```

### Supported Providers
- `openai` - OpenAI (GPT-4, GPT-3.5)
- `anthropic` - Anthropic (Claude)
- `google` - Google (Gemini)
- `groq` - Groq (LLaMA, Mixtral)
- `mistral` - Mistral AI
- `together` - Together AI
- `perplexity` - Perplexity AI
- `cohere` - Cohere

### List Your Provider Keys
```bash
curl -H "Authorization: Bearer TEST_KEY_123" http://localhost:8080/v1/credentials
```

### Delete a Provider Key
```bash
curl -X DELETE http://localhost:8080/v1/credentials/{credential_id} \
  -H "Authorization: Bearer TEST_KEY_123"
```

---

## Making Chat Requests

### Basic Request (after adding provider key)
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer TEST_KEY_123" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### With Fallback Models
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer TEST_KEY_123" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}],
    "fallback_models": ["claude-3-sonnet", "gemini-1.5-pro"]
  }'
```

### Override Provider Key (per-request)
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer TEST_KEY_123" \
  -H "X-Provider-Key: sk-different-openai-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Streaming
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Authorization: Bearer TEST_KEY_123" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

---

## Project Scripts

### Root Level
```bash
pnpm dev          # Start all packages in dev mode
pnpm build        # Build all packages
pnpm lint         # Lint all packages
```

### Gateway (apps/gateway)
```bash
pnpm --filter gateway dev           # Start dev server
pnpm --filter gateway build         # Build for production
pnpm --filter gateway start         # Start production server
pnpm --filter gateway db:migrate    # Run migrations
pnpm --filter gateway db:studio     # Open Prisma Studio
```

### SDK (packages/sdk)
```bash
pnpm --filter relaystack build      # Build SDK
pnpm --filter relaystack test       # Run SDK tests
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill process (replace PID)
kill -9 <PID>
```

### Docker Issues
```bash
# Restart Docker containers
docker-compose restart

# Rebuild containers
docker-compose up -d --build

# Check container logs
docker-compose logs postgres
docker-compose logs redis
```

### Database Connection Issues
```bash
# Verify Postgres is running
docker-compose ps

# Test connection
docker exec -it relaystack-postgres pg_isready

# Check DATABASE_URL in .env matches docker-compose.yml
```

### Prisma Issues
```bash
# Regenerate Prisma client
pnpm --filter gateway db:generate

# If schema changes aren't reflected
rm -rf apps/gateway/node_modules/.prisma
pnpm --filter gateway db:generate
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client / SDK                         │
│                   (relaystack package)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Request
                      │ Authorization: Bearer <API_KEY>
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Gateway Server                           │
│                  (Fastify @ :8080)                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────────┐   │
│  │   Auth    │→ │   Rate    │→ │       Routes          │   │
│  │Middleware │  │  Limiter  │  │  /health, /v1/chat/*  │   │
│  └───────────┘  └───────────┘  └───────────────────────┘   │
└─────────┬────────────────┬──────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────┐  ┌─────────────────┐
│    PostgreSQL   │  │      Redis      │
│   (Port 5432)   │  │   (Port 6379)   │
│                 │  │                 │
│  - Users        │  │  - Rate limits  │
│  - API Keys     │  │  - Cache        │
│  - Requests     │  │  - Sessions     │
│  - Orgs/Projects│  │                 │
└─────────────────┘  └─────────────────┘
```
