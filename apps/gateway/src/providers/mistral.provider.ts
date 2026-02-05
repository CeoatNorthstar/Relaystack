import {
  BaseProvider,
  type ProviderRequestOptions,
  type ProviderStreamCallbacks,
} from "./base.provider.js";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ProviderName,
} from "../types/index.js";
import { config } from "../config.js";

// Mistral uses OpenAI-compatible API
export class MistralProvider extends BaseProvider {
  name: ProviderName = "mistral";
  baseUrl = "https://api.mistral.ai/v1";
  models = [
    "mistral-large-latest",
    "mistral-large",
    "mistral-medium-latest",
    "mistral-medium",
    "mistral-small-latest",
    "mistral-small",
    "open-mixtral-8x7b",
    "open-mistral-7b",
  ];

  async chat(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions
  ): Promise<ChatCompletionResponse> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.max_tokens,
          stream: false,
        }),
        signal: options.signal,
      },
      options.timeout || config.providers.timeout
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as any;
      throw new Error(
        `Mistral API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    return response.json() as Promise<ChatCompletionResponse>;
  }

  async chatStream(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions,
    callbacks: ProviderStreamCallbacks
  ): Promise<void> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.max_tokens,
          stream: true,
        }),
        signal: options.signal,
      },
      options.timeout || config.providers.timeout
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as any;
      throw new Error(
        `Mistral API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";
    let usage: any = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = this.parseSSELine(trimmed);
          if (!data) continue;
          if (data.done) {
            callbacks.onDone(usage);
            return;
          }

          if (data.usage) {
            usage = data.usage;
          }

          if (data.choices?.[0]) {
            callbacks.onChunk({
              id: data.id,
              object: "chat.completion.chunk",
              created: data.created,
              model: data.model,
              choices: data.choices,
            });
          }
        }
      }

      callbacks.onDone(usage);
    } catch (err) {
      callbacks.onError(err as Error);
    }
  }
}
