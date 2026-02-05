import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "crypto";
import { getCachedResponse, setCachedResponse } from "../lib/cache.js";
import { checkRateLimit, type RateLimitContext } from "../services/rate-limit.service.js";
import { routeRequest, routeStreamingRequest } from "../services/route-engine.service.js";
import { logRequest } from "../services/logger.service.js";
import type { ChatCompletionRequest, ChatCompletionResponse, RequestMetadata } from "../types/index.js";

interface ChatRequestBody extends ChatCompletionRequest {}

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.post("/v1/chat/completions", async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = `req_${randomUUID().replace(/-/g, "")}`;
    const startTime = Date.now();
    
    // Get API key info from auth middleware
    const apiKey = (request as any).apiKey as string;
    const apiKeyId = (request as any).apiKeyId as string || "test-key";
    const organizationId = (request as any).organizationId as string || "default-org";
    const plan = (request as any).plan as string || "FREE";
    
    // Check rate limits
    const rateLimitCtx: RateLimitContext = {
      apiKeyId,
      plan,
    };
    
    const rateLimitResult = await checkRateLimit(rateLimitCtx);
    
    // Add rate limit headers
    reply.header("X-RateLimit-Limit", rateLimitResult.minuteLimit);
    reply.header("X-RateLimit-Remaining", rateLimitResult.minuteRemaining);
    reply.header("X-RateLimit-Reset", rateLimitResult.minuteReset);
    reply.header("X-Monthly-Limit", rateLimitResult.monthlyLimit);
    reply.header("X-Monthly-Remaining", rateLimitResult.monthlyRemaining);
    reply.header("X-RelayStack-Request-Id", requestId);
    
    if (!rateLimitResult.allowed) {
      reply.header("Retry-After", rateLimitResult.retryAfter);
      return reply.code(429).send({
        error: "Too Many Requests",
        message: rateLimitResult.monthlyRemaining === 0 
          ? "Monthly quota exceeded" 
          : "Rate limit exceeded",
        retryAfter: rateLimitResult.retryAfter,
      });
    }
    
    // Parse request body
    const body = request.body as ChatRequestBody;
    
    if (!body.model || !body.messages || !Array.isArray(body.messages)) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "model and messages are required",
      });
    }
    
    const userProviderKey = request.headers["x-provider-key"] as string | undefined;
    
    // Check cache for non-streaming requests
    if (!body.stream) {
      const cached = await getCachedResponse(body);
      if (cached) {
        reply.header("X-RelayStack-Cached", "true");
        reply.header("X-RelayStack-Provider", "cache");
        reply.header("X-RelayStack-Latency", Date.now() - startTime);
        
        // Log cache hit
        logRequest({
          requestId,
          apiKeyId,
          provider: "cache",
          model: body.model,
          startTime,
          endTime: Date.now(),
          latencyMs: Date.now() - startTime,
          cached: true,
          fallbackUsed: false,
          statusCode: 200,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        });
        
        return reply.send(cached);
      }
    }
    
    // Handle streaming request
    if (body.stream) {
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RelayStack-Request-Id": requestId,
      });
      
      try {
        await routeStreamingRequest(
          body,
          {
            requestId,
            apiKeyId,
            organizationId,
            userProviderKey,
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"],
          },
          {
            onChunk: (chunk) => {
              reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
            },
            onDone: (usage) => {
              reply.raw.write("data: [DONE]\n\n");
              reply.raw.end();
            },
            onError: (error) => {
              reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
              reply.raw.end();
            },
            onMetadata: (metadata) => {
              // Log async
              logRequest(metadata, body);
            },
          }
        );
      } catch (err) {
        const error = err as Error;
        reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        reply.raw.end();
      }
      
      return;
    }
    
    // Handle non-streaming request
    try {
      const { response, metadata } = await routeRequest(body, {
        requestId,
        apiKeyId,
        organizationId,
        userProviderKey,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });
      
      // Add response headers
      reply.header("X-RelayStack-Provider", metadata.provider);
      reply.header("X-RelayStack-Model", metadata.model);
      reply.header("X-RelayStack-Latency", metadata.latencyMs);
      reply.header("X-RelayStack-Cached", "false");
      reply.header("X-RelayStack-Fallback", metadata.fallbackUsed ? "true" : "false");
      
      if (metadata.fallbackProvider) {
        reply.header("X-RelayStack-Fallback-Provider", metadata.fallbackProvider);
      }
      
      // Cache the response
      await setCachedResponse(body, response);
      
      // Log async
      logRequest(metadata, body, response);
      
      return reply.send(response);
    } catch (err) {
      const error = err as Error;
      
      // Log error
      logRequest({
        requestId,
        apiKeyId,
        provider: "unknown",
        model: body.model,
        startTime,
        endTime: Date.now(),
        latencyMs: Date.now() - startTime,
        cached: false,
        fallbackUsed: false,
        statusCode: 502,
        errorMessage: error.message,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      }, body);
      
      return reply.code(502).send({
        error: "Bad Gateway",
        message: error.message,
        requestId,
      });
    }
  });
}
