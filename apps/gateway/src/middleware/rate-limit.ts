import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../lib/redis.js";
import { config } from "../config.js";

export async function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip rate limit for health endpoint
  if (request.url === "/health") {
    return;
  }

  const apiKey = (request as any).apiKey;
  if (!apiKey) {
    return; // No API key means auth middleware will handle it
  }

  const { windowMs, maxRequests } = config.rateLimit;
  const windowKey = Math.floor(Date.now() / windowMs);
  const redisKey = `ratelimit:${apiKey}:${windowKey}`;

  try {
    const current = await redis.incr(redisKey);
    
    // Set expiry on first request in window
    if (current === 1) {
      await redis.pexpire(redisKey, windowMs);
    }

    // Add rate limit headers
    reply.header("X-RateLimit-Limit", maxRequests);
    reply.header("X-RateLimit-Remaining", Math.max(0, maxRequests - current));
    reply.header("X-RateLimit-Reset", Math.ceil((windowKey + 1) * windowMs / 1000));

    if (current > maxRequests) {
      reply.code(429).send({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        retryAfter: Math.ceil(windowMs / 1000),
      });
      return;
    }
  } catch (err) {
    // Log error but don't block request if Redis is down
    console.error("Rate limit check failed:", err);
  }
}

export function registerRateLimitHook(app: FastifyInstance): void {
  app.addHook("preHandler", rateLimitMiddleware);
}
