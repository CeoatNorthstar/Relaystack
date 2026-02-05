import { redis } from "../lib/redis.js";
import { config } from "../config.js";
import type { ProviderName } from "../types/index.js";

const CIRCUIT_PREFIX = "circuit:";

export type CircuitState = "closed" | "open" | "half-open";

interface CircuitStatus {
  state: CircuitState;
  failures: number;
  lastFailure: number | null;
  openUntil: number | null;
}

export async function getCircuitState(provider: ProviderName): Promise<CircuitStatus> {
  const key = `${CIRCUIT_PREFIX}${provider}`;
  const data = await redis.hgetall(key);
  
  if (!data || Object.keys(data).length === 0) {
    return {
      state: "closed",
      failures: 0,
      lastFailure: null,
      openUntil: null,
    };
  }
  
  const failures = parseInt(data.failures || "0", 10);
  const openUntil = data.openUntil ? parseInt(data.openUntil, 10) : null;
  const lastFailure = data.lastFailure ? parseInt(data.lastFailure, 10) : null;
  
  const now = Date.now();
  
  // Check if circuit should transition from open to half-open
  if (openUntil && now >= openUntil) {
    return {
      state: "half-open",
      failures,
      lastFailure,
      openUntil,
    };
  }
  
  // Circuit is open if we have an openUntil in the future
  if (openUntil && now < openUntil) {
    return {
      state: "open",
      failures,
      lastFailure,
      openUntil,
    };
  }
  
  return {
    state: "closed",
    failures,
    lastFailure,
    openUntil: null,
  };
}

export async function recordFailure(provider: ProviderName): Promise<CircuitStatus> {
  const key = `${CIRCUIT_PREFIX}${provider}`;
  const now = Date.now();
  
  const pipeline = redis.pipeline();
  pipeline.hincrby(key, "failures", 1);
  pipeline.hset(key, "lastFailure", now.toString());
  pipeline.expire(key, Math.ceil(config.circuitBreaker.timeoutMs / 1000) * 2);
  
  await pipeline.exec();
  
  const failures = await redis.hget(key, "failures");
  const failureCount = parseInt(failures || "0", 10);
  
  // Check if we should open the circuit
  if (failureCount >= config.circuitBreaker.threshold) {
    const openUntil = now + config.circuitBreaker.timeoutMs;
    await redis.hset(key, "openUntil", openUntil.toString());
    
    return {
      state: "open",
      failures: failureCount,
      lastFailure: now,
      openUntil,
    };
  }
  
  return {
    state: "closed",
    failures: failureCount,
    lastFailure: now,
    openUntil: null,
  };
}

export async function recordSuccess(provider: ProviderName): Promise<void> {
  const key = `${CIRCUIT_PREFIX}${provider}`;
  
  // Reset failures on success
  await redis.del(key);
}

export async function isCircuitOpen(provider: ProviderName): Promise<boolean> {
  const status = await getCircuitState(provider);
  return status.state === "open";
}

export async function canAttempt(provider: ProviderName): Promise<boolean> {
  const status = await getCircuitState(provider);
  // Can attempt if closed or half-open (testing)
  return status.state !== "open";
}

export async function resetCircuit(provider: ProviderName): Promise<void> {
  const key = `${CIRCUIT_PREFIX}${provider}`;
  await redis.del(key);
}

export async function getAllCircuitStates(): Promise<Record<ProviderName, CircuitStatus>> {
  const providers: ProviderName[] = [
    "openai", "anthropic", "google", "groq", 
    "mistral", "together", "perplexity", "cohere"
  ];
  
  const states: Record<string, CircuitStatus> = {};
  
  for (const provider of providers) {
    states[provider] = await getCircuitState(provider);
  }
  
  return states as Record<ProviderName, CircuitStatus>;
}
