import { db } from "../lib/db.js";
import { encrypt, decrypt } from "../lib/crypto.js";
import type { ProviderName } from "../types/index.js";

export interface StoredCredential {
  id: string;
  providerId: string;
  providerSlug: string;
  isDefault: boolean;
  createdAt: Date;
}

// Store a provider API key (encrypted)
export async function storeProviderKey(
  organizationId: string,
  providerSlug: ProviderName,
  apiKey: string,
  isDefault: boolean = true
): Promise<StoredCredential> {
  // Find or create provider
  let provider = await db.provider.findUnique({
    where: { slug: providerSlug },
  });

  if (!provider) {
    provider = await db.provider.create({
      data: {
        name: providerSlug.charAt(0).toUpperCase() + providerSlug.slice(1),
        slug: providerSlug,
        baseUrl: getProviderBaseUrl(providerSlug),
        authType: "bearer",
      },
    });
  }

  // If setting as default, unset other defaults for this provider/org
  if (isDefault) {
    await db.providerCredential.updateMany({
      where: {
        providerId: provider.id,
        organizationId,
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }

  // Encrypt and store the key
  const encryptedKey = encrypt(apiKey);

  const credential = await db.providerCredential.create({
    data: {
      providerId: provider.id,
      organizationId,
      apiKey: encryptedKey,
      isDefault,
    },
  });

  return {
    id: credential.id,
    providerId: provider.id,
    providerSlug,
    isDefault: credential.isDefault,
    createdAt: credential.createdAt,
  };
}

// Get decrypted API key for a provider
export async function getProviderKey(
  organizationId: string,
  providerSlug: ProviderName
): Promise<string | null> {
  const provider = await db.provider.findUnique({
    where: { slug: providerSlug },
  });

  if (!provider) return null;

  const credential = await db.providerCredential.findFirst({
    where: {
      providerId: provider.id,
      organizationId,
      isDefault: true,
    },
  });

  if (!credential) return null;

  try {
    return decrypt(credential.apiKey);
  } catch {
    console.error(`Failed to decrypt API key for ${providerSlug}`);
    return null;
  }
}

// List all provider credentials for an organization (without decrypting)
export async function listProviderCredentials(
  organizationId: string
): Promise<Array<{
  id: string;
  provider: string;
  isDefault: boolean;
  createdAt: Date;
}>> {
  const credentials = await db.providerCredential.findMany({
    where: { organizationId },
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });

  return credentials.map((c) => ({
    id: c.id,
    provider: c.provider.slug,
    isDefault: c.isDefault,
    createdAt: c.createdAt,
  }));
}

// Delete a provider credential
export async function deleteProviderCredential(
  credentialId: string,
  organizationId: string
): Promise<boolean> {
  const result = await db.providerCredential.deleteMany({
    where: {
      id: credentialId,
      organizationId,
    },
  });

  return result.count > 0;
}

// Update a provider credential
export async function updateProviderCredential(
  credentialId: string,
  organizationId: string,
  updates: { apiKey?: string; isDefault?: boolean }
): Promise<boolean> {
  const data: any = {};

  if (updates.apiKey) {
    data.apiKey = encrypt(updates.apiKey);
  }

  if (updates.isDefault !== undefined) {
    data.isDefault = updates.isDefault;

    // If setting as default, unset others
    if (updates.isDefault) {
      const credential = await db.providerCredential.findUnique({
        where: { id: credentialId },
      });

      if (credential) {
        await db.providerCredential.updateMany({
          where: {
            providerId: credential.providerId,
            organizationId,
            isDefault: true,
            NOT: { id: credentialId },
          },
          data: { isDefault: false },
        });
      }
    }
  }

  const result = await db.providerCredential.updateMany({
    where: {
      id: credentialId,
      organizationId,
    },
    data,
  });

  return result.count > 0;
}

function getProviderBaseUrl(provider: ProviderName): string {
  const urls: Record<ProviderName, string> = {
    openai: "https://api.openai.com/v1",
    anthropic: "https://api.anthropic.com/v1",
    google: "https://generativelanguage.googleapis.com/v1beta",
    groq: "https://api.groq.com/openai/v1",
    mistral: "https://api.mistral.ai/v1",
    together: "https://api.together.xyz/v1",
    perplexity: "https://api.perplexity.ai",
    cohere: "https://api.cohere.ai/v1",
  };
  return urls[provider];
}
