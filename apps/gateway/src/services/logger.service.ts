import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { config } from "../config.js";
import { db } from "../lib/db.js";
import type { RequestMetadata, ChatCompletionRequest, ChatCompletionResponse } from "../types/index.js";

interface LogEntry {
  metadata: RequestMetadata;
  request?: ChatCompletionRequest;
  response?: ChatCompletionResponse;
}

// In-memory queue for async logging
const logQueue: LogEntry[] = [];
let isProcessing = false;

export async function logRequest(
  metadata: RequestMetadata,
  request?: ChatCompletionRequest,
  response?: ChatCompletionResponse
): Promise<void> {
  // Add to queue (non-blocking)
  logQueue.push({ metadata, request, response });
  
  // Start processing if not already running
  if (!isProcessing) {
    processQueue().catch(console.error);
  }
}

async function processQueue(): Promise<void> {
  if (isProcessing || logQueue.length === 0) return;
  
  isProcessing = true;
  
  while (logQueue.length > 0) {
    const entry = logQueue.shift();
    if (!entry) continue;
    
    try {
      await Promise.all([
        saveToDatabase(entry.metadata),
        config.logging.logBodies 
          ? saveToFile(entry) 
          : Promise.resolve(),
      ]);
    } catch (err) {
      console.error("Failed to log request:", err);
    }
  }
  
  isProcessing = false;
}

async function saveToDatabase(metadata: RequestMetadata): Promise<void> {
  try {
    // Skip apiKeyId if it's a test key (not in DB)
    const apiKeyId = metadata.apiKeyId?.startsWith("test") ? null : metadata.apiKeyId;
    
    await db.request.create({
      data: {
        id: metadata.requestId,
        apiKeyId: apiKeyId || null,
        method: "POST",
        path: "/v1/chat/completions",
        statusCode: metadata.statusCode,
        latencyMs: metadata.latencyMs || 0,
        inputTokens: metadata.inputTokens ?? null,
        outputTokens: metadata.outputTokens ?? null,
        totalTokens: metadata.totalTokens ?? null,
        model: metadata.model ?? null,
        provider: metadata.provider ?? null,
        cost: metadata.cost ? metadata.cost : null,
        errorMessage: metadata.errorMessage ?? null,
        ipAddress: metadata.ipAddress ?? null,
        userAgent: metadata.userAgent ?? null,
      },
    });
  } catch (err) {
    // Log error but don't throw - logging should never block requests
    console.error("Failed to save request to database:", err);
  }
}

async function saveToFile(entry: LogEntry): Promise<void> {
  try {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const logDir = join(config.logging.logDir, date);
    
    // Ensure directory exists
    await mkdir(logDir, { recursive: true });
    
    const filePath = join(logDir, `${entry.metadata.requestId}.json`);
    
    const logData = {
      metadata: entry.metadata,
      request: entry.request,
      response: entry.response,
      timestamp: new Date().toISOString(),
    };
    
    await writeFile(filePath, JSON.stringify(logData, null, 2));
  } catch (err) {
    console.error("Failed to save request to file:", err);
  }
}

// Cleanup old logs based on retention period
export async function cleanupOldLogs(retentionDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  try {
    const result = await db.request.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`Cleaned up ${result.count} old log entries`);
    return result.count;
  } catch (err) {
    console.error("Failed to cleanup old logs:", err);
    return 0;
  }
}

// Get request statistics
export async function getRequestStats(apiKeyId: string, days: number = 30): Promise<{
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  errorRate: number;
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  const stats = await db.request.aggregate({
    where: {
      apiKeyId,
      createdAt: { gte: since },
    },
    _count: { id: true },
    _sum: {
      totalTokens: true,
      cost: true,
    },
    _avg: {
      latencyMs: true,
    },
  });
  
  const errorCount = await db.request.count({
    where: {
      apiKeyId,
      createdAt: { gte: since },
      statusCode: { gte: 400 },
    },
  });
  
  const totalRequests = stats._count.id || 0;
  
  return {
    totalRequests,
    totalTokens: stats._sum.totalTokens || 0,
    totalCost: Number(stats._sum.cost) || 0,
    avgLatency: stats._avg.latencyMs || 0,
    errorRate: totalRequests > 0 ? errorCount / totalRequests : 0,
  };
}
