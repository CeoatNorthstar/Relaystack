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

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: { type: "text"; text: string }[];
  model: string;
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence";
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseProvider {
  name: ProviderName = "anthropic";
  baseUrl = "https://api.anthropic.com/v1";
  models = [
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-3-5-sonnet-20240620",
    "claude-3-opus",
    "claude-3-sonnet",
    "claude-3-haiku",
    "claude-3.5-sonnet",
  ];

  private transformToAnthropic(messages: ChatMessage[]): {
    system?: string;
    messages: AnthropicMessage[];
  } {
    let system: string | undefined;
    const transformedMessages: AnthropicMessage[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        system = msg.content;
      } else {
        transformedMessages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    return { system, messages: transformedMessages };
  }

  private transformFromAnthropic(response: AnthropicResponse): ChatCompletionResponse {
    return {
      id: response.id,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: response.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: response.content[0]?.text || "",
          },
          finish_reason: response.stop_reason === "end_turn" ? "stop" : "length",
        },
      ],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async chat(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions
  ): Promise<ChatCompletionResponse> {
    const { system, messages } = this.transformToAnthropic(request.messages);

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": options.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.max_tokens || 4096,
          system,
          messages,
          temperature: request.temperature,
        }),
        signal: options.signal,
      },
      options.timeout || config.providers.timeout
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as any;
      throw new Error(
        `Anthropic API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const anthropicResponse = await response.json() as AnthropicResponse;
    return this.transformFromAnthropic(anthropicResponse);
  }

  async chatStream(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions,
    callbacks: ProviderStreamCallbacks
  ): Promise<void> {
    const { system, messages } = this.transformToAnthropic(request.messages);

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": options.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.max_tokens || 4096,
          system,
          messages,
          temperature: request.temperature,
          stream: true,
        }),
        signal: options.signal,
      },
      options.timeout || config.providers.timeout
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as any;
      throw new Error(
        `Anthropic API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";
    let messageId = "";
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
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = this.parseSSELine(trimmed);
          if (!data) continue;

          if (data.type === "message_start") {
            messageId = data.message?.id || "";
            inputTokens = data.message?.usage?.input_tokens || 0;
          }

          if (data.type === "content_block_delta" && data.delta?.text) {
            callbacks.onChunk({
              id: messageId,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: request.model,
              choices: [
                {
                  index: 0,
                  delta: { content: data.delta.text },
                  finish_reason: null,
                },
              ],
            });
          }

          if (data.type === "message_delta") {
            outputTokens = data.usage?.output_tokens || 0;
          }

          if (data.type === "message_stop") {
            callbacks.onDone({
              prompt_tokens: inputTokens,
              completion_tokens: outputTokens,
              total_tokens: inputTokens + outputTokens,
            });
            return;
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
