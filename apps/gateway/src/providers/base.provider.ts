import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  ProviderName,
  ModelTier,
} from "../types/index.js";

export interface ProviderRequestOptions {
  apiKey: string;
  timeout?: number;
  signal?: AbortSignal;
}

export interface ProviderStreamCallbacks {
  onChunk: (chunk: StreamChunk) => void;
  onDone: (usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
  onError: (error: Error) => void;
}

export abstract class BaseProvider {
  abstract name: ProviderName;
  abstract baseUrl: string;
  abstract models: string[];
  
  abstract chat(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions
  ): Promise<ChatCompletionResponse>;
  
  abstract chatStream(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions,
    callbacks: ProviderStreamCallbacks
  ): Promise<void>;
  
  supportsModel(model: string): boolean {
    return this.models.some(m => 
      model.toLowerCase().startsWith(m.toLowerCase()) ||
      m.toLowerCase().startsWith(model.toLowerCase())
    );
  }
  
  protected async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...init,
        signal: init.signal || controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  protected parseSSELine(line: string): any | null {
    if (!line.startsWith("data: ")) return null;
    const data = line.slice(6);
    if (data === "[DONE]") return { done: true };
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

// Model pricing (per 1K tokens)
export const MODEL_PRICING: Record<string, { input: number; output: number; tier: ModelTier }> = {
  // OpenAI
  "gpt-4o": { input: 0.005, output: 0.015, tier: "premium" },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006, tier: "fast" },
  "gpt-4-turbo": { input: 0.01, output: 0.03, tier: "premium" },
  "gpt-4": { input: 0.03, output: 0.06, tier: "premium" },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015, tier: "fast" },
  
  // Anthropic
  "claude-3-opus": { input: 0.015, output: 0.075, tier: "premium" },
  "claude-3-sonnet": { input: 0.003, output: 0.015, tier: "standard" },
  "claude-3-haiku": { input: 0.00025, output: 0.00125, tier: "fast" },
  "claude-3.5-sonnet": { input: 0.003, output: 0.015, tier: "premium" },
  
  // Google
  "gemini-1.5-pro": { input: 0.00125, output: 0.005, tier: "premium" },
  "gemini-1.5-flash": { input: 0.000075, output: 0.0003, tier: "fast" },
  "gemini-pro": { input: 0.0005, output: 0.0015, tier: "standard" },
  
  // Groq
  "llama-3.1-70b-versatile": { input: 0.00059, output: 0.00079, tier: "standard" },
  "llama-3.1-8b-instant": { input: 0.00005, output: 0.00008, tier: "fast" },
  "mixtral-8x7b-32768": { input: 0.00024, output: 0.00024, tier: "standard" },
  
  // Mistral
  "mistral-large": { input: 0.004, output: 0.012, tier: "premium" },
  "mistral-medium": { input: 0.0027, output: 0.0081, tier: "standard" },
  "mistral-small": { input: 0.001, output: 0.003, tier: "fast" },
  
  // Together
  "meta-llama/Llama-3-70b-chat-hf": { input: 0.0009, output: 0.0009, tier: "standard" },
  "meta-llama/Llama-3-8b-chat-hf": { input: 0.0002, output: 0.0002, tier: "fast" },
  
  // Perplexity
  "llama-3.1-sonar-large-128k-online": { input: 0.001, output: 0.001, tier: "premium" },
  "llama-3.1-sonar-small-128k-online": { input: 0.0002, output: 0.0002, tier: "fast" },
  
  // Cohere
  "command-r-plus": { input: 0.003, output: 0.015, tier: "premium" },
  "command-r": { input: 0.0005, output: 0.0015, tier: "standard" },
};

// Model tier mapping for fallback
export const MODEL_TIER_MAP: Record<ModelTier, Record<ProviderName, string>> = {
  premium: {
    openai: "gpt-4o",
    anthropic: "claude-3.5-sonnet",
    google: "gemini-1.5-pro",
    groq: "llama-3.1-70b-versatile",
    mistral: "mistral-large",
    together: "meta-llama/Llama-3-70b-chat-hf",
    perplexity: "llama-3.1-sonar-large-128k-online",
    cohere: "command-r-plus",
  },
  standard: {
    openai: "gpt-4o-mini",
    anthropic: "claude-3-sonnet",
    google: "gemini-pro",
    groq: "mixtral-8x7b-32768",
    mistral: "mistral-medium",
    together: "meta-llama/Llama-3-70b-chat-hf",
    perplexity: "llama-3.1-sonar-small-128k-online",
    cohere: "command-r",
  },
  fast: {
    openai: "gpt-3.5-turbo",
    anthropic: "claude-3-haiku",
    google: "gemini-1.5-flash",
    groq: "llama-3.1-8b-instant",
    mistral: "mistral-small",
    together: "meta-llama/Llama-3-8b-chat-hf",
    perplexity: "llama-3.1-sonar-small-128k-online",
    cohere: "command-r",
  },
};

export function getModelTier(model: string): ModelTier {
  const pricing = MODEL_PRICING[model];
  return pricing?.tier || "standard";
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  
  return (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
}
