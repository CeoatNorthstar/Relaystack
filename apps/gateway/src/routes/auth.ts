import { FastifyPluginAsync } from "fastify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";
import { config } from "../config.js";

const JWT_SECRET = config.auth.jwtSecret || process.env.JWT_SECRET || "dev-secret-change-in-production";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  refreshToken: string;
}

function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email, type: "access" },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { userId, email, type: "refresh" },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  return { accessToken, refreshToken };
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register new user
  fastify.post<{ Body: RegisterBody }>("/auth/register", async (request, reply) => {
    const { email, password, name } = request.body;

    if (!email || !password || !name) {
      return reply.status(400).send({ error: "Email, password, and name are required" });
    }

    if (password.length < 8) {
      return reply.status(400).send({ error: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(409).send({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create organization first
    const orgSlug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
    const organization = await db.organization.create({
      data: {
        name: `${name}'s Organization`,
        slug: orgSlug,
      },
    });

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        memberships: {
          create: {
            role: "OWNER",
            organizationId: organization.id,
          },
        },
      },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    const tokens = generateTokens(user.id, user.email);

    // Store refresh token
    await db.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizations: user.memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          role: m.role,
        })),
      },
      ...tokens,
    });
  });

  // Login
  fastify.post<{ Body: LoginBody }>("/auth/login", async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: "Email and password are required" });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const tokens = generateTokens(user.id, user.email);

    // Store refresh token
    await db.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizations: user.memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          role: m.role,
        })),
      },
      ...tokens,
    });
  });

  // Refresh token
  fastify.post<{ Body: RefreshBody }>("/auth/refresh", async (request, reply) => {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return reply.status(400).send({ error: "Refresh token is required" });
    }

    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; email: string; type: string };

      if (payload.type !== "refresh") {
        return reply.status(401).send({ error: "Invalid token type" });
      }

      // Check if token exists in DB
      const storedToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        return reply.status(401).send({ error: "Invalid or expired refresh token" });
      }

      // Revoke old token
      await db.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      // Generate new tokens
      const tokens = generateTokens(storedToken.userId, storedToken.user.email);

      // Store new refresh token
      await db.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: storedToken.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return reply.send(tokens);
    } catch (err) {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }
  });

  // Get current user
  fastify.get("/auth/me", async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "No token provided" });
    }

    const token = authHeader.slice(7);

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; type: string };

      if (payload.type !== "access") {
        return reply.status(401).send({ error: "Invalid token type" });
      }

      const user = await db.user.findUnique({
        where: { id: payload.userId },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        organizations: user.memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          role: m.role,
        })),
      });
    } catch (err) {
      return reply.status(401).send({ error: "Invalid token" });
    }
  });

  // Logout (revoke refresh token)
  fastify.post<{ Body: RefreshBody }>("/auth/logout", async (request, reply) => {
    const { refreshToken } = request.body;

    if (refreshToken) {
      await db.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }

    return reply.send({ success: true });
  });
};

export default authRoutes;
