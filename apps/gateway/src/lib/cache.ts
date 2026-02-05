import { createHash } from "crypto";
import { redis } from "./redis.js";
import { config } from "../config.js";
import type { ChatCompletionRequest, ChatCompletionResponse } from "../types/index.js";

const CACHE_PREFIX = "cache:chat:";

function generateCacheKey(request: ChatCompletionRequest): string {
  // Create deterministic hash from model + messages + key params
  const cacheData = {
    model: request.model,
    messages: request.messages,
    temperature: request.temperature,
    max_tokens: request.max_tokens,
  };
  
  const hash = createHash("sha256")
    .update(JSON.stringify(cacheData))
    .digest("hex")
    .slice(0, 32);
  
  return `${CACHE_PREFIX}${hash}`;
}

export async function getCachedResponse(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse | null> {
  if (!config.cache.enabled) return null;
  if (request.stream) return null; // Don't cache streaming requests
  if (request.cache === false) return null; // Explicitly disabled
  
  try {
    const key = generateCacheKey(request);
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached) as ChatCompletionResponse;
    }
  } catch (err) {
    console.error("Cache get error:", err);
  }
  
  return null;
}

export async function setCachedResponse(
  request: ChatCompletionRequest,
  response: ChatCompletionResponse
): Promise<void> {
  if (!config.cache.enabled) return;
  if (request.stream) return;
  if (request.cache === false) return;
  
  try {
    const key = generateCacheKey(request);
    
    // Use custom TTL if provided, otherwise default
    let ttl = request.cache_ttl || config.cache.ttlSeconds;
    ttl = Math.min(ttl, config.cache.maxTtlSeconds); // Cap at max
    
    await redis.setex(key, ttl, JSON.stringify(response));
  } catch (err) {
    console.error("Cache set error:", err);
  }
}

export async function invalidateCache(pattern?: string): Promise<number> {
  try {
    const searchPattern = pattern 
      ? `${CACHE_PREFIX}${pattern}*` 
      : `${CACHE_PREFIX}*`;
    
    const keys = await redis.keys(searchPattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    return keys.length;
  } catch (err) {
    console.error("Cache invalidation error:", err);
    return 0;
  }
}

export async function getCacheStats(): Promise<{
  enabled: boolean;
  keyCount: number;
}> {
  const keys = await redis.keys(`${CACHE_PREFIX}*`);
  return {
    enabled: config.cache.enabled,
    keyCount: keys.length,
  };
}
