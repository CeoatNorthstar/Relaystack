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

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: { parts: { text: string }[]; role: string };
    finishReason: string;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleProvider extends BaseProvider {
  name: ProviderName = "google";
  baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  models = [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-pro",
    "gemini-1.0-pro",
  ];

  private transformToGemini(messages: ChatMessage[]): {
    systemInstruction?: { parts: { text: string }[] };
    contents: GeminiContent[];
  } {
    let systemInstruction: { parts: { text: string }[] } | undefined;
    const contents: GeminiContent[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemInstruction = { parts: [{ text: msg.content }] };
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    return { systemInstruction, contents };
  }

  private transformFromGemini(response: GeminiResponse, model: string): ChatCompletionResponse {
    const candidate = response.candidates[0];
    return {
      id: `gemini-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: candidate?.content?.parts?.[0]?.text || "",
          },
          finish_reason: candidate?.finishReason === "STOP" ? "stop" : "length",
        },
      ],
      usage: response.usageMetadata ? {
        prompt_tokens: response.usageMetadata.promptTokenCount,
        completion_tokens: response.usageMetadata.candidatesTokenCount,
        total_tokens: response.usageMetadata.totalTokenCount,
      } : undefined,
    };
  }

  async chat(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions
  ): Promise<ChatCompletionResponse> {
    const { systemInstruction, contents } = this.transformToGemini(request.messages);
    const model = request.model.startsWith("gemini") ? request.model : "gemini-1.5-pro";

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/models/${model}:generateContent?key=${options.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction,
          contents,
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.max_tokens,
          },
        }),
        signal: options.signal,
      },
      options.timeout || config.providers.timeout
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as any;
      throw new Error(
        `Google API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const geminiResponse = await response.json() as GeminiResponse;
    return this.transformFromGemini(geminiResponse, model);
  }

  async chatStream(
    request: ChatCompletionRequest,
    options: ProviderRequestOptions,
    callbacks: ProviderStreamCallbacks
  ): Promise<void> {
    const { systemInstruction, contents } = this.transformToGemini(request.messages);
    const model = request.model.startsWith("gemini") ? request.model : "gemini-1.5-pro";

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/models/${model}:streamGenerateContent?key=${options.apiKey}&alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction,
          contents,
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.max_tokens,
          },
        }),
        signal: options.signal,
      },
      options.timeout || config.providers.timeout
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as any;
      throw new Error(
        `Google API error: ${response.status} - ${error.error?.message || response.statusText}`
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
          if (!data || data.done) continue;

          if (data.usageMetadata) {
            usage = {
              prompt_tokens: data.usageMetadata.promptTokenCount,
              completion_tokens: data.usageMetadata.candidatesTokenCount,
              total_tokens: data.usageMetadata.totalTokenCount,
            };
          }

          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            callbacks.onChunk({
              id: `gemini-${Date.now()}`,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model,
              choices: [
                {
                  index: 0,
                  delta: { content: data.candidates[0].content.parts[0].text },
                  finish_reason: null,
                },
              ],
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
