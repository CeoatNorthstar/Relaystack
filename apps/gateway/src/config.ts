import "dotenv/config";

// Build DATABASE_URL from individual parts if not provided directly
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Build from parts (for ECS with Secrets Manager)
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const name = process.env.DB_NAME || "relaystack";
  const user = process.env.DB_USERNAME;
  const pass = process.env.DB_PASSWORD;
  
  if (host && user && pass) {
    return `postgresql://${user}:${pass}@${host}:${port}/${name}`;
  }
  
  return "postgresql://postgres:postgres@localhost:5432/relaystack";
}

export const config = {
  port: parseInt(process.env.PORT || "8080", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  
  // AWS mode: when true, uses RDS/ElastiCache/S3 instead of local
  useAws: process.env.USE_AWS === "true",
  
  database: {
    url: getDatabaseUrl(),
  },
  
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  
  auth: {
    testApiKey: process.env.TEST_API_KEY || "TEST_KEY_123",
    jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  },
  
  // AWS Cognito settings
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID || "",
    clientId: process.env.COGNITO_CLIENT_ID || "",
    region: process.env.AWS_REGION || "us-east-1",
  },
  
  // AWS resources (populated from CDK outputs or env vars)
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    rdsSecretArn: process.env.RDS_SECRET_ARN || "",
    rdsEndpoint: process.env.RDS_ENDPOINT || "",
    redisEndpoint: process.env.REDIS_ENDPOINT || "",
    logsBucket: process.env.LOGS_BUCKET || "",
    exportsBucket: process.env.EXPORTS_BUCKET || "",
  },
  
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,     // 60 requests per minute (default)
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY || "default-dev-key-change-in-prod!!",
  },
  
  cache: {
    enabled: process.env.CACHE_ENABLED !== "false",
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || "3600", 10), // 1 hour
    maxTtlSeconds: 86400, // 24 hours max
  },
  
  logging: {
    logBodies: process.env.LOG_BODIES !== "false",
    logDir: process.env.LOG_DIR || "./logs",
  },
  
  circuitBreaker: {
    threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || "5", 10),
    timeoutMs: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || "60000", 10),
  },
  
  providers: {
    timeout: 60000, // 60 seconds
    retries: 2,
    retryDelayMs: 1000, // Base delay for exponential backoff
  },
  
  // Provider API keys (optional - can also use encrypted DB keys)
  providerKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
    groq: process.env.GROQ_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    together: process.env.TOGETHER_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    cohere: process.env.COHERE_API_KEY,
  },
} as const;
