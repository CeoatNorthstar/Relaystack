import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { db } from "./lib/db.js";
import { redis, connectRedis } from "./lib/redis.js";
import { registerAuthHook } from "./middleware/auth.js";
import { registerRateLimitHook } from "./middleware/rate-limit.js";
import { healthRoutes } from "./routes/health.js";
import { chatRoutes } from "./routes/chat.js";
import { credentialsRoutes } from "./routes/credentials.js";
import authRoutes from "./routes/auth.js";

const app = Fastify({
  logger: {
    level: config.nodeEnv === "production" ? "info" : "debug",
  },
});

// Enable CORS for dashboard
app.register(cors, {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
});

// Register auth routes BEFORE auth middleware (no auth required)
app.register(authRoutes);

// Register middleware hooks
registerAuthHook(app);
registerRateLimitHook(app);

// Register protected routes
app.register(healthRoutes);
app.register(chatRoutes);
app.register(credentialsRoutes);

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down...");
  await app.close();
  await db.$disconnect();
  redis.disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start server
async function start() {
  try {
    // Connect to Redis (optional - skip if not configured)
    if (config.redis.url && config.redis.url !== "redis://localhost:6379") {
      try {
        await connectRedis();
        console.log("✓ Connected to Redis");
      } catch (redisErr) {
        console.warn("⚠ Redis not available, using Cloudflare KV for rate limiting");
      }
    } else {
      console.log("⚠ Redis not configured, using Cloudflare KV for rate limiting");
    }

    // Test database connection
    await db.$connect();
    console.log("✓ Connected to PostgreSQL");
    console.log(`  Database URL: ${config.database.url.replace(/:[^:@]+@/, ':***@')}`);

    // Start server
    await app.listen({ port: config.port, host: "0.0.0.0" });
    console.log(`✓ Gateway server running at http://localhost:${config.port}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
