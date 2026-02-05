# RelayStack Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Pages    │  │     KV     │  │     R2     │                │
│  │ (Dashboard)│  │(Rate Limit)│  │   (Logs)   │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          AWS                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    VPC (Private)                        │    │
│  │  ┌──────────────┐         ┌──────────────┐             │    │
│  │  │ ECS Fargate  │────────▶│     RDS      │             │    │
│  │  │  (Gateway)   │         │ (PostgreSQL) │             │    │
│  │  └──────────────┘         └──────────────┘             │    │
│  │         │                                               │    │
│  │         ▼                                               │    │
│  │  ┌──────────────┐                                       │    │
│  │  │     ALB      │◀── Internet                          │    │
│  │  └──────────────┘                                       │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- AWS CLI configured (`aws configure`)
- Node.js 20+
- pnpm
- Docker (for local testing)
- Cloudflare account

---

## 1. Local Development

```bash
# Start local services
docker compose up -d

# Install dependencies
pnpm install

# Run database migrations
cd apps/gateway && npx prisma migrate dev

# Start Gateway
cd apps/gateway && pnpm dev

# Start Dashboard (new terminal)
cd apps/dashboard && pnpm dev
```

- Gateway: http://localhost:8080
- Dashboard: http://localhost:3000

---

## 2. Deploy AWS Infrastructure

```bash
cd infra/cdk

# Install CDK dependencies
npm install

# Bootstrap CDK (first time only)
npx cdk bootstrap

# Deploy stack
npx cdk deploy

# Save outputs
npx cdk deploy --outputs-file ../aws-outputs.json
```

**Created Resources:**
- VPC with public/private subnets
- ECS Cluster + Fargate Service
- Application Load Balancer
- RDS PostgreSQL 16
- ECR Repository
- Secrets Manager (DB credentials, JWT secret)

---

## 3. Build & Push Gateway Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-2.amazonaws.com

# Build image (from repo root)
docker build -t relaystack-gateway -f apps/gateway/Dockerfile .

# Tag and push
docker tag relaystack-gateway:latest <ECR_URI>:latest
docker push <ECR_URI>:latest

# Force new deployment
aws ecs update-service --cluster relaystack-cluster --service relaystack-gateway --force-new-deployment
```

---

## 4. Setup Cloudflare

### Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### Create KV Namespace

```bash
wrangler kv:namespace create "RATE_LIMITS"
# Copy the ID to infra/cloudflare/wrangler.toml
```

### Create R2 Bucket

```bash
wrangler r2 bucket create relaystack-logs
```

### Deploy Dashboard to Pages

```bash
cd apps/dashboard

# Build for production
pnpm build

# Deploy to Pages
npx wrangler pages deploy out --project-name=relaystack-dashboard
```

---

## 5. Environment Variables

### Gateway (ECS Task Definition)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (from Secrets Manager) |
| `JWT_SECRET` | JWT signing secret (from Secrets Manager) |
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `CF_ACCOUNT_ID` | Cloudflare Account ID |
| `CF_KV_NAMESPACE_ID` | KV namespace ID for rate limits |
| `CF_API_TOKEN` | Cloudflare API token |
| `CF_R2_BUCKET` | R2 bucket name |
| `CF_R2_ENDPOINT` | R2 S3-compatible endpoint |

### Dashboard (.env.local or Pages)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GATEWAY_URL` | Gateway ALB URL |

---

## 6. Verify Deployment

```bash
# Check Gateway health
curl http://<ALB_DNS>/health

# Register user
curl -X POST http://<ALB_DNS>/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://<ALB_DNS>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Cost Estimate (Monthly)

| Service | Est. Cost |
|---------|-----------|
| ECS Fargate (0.5 vCPU, 1GB) | ~$15 |
| RDS PostgreSQL (db.t3.micro) | ~$15 |
| Application Load Balancer | ~$20 |
| NAT Gateway | ~$35 |
| Cloudflare (Free tier) | $0 |
| **Total** | **~$85/mo** |

---

## Troubleshooting

### ECS Service Not Starting

```bash
# Check service events
aws ecs describe-services --cluster relaystack-cluster --services relaystack-gateway

# Check task logs
aws logs tail /ecs/gateway --follow
```

### Database Connection Issues

```bash
# Get RDS credentials from Secrets Manager
aws secretsmanager get-secret-value --secret-id relaystack/db-credentials
```

### Force Redeploy

```bash
aws ecs update-service --cluster relaystack-cluster --service relaystack-gateway --force-new-deployment
```
