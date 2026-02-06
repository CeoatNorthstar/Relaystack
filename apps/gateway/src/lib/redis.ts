import Redis from "ioredis";
import { config } from "../config.js";

// Only create Redis client if URL is configured (not localhost default)
const redisEnabled = config.redis.url && !config.redis.url.includes("localhost");

const redisClient = redisEnabled 
  ? new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })
  : null;

if (redisClient) {
  redisClient.on("error", (err) => {
    // Only log once, not on every retry
    if (!redisClient.status || redisClient.status !== 'reconnecting') {
      console.error("Redis connection error:", err.message);
    }
  });
}

// Export a non-null redis for backward compatibility (will be a dummy if not configured)
export const redis = redisClient || createDummyRedis();

function createDummyRedis(): Redis {
  // Return a proxy that logs when Redis operations are attempted without Redis
  return new Proxy({} as Redis, {
    get(_, prop) {
      if (prop === 'status') return 'closed';
      return async () => {
        console.warn(`Redis operation attempted but Redis not configured`);
        return null;
      };
    }
  });
}

export async function checkRedisConnection(): Promise<boolean> {
  if (!redisClient) return false;
  try {
    await redisClient.ping();
    return true;
  } catch {
    return false;
  }
}

export async function connectRedis(): Promise<void> {
  if (!redisClient) {
    console.log("⚠ Redis not configured, skipping connection");
    return;
  }
  await redisClient.connect();
}
