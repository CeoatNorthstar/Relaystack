import { FastifyInstance } from "fastify";
import { checkDatabaseConnection } from "../lib/db.js";
import { checkRedisConnection } from "../lib/redis.js";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    const [dbOk, redisOk] = await Promise.all([
      checkDatabaseConnection(),
      checkRedisConnection(),
    ]);

    const status = dbOk && redisOk ? "ok" : "degraded";
    const statusCode = status === "ok" ? 200 : 503;

    return reply.code(statusCode).send({
      status,
      db: dbOk ? "ok" : "error",
      redis: redisOk ? "ok" : "error",
      timestamp: new Date().toISOString(),
    });
  });
}
