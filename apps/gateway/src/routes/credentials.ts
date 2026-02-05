import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  storeProviderKey,
  listProviderCredentials,
  deleteProviderCredential,
  updateProviderCredential,
} from "../services/credentials.service.js";
import type { ProviderName } from "../types/index.js";

const VALID_PROVIDERS: ProviderName[] = [
  "openai",
  "anthropic",
  "google",
  "groq",
  "mistral",
  "together",
  "perplexity",
  "cohere",
];

interface CreateKeyBody {
  provider: ProviderName;
  apiKey: string;
  isDefault?: boolean;
}

interface UpdateKeyBody {
  apiKey?: string;
  isDefault?: boolean;
}

export async function credentialsRoutes(app: FastifyInstance): Promise<void> {
  // List all provider credentials
  app.get("/v1/credentials", async (request: FastifyRequest, reply: FastifyReply) => {
    const organizationId = (request as any).organizationId || "default-org";

    const credentials = await listProviderCredentials(organizationId);

    return reply.send({
      credentials,
      supportedProviders: VALID_PROVIDERS,
    });
  });

  // Add a new provider credential
  app.post("/v1/credentials", async (request: FastifyRequest, reply: FastifyReply) => {
    const organizationId = (request as any).organizationId || "default-org";
    const body = request.body as CreateKeyBody;

    if (!body.provider || !body.apiKey) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "provider and apiKey are required",
      });
    }

    if (!VALID_PROVIDERS.includes(body.provider)) {
      return reply.code(400).send({
        error: "Bad Request",
        message: `Invalid provider. Supported: ${VALID_PROVIDERS.join(", ")}`,
      });
    }

    try {
      const credential = await storeProviderKey(
        organizationId,
        body.provider,
        body.apiKey,
        body.isDefault ?? true
      );

      return reply.code(201).send({
        message: "Credential stored successfully",
        credential: {
          id: credential.id,
          provider: credential.providerSlug,
          isDefault: credential.isDefault,
        },
      });
    } catch (err) {
      console.error("Failed to store credential:", err);
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to store credential",
      });
    }
  });

  // Update a provider credential
  app.patch("/v1/credentials/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const organizationId = (request as any).organizationId || "default-org";
    const { id } = request.params as { id: string };
    const body = request.body as UpdateKeyBody;

    if (!body.apiKey && body.isDefault === undefined) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "apiKey or isDefault is required",
      });
    }

    const updated = await updateProviderCredential(id, organizationId, body);

    if (!updated) {
      return reply.code(404).send({
        error: "Not Found",
        message: "Credential not found",
      });
    }

    return reply.send({
      message: "Credential updated successfully",
    });
  });

  // Delete a provider credential
  app.delete("/v1/credentials/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const organizationId = (request as any).organizationId || "default-org";
    const { id } = request.params as { id: string };

    const deleted = await deleteProviderCredential(id, organizationId);

    if (!deleted) {
      return reply.code(404).send({
        error: "Not Found",
        message: "Credential not found",
      });
    }

    return reply.send({
      message: "Credential deleted successfully",
    });
  });
}
