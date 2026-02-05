import { redis } from "../lib/redis.js";
import { PLAN_LIMITS, type PlanLimits } from "../types/index.js";

export interface RateLimitResult {
  allowed: boolean;
  minuteLimit: number;
  minuteRemaining: number;
  minuteReset: number;
  monthlyLimit: number;
  monthlyRemaining: number;
  monthlyReset: number;
  retryAfter?: number;
}

export interface RateLimitContext {
  apiKeyId: string;
  plan: string;
  organizationId?: string;
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getMonthlyResetTimestamp(): number {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return Math.floor(nextMonth.getTime() / 1000);
}

export async function checkRateLimit(ctx: RateLimitContext): Promise<RateLimitResult> {
  const planLimits: PlanLimits = PLAN_LIMITS[ctx.plan] || PLAN_LIMITS.FREE;
  
  const now = Date.now();
  const minuteWindow = Math.floor(now / 60000);
  const monthKey = getMonthKey();
  
  // Redis keys
  const minuteKey = `ratelimit:minute:${ctx.apiKeyId}:${minuteWindow}`;
  const monthlyKey = `ratelimit:monthly:${ctx.apiKeyId}:${monthKey}`;
  
  // Use pipeline for atomic operations
  const pipeline = redis.pipeline();
  pipeline.incr(minuteKey);
  pipeline.expire(minuteKey, 60);
  pipeline.incr(monthlyKey);
  // Monthly key expires after 35 days (buffer for month end)
  pipeline.expire(monthlyKey, 60 * 60 * 24 * 35);
  
  const results = await pipeline.exec();
  
  const minuteCount = (results?.[0]?.[1] as number) || 0;
  const monthlyCount = (results?.[2]?.[1] as number) || 0;
  
  const minuteRemaining = Math.max(0, planLimits.requestsPerMinute - minuteCount);
  const monthlyRemaining = Math.max(0, planLimits.monthlyRequests - monthlyCount);
  const minuteReset = Math.ceil((minuteWindow + 1) * 60);
  const monthlyReset = getMonthlyResetTimestamp();
  
  // Check if rate limited
  if (minuteCount > planLimits.requestsPerMinute) {
    return {
      allowed: false,
      minuteLimit: planLimits.requestsPerMinute,
      minuteRemaining: 0,
      minuteReset,
      monthlyLimit: planLimits.monthlyRequests,
      monthlyRemaining,
      monthlyReset,
      retryAfter: 60 - (Math.floor(now / 1000) % 60),
    };
  }
  
  if (monthlyCount > planLimits.monthlyRequests) {
    return {
      allowed: false,
      minuteLimit: planLimits.requestsPerMinute,
      minuteRemaining,
      minuteReset,
      monthlyLimit: planLimits.monthlyRequests,
      monthlyRemaining: 0,
      monthlyReset,
      retryAfter: monthlyReset - Math.floor(now / 1000),
    };
  }
  
  return {
    allowed: true,
    minuteLimit: planLimits.requestsPerMinute,
    minuteRemaining,
    minuteReset,
    monthlyLimit: planLimits.monthlyRequests,
    monthlyRemaining,
    monthlyReset,
  };
}

export async function getUsageStats(apiKeyId: string): Promise<{
  minuteCount: number;
  monthlyCount: number;
}> {
  const now = Date.now();
  const minuteWindow = Math.floor(now / 60000);
  const monthKey = getMonthKey();
  
  const minuteKey = `ratelimit:minute:${apiKeyId}:${minuteWindow}`;
  const monthlyKey = `ratelimit:monthly:${apiKeyId}:${monthKey}`;
  
  const [minuteCount, monthlyCount] = await redis.mget(minuteKey, monthlyKey);
  
  return {
    minuteCount: parseInt(minuteCount || "0", 10),
    monthlyCount: parseInt(monthlyCount || "0", 10),
  };
}

// Check if approaching quota (for webhook alerts)
export async function checkQuotaAlerts(
  apiKeyId: string,
  plan: string
): Promise<{ alert80: boolean; alert100: boolean }> {
  const planLimits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
  const { monthlyCount } = await getUsageStats(apiKeyId);
  
  const usagePercent = (monthlyCount / planLimits.monthlyRequests) * 100;
  
  return {
    alert80: usagePercent >= 80 && usagePercent < 100,
    alert100: usagePercent >= 100,
  };
}
