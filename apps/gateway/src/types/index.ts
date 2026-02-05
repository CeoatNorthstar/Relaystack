// Plan tier configuration
export interface PlanLimits {
  monthlyRequests: number;
  requestsPerMinute: number;
  logRetentionDays: number;
  maxProjects: number;
  maxSeats: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    monthlyRequests: 50_000,
    requestsPerMinute: 60,
    logRetentionDays: 7,
    maxProjects: 1,
    maxSeats: 1,
  },
  STARTER: {
    monthlyRequests: 500_000,
    requestsPerMinute: 60,
    logRetentionDays: 30,
    maxProjects: 3,
    maxSeats: 5,
  },
  GROWTH: {
    monthlyRequests: 5_000_000,
    requestsPerMinute: 60,
    logRetentionDays: 90,
    maxProjects: 10,
    maxSeats: 20,
  },
  ENTERPRISE: {
    monthlyRequests: 25_000_000,
    requestsPerMinute: 60,
    logRetentionDays: 365,
    maxProjects: Infinity,
    maxSeats: Infinity,
  },
};

// Overage pricing: $0.15 per 1,000 requests
export const OVERAGE_PRICE_PER_1K = 0.15;

// Provider types
export type ProviderName = 
  | "openai" 
  | "anthropic" 
  | "google" 
  | "groq" 
  | "mistral" 
  | "together" 
  | "perplexity" 
  | "cohere";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  fallback_models?: string[];
  // RelayStack specific
  cache?: boolean;
  cache_ttl?: number;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: "stop" | "length" | "content_filter" | null;
}

export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: ChatCompletionUsage;
}

export interface StreamChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: {
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason: string | null;
  }[];
}

export interface ProviderConfig {
  name: ProviderName;
  baseUrl: string;
  authHeader: string;
  models: string[];
}

export interface RequestMetadata {
  requestId: string;
  apiKeyId: string;
  provider: string;
  model: string;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  cached: boolean;
  fallbackUsed: boolean;
  fallbackProvider?: string;
  statusCode: number;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Model tier mapping for fallback
export type ModelTier = "premium" | "standard" | "fast";

export interface ModelInfo {
  provider: ProviderName;
  model: string;
  tier: ModelTier;
  inputPricePer1k: number;
  outputPricePer1k: number;
  contextWindow: number;
}
