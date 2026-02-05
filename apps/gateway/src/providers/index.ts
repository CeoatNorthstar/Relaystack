import type { ProviderName } from "../types/index.js";
import { BaseProvider } from "./base.provider.js";
import { OpenAIProvider } from "./openai.provider.js";
import { AnthropicProvider } from "./anthropic.provider.js";
import { GoogleProvider } from "./google.provider.js";
import { GroqProvider } from "./groq.provider.js";
import { MistralProvider } from "./mistral.provider.js";
import { TogetherProvider } from "./together.provider.js";
import { PerplexityProvider } from "./perplexity.provider.js";
import { CohereProvider } from "./cohere.provider.js";

// Provider registry
const providers: Map<ProviderName, BaseProvider> = new Map();

// Initialize all providers
providers.set("openai", new OpenAIProvider());
providers.set("anthropic", new AnthropicProvider());
providers.set("google", new GoogleProvider());
providers.set("groq", new GroqProvider());
providers.set("mistral", new MistralProvider());
providers.set("together", new TogetherProvider());
providers.set("perplexity", new PerplexityProvider());
providers.set("cohere", new CohereProvider());

export function getProvider(name: ProviderName): BaseProvider | undefined {
  return providers.get(name);
}

export function getAllProviders(): BaseProvider[] {
  return Array.from(providers.values());
}

export function getProviderForModel(model: string): BaseProvider | undefined {
  // Check each provider to see if it supports this model
  for (const provider of providers.values()) {
    if (provider.supportsModel(model)) {
      return provider;
    }
  }
  return undefined;
}

export function detectProviderFromModel(model: string): ProviderName | undefined {
  const modelLower = model.toLowerCase();
  
  // OpenAI models
  if (modelLower.startsWith("gpt-") || modelLower.includes("openai")) {
    return "openai";
  }
  
  // Anthropic models
  if (modelLower.startsWith("claude")) {
    return "anthropic";
  }
  
  // Google models
  if (modelLower.startsWith("gemini")) {
    return "google";
  }
  
  // Groq models (often llama or mixtral hosted on Groq)
  if (modelLower.includes("groq")) {
    return "groq";
  }
  
  // Mistral models
  if (modelLower.startsWith("mistral") || modelLower.includes("mixtral")) {
    return "mistral";
  }
  
  // Together models (often have org prefix)
  if (modelLower.includes("meta-llama") || modelLower.includes("qwen") || modelLower.includes("together")) {
    return "together";
  }
  
  // Perplexity models
  if (modelLower.includes("sonar") || modelLower.includes("perplexity")) {
    return "perplexity";
  }
  
  // Cohere models
  if (modelLower.startsWith("command")) {
    return "cohere";
  }
  
  // Check all providers for model support
  for (const [name, provider] of providers.entries()) {
    if (provider.supportsModel(model)) {
      return name;
    }
  }
  
  // Default to OpenAI if can't determine
  return "openai";
}

export {
  BaseProvider,
  OpenAIProvider,
  AnthropicProvider,
  GoogleProvider,
  GroqProvider,
  MistralProvider,
  TogetherProvider,
  PerplexityProvider,
  CohereProvider,
};
