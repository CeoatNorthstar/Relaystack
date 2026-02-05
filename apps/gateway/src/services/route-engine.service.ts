import { config } from "../config.js";
import { 
  getProvider, 
  detectProviderFromModel,
} from "../providers/index.js";
import {
  getModelTier,
  MODEL_TIER_MAP,
  calculateCost,
} from "../providers/base.provider.js";
import type { BaseProvider, ProviderRequestOptions, ProviderStreamCallbacks } from "../providers/base.provider.js";
import { 
  canAttempt, 
  recordSuccess, 
  recordFailure 
} from "./circuit-breaker.service.js";
import { getProviderKey } from "./credentials.service.js";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ProviderName,
  ModelTier,
  RequestMetadata,
} from "../types/index.js";

interface RouteResult {
  response: ChatCompletionResponse;
  metadata: RequestMetadata;
}

interface RouteContext {
  requestId: string;
  apiKeyId: string;
  organizationId: string;
  userProviderKey?: string; // User's own API key passed in header (override)
  ipAddress?: string;
  userAgent?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getApiKeyForProvider(
  provider: ProviderName,
  organizationId: string,
  headerKey?: string
): Promise<string> {
  // Header key takes priority (per-request override)
  if (headerKey) return headerKey;
  
  // Try to get from database (user's stored keys)
  const dbKey = await getProviderKey(organizationId, provider);
  if (dbKey) return dbKey;
  
  // Fall back to env vars (for testing only)
  const configKey = config.providerKeys[provider];
  if (configKey) return configKey;
  
  throw new Error(`No API key configured for provider: ${provider}. Please add your API key at POST /v1/credentials`);
}

function getFallbackProviders(
  primaryProvider: ProviderName,
  primaryModel: string,
  userFallbacks?: string[]
): Array<{ provider: ProviderName; model: string }> {
  const fallbacks: Array<{ provider: ProviderName; model: string }> = [];
  
  // Only use user-specified fallbacks - don't auto-add providers
  // User must explicitly configure fallback_models in the request
  if (userFallbacks && userFallbacks.length > 0) {
    for (const model of userFallbacks) {
      const provider = detectProviderFromModel(model);
      if (provider && provider !== primaryProvider) {
        fallbacks.push({ provider, model });
      }
    }
  }
  
  // No auto-mapping - users must have their own keys for fallback providers
  return fallbacks;
}

async function executeWithRetry(
  provider: BaseProvider,
  request: ChatCompletionRequest,
  options: ProviderRequestOptions,
  maxRetries: number = config.providers.retries
): Promise<ChatCompletionResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await provider.chat(request, options);
      await recordSuccess(provider.name);
      return response;
    } catch (err) {
      lastError = err as Error;
      const errorMessage = lastError.message.toLowerCase();
      
      // Don't retry on 4xx errors (except 429)
      if (errorMessage.includes("400") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403") ||
          errorMessage.includes("404")) {
        throw lastError;
      }
      
      // Record failure for circuit breaker
      await recordFailure(provider.name);
      
      // Wait before retry with exponential backoff
      if (attempt < maxRetries) {
        const delay = config.providers.retryDelayMs * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

export async function routeRequest(
  request: ChatCompletionRequest,
  context: RouteContext
): Promise<RouteResult> {
  const startTime = Date.now();
  const metadata: RequestMetadata = {
    requestId: context.requestId,
    apiKeyId: context.apiKeyId,
    provider: "",
    model: request.model,
    startTime,
    cached: false,
    fallbackUsed: false,
    statusCode: 200,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  };

  // Detect primary provider from model
  const primaryProviderName = detectProviderFromModel(request.model);
  if (!primaryProviderName) {
    throw new Error(`Cannot determine provider for model: ${request.model}`);
  }

  const primaryProvider = getProvider(primaryProviderName);
  if (!primaryProvider) {
    throw new Error(`Provider not found: ${primaryProviderName}`);
  }

  // Get fallback providers
  const fallbacks = getFallbackProviders(
    primaryProviderName,
    request.model,
    request.fallback_models
  );

  // Build provider chain: primary + fallbacks
  const providerChain: Array<{ provider: BaseProvider; model: string; name: ProviderName }> = [
    { provider: primaryProvider, model: request.model, name: primaryProviderName },
    ...fallbacks
      .map(f => ({
        provider: getProvider(f.provider),
        model: f.model,
        name: f.provider,
      }))
      .filter((f): f is { provider: BaseProvider; model: string; name: ProviderName } => 
        f.provider !== undefined
      ),
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < providerChain.length; i++) {
    const { provider, model, name } = providerChain[i];
    
    // Check circuit breaker
    const canTry = await canAttempt(name);
    if (!canTry) {
      console.log(`Circuit open for ${name}, skipping...`);
      continue;
    }

    try {
      const apiKey = await getApiKeyForProvider(name, context.organizationId, context.userProviderKey);
      
      const response = await executeWithRetry(
        provider,
        { ...request, model },
        { apiKey, timeout: config.providers.timeout }
      );

      // Update metadata
      const endTime = Date.now();
      metadata.provider = name;
      metadata.model = model;
      metadata.endTime = endTime;
      metadata.latencyMs = endTime - startTime;
      metadata.fallbackUsed = i > 0;
      metadata.fallbackProvider = i > 0 ? name : undefined;
      
      if (response.usage) {
        metadata.inputTokens = response.usage.prompt_tokens;
        metadata.outputTokens = response.usage.completion_tokens;
        metadata.totalTokens = response.usage.total_tokens;
        metadata.cost = calculateCost(
          model,
          response.usage.prompt_tokens,
          response.usage.completion_tokens
        );
      }

      return { response, metadata };
    } catch (err) {
      lastError = err as Error;
      console.error(`Provider ${name} failed:`, lastError.message);
      
      // Continue to next provider in chain
    }
  }

  // All providers failed
  metadata.endTime = Date.now();
  metadata.latencyMs = metadata.endTime - startTime;
  metadata.statusCode = 502;
  metadata.errorMessage = lastError?.message || "All providers failed";

  throw new Error(metadata.errorMessage);
}

export async function routeStreamingRequest(
  request: ChatCompletionRequest,
  context: RouteContext,
  callbacks: ProviderStreamCallbacks & { onMetadata: (metadata: RequestMetadata) => void }
): Promise<void> {
  const startTime = Date.now();
  const metadata: RequestMetadata = {
    requestId: context.requestId,
    apiKeyId: context.apiKeyId,
    provider: "",
    model: request.model,
    startTime,
    cached: false,
    fallbackUsed: false,
    statusCode: 200,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  };

  const primaryProviderName = detectProviderFromModel(request.model);
  if (!primaryProviderName) {
    throw new Error(`Cannot determine provider for model: ${request.model}`);
  }

  const primaryProvider = getProvider(primaryProviderName);
  if (!primaryProvider) {
    throw new Error(`Provider not found: ${primaryProviderName}`);
  }

  const fallbacks = getFallbackProviders(
    primaryProviderName,
    request.model,
    request.fallback_models
  );

  const providerChain: Array<{ provider: BaseProvider; model: string; name: ProviderName }> = [
    { provider: primaryProvider, model: request.model, name: primaryProviderName },
    ...fallbacks
      .map(f => ({
        provider: getProvider(f.provider),
        model: f.model,
        name: f.provider,
      }))
      .filter((f): f is { provider: BaseProvider; model: string; name: ProviderName } => 
        f.provider !== undefined
      ),
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < providerChain.length; i++) {
    const { provider, model, name } = providerChain[i];
    
    const canTry = await canAttempt(name);
    if (!canTry) continue;

    try {
      const apiKey = await getApiKeyForProvider(name, context.organizationId, context.userProviderKey);
      
      metadata.provider = name;
      metadata.model = model;
      metadata.fallbackUsed = i > 0;
      metadata.fallbackProvider = i > 0 ? name : undefined;

      await provider.chatStream(
        { ...request, model },
        { apiKey, timeout: config.providers.timeout },
        {
          onChunk: callbacks.onChunk,
          onDone: (usage) => {
            const endTime = Date.now();
            metadata.endTime = endTime;
            metadata.latencyMs = endTime - startTime;
            
            if (usage) {
              metadata.inputTokens = usage.prompt_tokens;
              metadata.outputTokens = usage.completion_tokens;
              metadata.totalTokens = usage.total_tokens;
              metadata.cost = calculateCost(
                model,
                usage.prompt_tokens,
                usage.completion_tokens
              );
            }
            
            callbacks.onMetadata(metadata);
            callbacks.onDone(usage);
          },
          onError: callbacks.onError,
        }
      );

      await recordSuccess(name);
      return;
    } catch (err) {
      lastError = err as Error;
      await recordFailure(name);
    }
  }

  metadata.statusCode = 502;
  metadata.errorMessage = lastError?.message || "All providers failed";
  callbacks.onError(lastError || new Error(metadata.errorMessage));
}
