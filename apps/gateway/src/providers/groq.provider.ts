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

// Groq uses OpenAI-compatible API
export class GroqProvider extends BaseProvider {
  name: ProviderName = "groq";
  baseUrl = "https://api.groq.com/openai/v1";
  models = [
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama-3.2-90b-text-preview",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
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
        `Groq API error: ${response.status} - ${error.error?.message || response.statusText}`
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
        `Groq API error: ${response.status} - ${error.error?.message || response.statusText}`
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

          if (data.x_groq?.usage) {
            usage = {
              prompt_tokens: data.x_groq.usage.prompt_tokens,
              completion_tokens: data.x_groq.usage.completion_tokens,
              total_tokens: data.x_groq.usage.total_tokens,
            };
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
