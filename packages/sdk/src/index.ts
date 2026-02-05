/**
 * RelayStack SDK - AI Gateway Client
 * 
 * Usage:
 * ```typescript
 * import { RelayStack } from "relaystack";
 * 
 * const relay = new RelayStack({
 *   token: process.env.RELAYSTACK_TOKEN,
 * });
 * 
 * const response = await relay.chat.completions.create({
 *   model: "gpt-4o",
 *   messages: [{ role: "user", content: "Hello!" }],
 * });
 * ```
 */

export interface RelayStackConfig {
  /** Your RelayStack API token (from dashboard) */
  token?: string;
  /** @deprecated Use `token` instead */
  apiKey?: string;
  /** Gateway URL (defaults to http://localhost:8080, use https://api.relaystack.io in production) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  /** Model to use (e.g., "gpt-4o", "claude-3-sonnet", "gemini-1.5-pro") */
  model: string;
  /** Array of messages in the conversation */
  messages: ChatMessage[];
  /** Sampling temperature (0-2) */
  temperature?: number;
  /** Maximum tokens to generate */
  max_tokens?: number;
  /** Enable streaming response */
  stream?: boolean;
  /** Fallback models if primary fails */
  fallback_models?: string[];
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: "stop" | "length" | "content_filter" | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface HealthResponse {
  status: "ok" | "degraded";
  db: "ok" | "error";
  redis: "ok" | "error";
  timestamp: string;
}

export type ProviderName = 
  | "openai" 
  | "anthropic" 
  | "google" 
  | "groq" 
  | "mistral" 
  | "together" 
  | "perplexity" 
  | "cohere";

export interface Credential {
  id: string;
  provider: ProviderName;
  isDefault: boolean;
  createdAt: string;
}

export interface CredentialsResponse {
  credentials: Credential[];
  supportedProviders: ProviderName[];
}

export class RelayStackError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "RelayStackError";
  }
}

class ChatCompletions {
  constructor(private client: RelayStackClient) {}

  /**
   * Create a chat completion
   * @example
   * ```typescript
   * const response = await relay.chat.completions.create({
   *   model: "gpt-4o",
   *   messages: [{ role: "user", content: "Hello!" }],
   * });
   * console.log(response.choices[0].message.content);
   * ```
   */
  async create(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    return this.client.request<ChatCompletionResponse>(
      "POST",
      "/v1/chat/completions",
      request
    );
  }
}

class Chat {
  completions: ChatCompletions;

  constructor(client: RelayStackClient) {
    this.completions = new ChatCompletions(client);
  }
}

class Credentials {
  constructor(private client: RelayStackClient) {}

  /** List all configured provider credentials */
  async list(): Promise<CredentialsResponse> {
    return this.client.request<CredentialsResponse>("GET", "/v1/credentials");
  }

  /** Add a new provider API key */
  async create(provider: ProviderName, apiKey: string, isDefault = true): Promise<{ credential: Credential }> {
    return this.client.request<{ credential: Credential }>("POST", "/v1/credentials", {
      provider,
      apiKey,
      isDefault,
    });
  }

  /** Delete a provider credential */
  async delete(credentialId: string): Promise<void> {
    await this.client.request("DELETE", `/v1/credentials/${credentialId}`);
  }

  /** Update a provider credential */
  async update(credentialId: string, updates: { apiKey?: string; isDefault?: boolean }): Promise<void> {
    await this.client.request("PATCH", `/v1/credentials/${credentialId}`, updates);
  }
}

/**
 * RelayStack Client - AI Gateway SDK
 * 
 * @example
 * ```typescript
 * import { RelayStack } from "relaystack";
 * 
 * const relay = new RelayStack({
 *   token: process.env.RELAYSTACK_TOKEN,
 * });
 * 
 * // Make AI requests (provider keys stored in dashboard)
 * const response = await relay.chat.completions.create({
 *   model: "gpt-4o",
 *   messages: [{ role: "user", content: "Hello!" }],
 * });
 * ```
 */
class RelayStackClient {
  private token: string;
  private baseUrl: string;
  private timeout: number;

  /** Chat completions API */
  chat: Chat;
  /** Manage provider API keys */
  credentials: Credentials;

  constructor(config: RelayStackConfig = {}) {
    // Support both `token` and legacy `apiKey`
    this.token = config.token || config.apiKey || this.getEnvToken();
    
    if (!this.token) {
      throw new RelayStackError(
        "RelayStack token is required. Set RELAYSTACK_TOKEN environment variable or pass { token: '...' }",
        401,
        "MISSING_TOKEN"
      );
    }
    
    this.baseUrl = config.baseUrl?.replace(/\/$/, "") || "http://localhost:8080";
    this.timeout = config.timeout || 30000;

    this.chat = new Chat(this);
    this.credentials = new Credentials(this);
  }

  private getEnvToken(): string {
    // Check common environment variable names
    if (typeof process !== "undefined" && process.env) {
      return (
        process.env.RELAYSTACK_TOKEN ||
        process.env.RELAYSTACK_API_KEY ||
        process.env.RELAY_STACK_TOKEN ||
        ""
      );
    }
    return "";
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const data = await response.json() as Record<string, unknown>;

      if (!response.ok) {
        throw new RelayStackError(
          (data.message as string) || "Request failed",
          response.status,
          data.code as string | undefined
        );
      }

      return data as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /** Check gateway health status */
  async health(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json() as Promise<HealthResponse>;
  }
}

export { RelayStackClient as RelayStack };
export default RelayStackClient;
