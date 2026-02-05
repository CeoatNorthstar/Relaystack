# RelayStack SDK

Unified AI Gateway client for Node.js. Route requests to OpenAI, Anthropic, Google, Groq, and more through a single API.

## Installation

```bash
npm install relaystack
```

## Quick Start

```typescript
import { RelayStack } from "relaystack";

// Initialize with your RelayStack token
const relay = new RelayStack({
  token: process.env.RELAYSTACK_TOKEN,
});

// Make AI requests
const response = await relay.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);
```

## Environment Variables

The SDK auto-detects your token from environment variables:

```bash
# .env
RELAYSTACK_TOKEN=your_token_here
```

```typescript
// No config needed - auto-detects from env
const relay = new RelayStack();
```

## Configuration

```typescript
const relay = new RelayStack({
  token: "your_token",           // Your RelayStack API token
  baseUrl: "http://localhost:8080", // Gateway URL (default: localhost)
  timeout: 30000,                // Request timeout in ms (default: 30000)
});
```

## Supported Models

Use any model from supported providers:

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-3.5-turbo |
| Anthropic | claude-3-opus, claude-3-sonnet, claude-3-haiku |
| Google | gemini-1.5-pro, gemini-1.5-flash |
| Groq | llama-3-70b, mixtral-8x7b |
| Mistral | mistral-large, mistral-medium |
| Together | llama-3, qwen |
| Perplexity | pplx-70b-online |
| Cohere | command-r-plus |

## Fallback Models

Specify fallback models for automatic failover:

```typescript
const response = await relay.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
  fallback_models: ["claude-3-sonnet", "gemini-1.5-pro"],
});
```

## Managing Provider Keys

Store your AI provider API keys via the SDK or dashboard:

```typescript
// List configured providers
const { credentials } = await relay.credentials.list();

// Add a provider key
await relay.credentials.create("openai", "sk-...");

// Delete a provider key
await relay.credentials.delete(credentialId);
```

## Error Handling

```typescript
import { RelayStack, RelayStackError } from "relaystack";

try {
  const response = await relay.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello!" }],
  });
} catch (error) {
  if (error instanceof RelayStackError) {
    console.error(`Error ${error.status}: ${error.message}`);
    // error.status: 401 (invalid token), 429 (rate limit), etc.
  }
}
```

## Health Check

```typescript
const health = await relay.health();
// { status: "ok", db: "ok", redis: "ok", timestamp: "..." }
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  ProviderName,
} from "relaystack";
```

## License

MIT
