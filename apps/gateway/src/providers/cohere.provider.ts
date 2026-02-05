import {
  BaseProvider,
  type ProviderRequestOptions,
  type ProviderStreamCallbacks,
} from "./base.provider.js";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  ProviderName,
} from "../types/index.js";
import { config } from "../config.js";

interface CohereMessage {
  role: "USER" | "CHATBOT" | "SYSTEM";
  message: string;
}

interface CohereResponse {
  response_id: string;
  text: string;
  generation_id: string;
  meta: {
    tokens: {
      input_tokens: number;
      output_tokens: number;
    };
  };
}

export class CohereProvider extends BaseProvider {
  name: ProviderName = "cohere";
  baseUrl = "https://api.cohere.ai/v1";
  models = [
    "command-r-plus",
    "command-r",
    "command",
    "command-light",
  ];

  private transformToCohere(messages: ChatMessage[]): {
    preamble?: string;
    message: string;
    chat_history: CohereMessage[];
  } {
    let preamble: string | undefined;
    const chatHistory: CohereMessage[] = [];
    let lastUserMessage = "";

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "system") {
        preamble = msg.content;
      } else if (i === messages.length - 1 && msg.role === "user") {
        lastUserMessage = msg.content;
      } else {
        chatHistory.push({
          role: msg.role === "assistant" ? "CHATBOT" : "USER",
          message: msg.content,
        });
      }
    }

    return { preamble, message: lastUserMessage, chat_history: chatHistory };
  }

  private transformFromCohere(response: CohereResponse, model: string): ChatCompletionResponse {
    return {
      id: response.response_id,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: response.text,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: response.meta.tokens.input_tokens,
        completion_tokens: response.meta.tokens.output_tokens,
        total_tokens: response.meta.tokens.input_tokens + response.meta.tokens.output_tokens,
      },
    };
  }

  async chat(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions
  ): Promise<ChatCompletionResponse> {
    const { preamble, message, chat_history } = this.transformToCohere(request.messages);

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          message,
          preamble,
          chat_history,
          temperature: request.temperature,
          max_tokens: request.max_tokens,
        }),
        signal: options.signal,
      },
      options.timeout || config.providers.timeout
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as any;
      throw new Error(
        `Cohere API error: ${response.status} - ${error.message || response.statusText}`
      );
    }

    const cohereResponse = await response.json() as CohereResponse;
    return this.transformFromCohere(cohereResponse, request.model);
  }

  async chatStream(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions,
    callbacks: ProviderStreamCallbacks
  ): Promise<void> {
    const { preamble, message, chat_history } = this.transformToCohere(request.messages);

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          message,
          preamble,
          chat_history,
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
        `Cohere API error: ${response.status} - ${error.message || response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const data = JSON.parse(trimmed);

            if (data.event_type === "text-generation" && data.text) {
              callbacks.onChunk({
                id: `cohere-${Date.now()}`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: request.model,
                choices: [
                  {
                    index: 0,
                    delta: { content: data.text },
                    finish_reason: null,
                  },
                ],
              });
            }

            if (data.event_type === "stream-end") {
              if (data.response?.meta?.tokens) {
                inputTokens = data.response.meta.tokens.input_tokens;
                outputTokens = data.response.meta.tokens.output_tokens;
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      callbacks.onDone({
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
      });
    } catch (err) {
      callbacks.onError(err as Error);
    }
  }
}
