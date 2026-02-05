import { createHmac } from "crypto";
import { db } from "../lib/db.js";

export type WebhookEvent = 
  | "quota.warning"      // 80% of monthly quota
  | "quota.exceeded"     // 100% of monthly quota
  | "request.error"      // Provider error
  | "circuit.open"       // Circuit breaker opened
  | "circuit.closed";    // Circuit breaker closed

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
}

// In-memory queue for async webhook dispatch
const webhookQueue: Array<{
  url: string;
  secret: string;
  payload: WebhookPayload;
}> = [];
let isProcessing = false;

function generateSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

async function sendWebhook(
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<boolean> {
  const body = JSON.stringify(payload);
  const signature = generateSignature(body, secret);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RelayStack-Signature": signature,
        "X-RelayStack-Event": payload.event,
      },
      body,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    return response.ok;
  } catch (err) {
    console.error(`Webhook failed for ${url}:`, err);
    return false;
  }
}

async function processQueue(): Promise<void> {
  if (isProcessing || webhookQueue.length === 0) return;
  
  isProcessing = true;
  
  while (webhookQueue.length > 0) {
    const item = webhookQueue.shift();
    if (!item) continue;
    
    const success = await sendWebhook(item.url, item.secret, item.payload);
    
    if (success) {
      // Update lastTriggeredAt
      try {
        await db.webhook.updateMany({
          where: { url: item.url },
          data: { lastTriggeredAt: new Date() },
        });
      } catch {
        // Ignore update errors
      }
    }
  }
  
  isProcessing = false;
}

export async function dispatchWebhook(
  organizationId: string,
  event: WebhookEvent,
  data: Record<string, any>
): Promise<void> {
  // Get webhooks for this organization that listen to this event
  const webhooks = await db.webhook.findMany({
    where: {
      organizationId,
      isActive: true,
      events: { has: event },
    },
  });

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // Add to queue for async processing
  for (const webhook of webhooks) {
    webhookQueue.push({
      url: webhook.url,
      secret: webhook.secret,
      payload,
    });
  }

  // Start processing
  if (!isProcessing) {
    processQueue().catch(console.error);
  }
}

// Convenience functions for common events
export async function dispatchQuotaWarning(
  organizationId: string,
  usage: number,
  limit: number
): Promise<void> {
  await dispatchWebhook(organizationId, "quota.warning", {
    usage,
    limit,
    percentage: Math.round((usage / limit) * 100),
    message: `API usage has reached ${Math.round((usage / limit) * 100)}% of monthly quota`,
  });
}

export async function dispatchQuotaExceeded(
  organizationId: string,
  usage: number,
  limit: number
): Promise<void> {
  await dispatchWebhook(organizationId, "quota.exceeded", {
    usage,
    limit,
    overage: usage - limit,
    message: "Monthly API quota has been exceeded",
  });
}

export async function dispatchRequestError(
  organizationId: string,
  requestId: string,
  error: string,
  provider: string
): Promise<void> {
  await dispatchWebhook(organizationId, "request.error", {
    requestId,
    error,
    provider,
    message: `Request failed: ${error}`,
  });
}

export async function dispatchCircuitOpen(
  organizationId: string,
  provider: string
): Promise<void> {
  await dispatchWebhook(organizationId, "circuit.open", {
    provider,
    message: `Circuit breaker opened for provider: ${provider}`,
  });
}

export async function dispatchCircuitClosed(
  organizationId: string,
  provider: string
): Promise<void> {
  await dispatchWebhook(organizationId, "circuit.closed", {
    provider,
    message: `Circuit breaker closed for provider: ${provider}`,
  });
}
