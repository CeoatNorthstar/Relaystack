import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_KEY_COOKIE = "relaystack_api_key";

export function getApiKey(): string | undefined {
  return Cookies.get(API_KEY_COOKIE);
}

export function setApiKey(key: string): void {
  Cookies.set(API_KEY_COOKIE, key, { expires: 30 }); // 30 days
}

export function removeApiKey(): void {
  Cookies.remove(API_KEY_COOKIE);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.message || "Request failed",
      response.status,
      data.code
    );
  }

  return data as T;
}

// Types
export interface HealthResponse {
  status: "ok" | "degraded";
  db: "ok" | "error";
  redis: "ok" | "error" | "not_configured";
  timestamp: string;
}

export interface Credential {
  id: string;
  provider: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CredentialsResponse {
  credentials: Credential[];
  supportedProviders: string[];
}

export interface RequestStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  errorRate: number;
}

// API functions
export const api = {
  health: () => request<HealthResponse>("/health"),
  
  credentials: {
    list: () => request<CredentialsResponse>("/v1/credentials"),
    create: (provider: string, apiKey: string) =>
      request<{ credential: Credential }>("/v1/credentials", {
        method: "POST",
        body: JSON.stringify({ provider, apiKey }),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/v1/credentials/${id}`, {
        method: "DELETE",
      }),
  },
  
  // Validate API key by calling health with it
  validateKey: async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
