import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { prisma } from "../lib/db.js";

const JWT_SECRET = config.auth.jwtSecret || process.env.JWT_SECRET || "dev-secret-change-in-production";

export interface AuthContext {
  type: "jwt" | "api_key";
  userId?: string;
  email?: string;
  name?: string;
  apiKeyId?: string;
  organizationId?: string;
}

// Extend FastifyRequest
declare module "fastify" {
  interface FastifyRequest {
    apiKey?: string;
    organizationId?: string;
    authContext?: AuthContext;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip auth for health endpoint and auth routes
  if (request.url === "/health" || request.url.startsWith("/auth/")) {
    return;
  }

  const authHeader = request.headers.authorization;
  const apiKeyHeader = request.headers["x-api-key"];

  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (typeof apiKeyHeader === "string") {
    token = apiKeyHeader;
  }

  if (!token) {
    reply.code(401).send({
      error: "Unauthorized",
      message: "API key or JWT token required",
    });
    return;
  }

  // Check if it looks like a JWT (has 3 parts separated by dots)
  const isJwt = token.split(".").length === 3;

  if (isJwt) {
    // Verify JWT
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        type: string;
      };

      if (payload.type !== "access") {
        reply.code(401).send({
          error: "Unauthorized",
          message: "Invalid token type",
        });
        return;
      }

      // Get user and organization
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          memberships: {
            include: { organization: true },
            take: 1,
          },
        },
      });

      if (!user) {
        reply.code(401).send({
          error: "Unauthorized",
          message: "User not found",
        });
        return;
      }

      const defaultOrg = user.memberships[0]?.organization;

      request.authContext = {
        type: "jwt",
        userId: user.id,
        email: user.email,
        name: user.name || undefined,
        organizationId: defaultOrg?.id,
      };
      request.organizationId = defaultOrg?.id;
      return;
    } catch (err) {
      reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid JWT token",
      });
      return;
    }
  }

  // API key / stackToken auth
  // First check the test key (for development)
  if (token === config.auth.testApiKey) {
    request.apiKey = token;
    request.authContext = {
      type: "api_key",
      apiKeyId: "test",
    };

    // Try to get default org for test key
    const defaultOrg = await prisma.organization.findFirst();
    if (defaultOrg) {
      request.organizationId = defaultOrg.id;
      request.authContext.organizationId = defaultOrg.id;
    }
    return;
  }

  // Check database for API key
  const apiKeyRecord = await prisma.apiKey.findFirst({
    where: {
      key: token,
      revokedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      environment: {
        include: {
          project: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
  });

  if (apiKeyRecord) {
    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    request.apiKey = token;
    request.organizationId = apiKeyRecord.environment.project.organizationId;
    request.authContext = {
      type: "api_key",
      apiKeyId: apiKeyRecord.id,
      organizationId: apiKeyRecord.environment.project.organizationId,
    };
    return;
  }

  // No valid auth found
  reply.code(401).send({
    error: "Unauthorized",
    message: "Invalid API key",
  });
}

export function registerAuthHook(app: FastifyInstance): void {
  app.addHook("preHandler", authMiddleware);
}
