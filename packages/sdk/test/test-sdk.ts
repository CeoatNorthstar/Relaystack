import { RelayStack } from "../src/index.js";

/**
 * Test the RelayStack SDK
 * 
 * Setup:
 * 1. Start gateway: cd apps/gateway && npx tsx src/index.ts
 * 2. Set env: export RELAYSTACK_TOKEN=TEST_KEY_123
 * 3. Run: npx tsx test/test-sdk.ts
 */
async function testGateway() {
  console.log("🚀 Testing RelayStack SDK\n");

  // Initialize SDK - auto-detects RELAYSTACK_TOKEN from env
  const client = new RelayStack({
    token: process.env.RELAYSTACK_TOKEN || "TEST_KEY_123",
    baseUrl: "http://localhost:8080",
  });

  // Test 1: Health check
  console.log("1. Testing health endpoint...");
  try {
    const health = await client.health();
    console.log("   ✓ Health:", health);
  } catch (err) {
    console.log("   ✗ Health check failed:", err);
  }

  // Test 2: List credentials
  console.log("\n2. Listing provider credentials...");
  try {
    const { credentials, supportedProviders } = await client.credentials.list();
    console.log("   ✓ Supported providers:", supportedProviders.join(", "));
    console.log("   ✓ Your credentials:", credentials.length ? credentials.map(c => c.provider).join(", ") : "(none yet)");
  } catch (err: any) {
    console.log("   ✗ List credentials failed:", err.message);
  }

  // Test 3: Add OpenAI credential (requires real key to work)
  console.log("\n3. Adding OpenAI credential...");
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const { credential } = await client.credentials.create("openai", openaiKey);
      console.log("   ✓ Credential stored:", credential.provider);
    } catch (err: any) {
      console.log("   ⚠ Store credential:", err.message);
    }
  } else {
    console.log("   ⚠ Skipped (set OPENAI_API_KEY env var to test)");
  }

  // Test 4: Chat completions
  console.log("\n4. Testing chat.completions.create...");
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Say hello in one word." },
      ],
    });
    console.log("   ✓ Response:", response.choices[0]?.message.content);
    console.log("   ✓ Model:", response.model);
    console.log("   ✓ Tokens:", response.usage);
  } catch (err: any) {
    console.log("   ✗ Chat completion failed:", err.message);
    console.log("   💡 Add your OpenAI API key in the dashboard first!");
  }

  // Test 5: Invalid API key
  console.log("\n5. Testing with invalid token...");
  const badClient = new RelayStack({
    token: "INVALID_KEY",
    baseUrl: "http://localhost:8080",
  });
  try {
    await badClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("   ✗ Should have thrown an error");
  } catch (err: any) {
    if (err.status === 401) {
      console.log("   ✓ Correctly rejected with 401:", err.message);
    } else {
      console.log("   ✗ Unexpected error:", err);
    }
  }

  console.log("\n✅ SDK tests complete!");
  console.log("\n📖 Usage in your project:");
  console.log(`
  // .env
  RELAYSTACK_TOKEN=your_token_here

  // app.ts
  import { RelayStack } from "relaystack";
  
  const relay = new RelayStack(); // auto-detects env token
  
  const response = await relay.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello!" }],
  });
  `);
}

testGateway().catch(console.error);
