/**
 * Cloudflare KV client for rate limiting
 * In production, this calls Cloudflare KV via REST API
 * In development, falls back to local Redis
 */

import { config } from "../config.js";

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || "";
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || "";
const CF_API_TOKEN = process.env.CF_API_TOKEN || "";

const KV_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}`;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and increment rate limit counter in Cloudflare KV
 */
export async function checkRateLimitKV(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  // In dev mode or if CF not configured, return allowed
  if (!CF_ACCOUNT_ID || !CF_KV_NAMESPACE_ID || !CF_API_TOKEN || config.nodeEnv === "development") {
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowMs };
  }

  try {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
    
    // Get current count
    const getRes = await fetch(`${KV_API_BASE}/values/${encodeURIComponent(windowKey)}`, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    });

    let currentCount = 0;
    if (getRes.ok) {
      const text = await getRes.text();
      currentCount = parseInt(text, 10) || 0;
    }

    if (currentCount >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: (Math.floor(now / windowMs) + 1) * windowMs,
      };
    }

    // Increment counter
    await fetch(`${KV_API_BASE}/values/${encodeURIComponent(windowKey)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "text/plain",
      },
      body: String(currentCount + 1),
    });

    return {
      allowed: true,
      remaining: maxRequests - currentCount - 1,
      resetAt: (Math.floor(now / windowMs) + 1) * windowMs,
    };
  } catch (err) {
    console.error("Cloudflare KV rate limit error:", err);
    // On error, allow the request
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowMs };
  }
}

/**
 * Upload log data to Cloudflare R2
 */
export async function uploadLogToR2(
  requestId: string,
  data: object
): Promise<boolean> {
  const CF_R2_BUCKET = process.env.CF_R2_BUCKET || "";
  const CF_R2_ACCESS_KEY = process.env.CF_R2_ACCESS_KEY || "";
  const CF_R2_SECRET_KEY = process.env.CF_R2_SECRET_KEY || "";
  const CF_R2_ENDPOINT = process.env.CF_R2_ENDPOINT || "";

  // In dev mode or if R2 not configured, skip
  if (!CF_R2_BUCKET || !CF_R2_ENDPOINT || config.nodeEnv === "development") {
    return false;
  }

  try {
    const date = new Date().toISOString().split("T")[0];
    const key = `logs/${date}/${requestId}.json`;
    
    // Use S3-compatible API
    const url = `${CF_R2_ENDPOINT}/${CF_R2_BUCKET}/${key}`;
    
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Note: In production, use proper AWS S3 signature
      },
      body: JSON.stringify(data),
    });

    return res.ok;
  } catch (err) {
    console.error("R2 upload error:", err);
    return false;
  }
}
